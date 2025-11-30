import { ApiResponse } from "../types/api.types.js";
import { AnalysisRequestCredentials } from "../types/reqPayload.types.js";
/**
 @param {AnalysisRequestCredentials} analysisRequest - Holds data for clients request
 @returns {Promise<ApiResponse>}
*/
export declare const makeAxiosRequest: (analysisRequest: AnalysisRequestCredentials) => Promise<ApiResponse>;
/**
 @param {ApiResponse} apiResponse - Contains the fetch results from axios
 @param {string} url - Contains the url the requesting client wishes to analyze
 @returns {Promise<ApiResponse>}
*/
export declare const analyzeApiResponse: (apiResponse: ApiResponse, url: string) => Promise<ApiResponse>;
//# sourceMappingURL=analysis.services.d.ts.map