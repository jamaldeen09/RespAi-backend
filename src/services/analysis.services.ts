import axios from "axios";
import { ApiResponse } from "../types/api.types.js";
import { AnalysisRequestCredentials } from "../types/reqPayload.types.js";
import OpenAI from "openai";
import { envData } from "../config/env.config.js";
import { TypedExpectedData } from "../types/resPayload.types.js";

/**  
 @param {AnalysisRequestCredentials} analysisRequest - Holds data for clients request
 @returns {Promise<ApiResponse>}
*/
export const makeAxiosRequest = async (analysisRequest: AnalysisRequestCredentials): Promise<ApiResponse> => {
    try {
        // ** Convert headers array to object ** \\
        const headersObject = analysisRequest.headers.reduce((acc, header) => {
            if (header.key && header.value) {
                acc[header.key] = header.value.toString();
            }
            return acc;
        }, {} as Record<string, string>);

        // ** Convert queryParams array to object ** \\
        const queryParamsObject = analysisRequest.queryParams.reduce((acc, param) => {
            if (param.key && param.value) {
                acc[param.key] = param.value.toString();
            }
            return acc;
        }, {} as Record<string, string>);


        // ** Handle body data safely ** \\
        let requestData: any = undefined;
        if (analysisRequest.body) {
            try {
                requestData = JSON.parse(analysisRequest.body);
            } catch (parseError) {
                // ** If it's not valid JSON, send as raw string ** \\
                requestData = analysisRequest.body;
            }
        }

        // ** Make axios request ** \\
        const response = await axios({
            method: analysisRequest.method,
            url: analysisRequest.endpoint,
            headers: headersObject,
            params: queryParamsObject,
            data: requestData,
        });

        return {
            success: true,
            message: "Request successful",
            data: {
                body: response.data,
                headers: response.headers,
                status: response.status,
                queryParams: queryParamsObject
            },
        };
    } catch (err: any) {
        if (err.response) {
            return {
                success: true,
                message: `Request failed with status ${err.response.status}`,
                data: {
                    headers: err.response.headers,
                    body: err.response.data,
                    status: err.response.status
                }
            };
        } else if (err.request) {
            // ** The request was made but no response was received **
            return {
                success: false,
                message: "No response received from the server",
                error: {
                    code: "NO_RESPONSE",
                    statusCode: 502,
                },
            };
        } else {
            return {
                success: false,
                message: "Error setting up the request",
                error: {
                    code: "SETUP_ERROR",
                    statusCode: 500,
                },
            };
        }
    }
};


/** 
 @param {ApiResponse} apiResponse - Contains the fetch results from axios
 @param {string} url - Contains the url the requesting client wishes to analyze
 @returns {Promise<ApiResponse>}
*/
export const analyzeApiResponse = async (apiResponse: ApiResponse, url: string): Promise<ApiResponse> => {
    // ** Init open ai ** \\
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: envData.OPENAI_API_KEY,
        defaultHeaders: {
            "HTTP-Referer": "https://localhost:3000",
            "X-Title": "ByteLearn"
        }
    });

    const { data } = apiResponse;
    const typedData = data as TypedExpectedData;

    try {
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a technical API Response Analyst. Your job is to examine HTTP responses and provide clear, accurate, and actionable explanations with no filler.

Analyze:
- URL
- Status
- Headers
- Body

Deliver:
- What the endpoint is doing
- Status code meaning
- Body explanation
- Issues or inconsistencies
- Fix suggestions
- Any security/performance red flags`
                },
                {
                    role: "user",
                    content: `Analyze the following API response.

URL: ${url}

Status: ${typedData.status}

Headers:
${JSON.stringify(typedData.headers, null, 2)}

Body:
${JSON.stringify(typedData.body, null, 2)}
`
                }
            ],
        });

        const raw = completion.choices?.[0]?.message?.content || "No analysis available";

        return {
            success: true,
            message: "Endpoint successfully analyzed",
            data: raw
        };

    } catch (err) {
        console.error(`Error occured in "analyzeApiResponse" in file "analysis.services.ts": ${err}`);

        return {
            success: false,
            message: "Failed to analyze endpoint",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            }
        };
    }
};