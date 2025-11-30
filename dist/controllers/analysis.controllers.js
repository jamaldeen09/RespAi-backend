import { User } from "../models/User.js";
import { analyzeApiResponse, makeAxiosRequest } from "../services/analysis.services.js";
import { deleteOperation, readOperation, writeOperation } from "../services/cache.services.js";
import { Analysis } from "../models/Analysis.js";
import { getUserProfilePayload } from "../services/auth.services.js";
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const newAnalysis = async (req, res) => {
    const userId = (req.accessTokenPayload).userId;
    const analysisRequest = req.data;
    try {
        // ** ---- FETCH USER ---- ** \\
        const user = await User.findById(userId)
            .select("creditRefillDate plan credits enableAiAnalysis");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                error: { code: "NOT_FOUND", statusCode: 404 }
            });
        }
        // ** ---- CREDIT REFILL CHECK ---- ** \\
        const now = new Date();
        if (now > user.creditRefillDate) {
            const nextRefill = new Date();
            nextRefill.setDate(nextRefill.getDate() + 30);
            const updated = await User.findByIdAndUpdate(userId, {
                $set: { credits: 50, creditRefillDate: nextRefill }
            }, { new: true }).lean().select("_id fullname email avatar credits plan role createdAt updatedAt enableAiAnalysis creditRefillDate");
            if (updated)
                writeOperation(`user:${updated._id.toString()}`, getUserProfilePayload(updated));
            // ** Replace user object for continued logic ** \\
            user.credits = updated?.credits ?? user.credits;
            user.creditRefillDate = updated?.creditRefillDate ?? user.creditRefillDate;
        }
        // ** ---- MAKE API REQUEST (always allowed) ---- **\\
        const apiFetchResult = await makeAxiosRequest(analysisRequest);
        if (!apiFetchResult.success) {
            return res.status(apiFetchResult.error?.statusCode || 500).json(apiFetchResult);
        }
        const typedApiResponseData = apiFetchResult.data;
        const responseHeaders = Object.entries(typedApiResponseData.headers || {}).map(([key, value]) => ({
            key,
            value: String(value)
        }));
        const requestQueryParams = Object.entries(typedApiResponseData.queryParams || {}).map(([key, value]) => ({
            key,
            value: String(value)
        }));
        const response = {
            ...typedApiResponseData,
            headers: responseHeaders,
        };
        const request = {
            headers: analysisRequest.headers,
            method: analysisRequest.method,
            endpoint: analysisRequest.endpoint,
            queryParams: requestQueryParams
        };
        // ** ---- CHECK IF AI ANALYSIS IS ENABLED ---- ** \\
        if (!user.enableAiAnalysis) {
            return res.status(200).json({
                success: true,
                message: "Request successful (AI disabled)",
                data: {
                    response,
                    request,
                    aiAnalysis: null,
                    cost: 0,
                    info: "ai_disabled",
                    credits: user.credits,
                }
            });
        }
        // ** ---- CHECK CREDIT SUFFICIENCY ---- ** \\
        if (user.credits < 1) {
            return res.status(200).json({
                success: true,
                message: "Request successful (no AI due to insufficient credits)",
                data: {
                    response,
                    request,
                    aiAnalysis: null,
                    cost: 1,
                    info: "insufficient_credits",
                    credits: user.credits,
                }
            });
        }
        // ** ---- RUN AI ANALYSIS ---- ** \\
        const analysisResult = await analyzeApiResponse(apiFetchResult, analysisRequest.endpoint);
        if (!analysisResult.success) {
            return res.status(analysisResult.error?.statusCode || 500).json({
                ...analysisResult,
                data: {
                    ...(analysisResult.data || {}),
                    response,
                    request,
                    info: "analysis_error"
                }
            });
        }
        // ** ---- DEDUCT CREDITS ONLY NOW (AFTER SUCCESSFUL AI) ---- ** \\
        const updatedUser = await User.findByIdAndUpdate(userId, { $inc: { credits: -1 } }, { new: true }).lean()
            .select("_id fullname email avatar credits plan role createdAt updatedAt enableAiAnalysis creditRefillDate");
        if (updatedUser) {
            writeOperation(`user:${updatedUser._id.toString()}`, getUserProfilePayload(updatedUser));
        }
        // ** ---- FINAL SUCCESS RESPONSE ---- ** 
        return res.status(200).json({
            success: true,
            message: "Endpoint successfully analyzed",
            data: {
                response,
                request,
                aiAnalysis: analysisResult.data,
                cost: 1,
                credits: updatedUser?.credits || user.credits,
            }
        });
    }
    catch (err) {
        console.error(`Error in newAnalysis: ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occurred while analyzing the endpoint",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500
            }
        });
    }
};
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const saveAnalysis = async (req, res) => {
    // ** Extract the users id attached to request ** \\
    const userId = req.accessTokenPayload.userId;
    // ** Extract details about the analysis attached to request as well ** \\
    const analysisDetails = req.data;
    try {
        // ** Check if the user exists ** \\
        const userSavingAnAnalysis = await User.exists({ _id: userId });
        if (!userSavingAnAnalysis)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                error: {
                    code: "NOT_FOUND",
                    statusCode: 404,
                }
            });
        // ** If the user does exist the create a new AnalysisDetailDoc that references to them ** \\
        const newAnalysisDetail = await Analysis.create({
            ...analysisDetails,
            user: userSavingAnAnalysis._id
        });
        // ** Store the analysis detail doc in cache (user field is not populated it's plain mongoDb object id) ** \\
        writeOperation(`analysisDetail:${newAnalysisDetail._id}`, newAnalysisDetail);
        // ** Delete all pagination patterns ** \\
        deleteOperation("patterns", undefined, `user:${userSavingAnAnalysis._id}-analysisDetails-page:`);
        // ** Return a success response ** \\
        return res.status(201).json({
            success: true,
            message: "Request has been successfully saved"
        });
    }
    catch (err) {
        console.error(`A server error occured in "saveAnalysis controller" in file analysis.controllers.ts: ${err}`);
        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to save your requested analysis, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        });
    }
};
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const fetchSavedAnalysisDetails = async (req, res) => {
    // ** Extract the users id attached to request ** \\
    const userId = req.accessTokenPayload.userId;
    // ** Extract validated pagination data attached to request ** \\
    const { page: optionalPage, searchQuery, method, status } = req.data;
    // ** Default limit ** \\
    const limit = 9;
    // ** Makes page always exist ** \\
    const page = optionalPage || 1;
    // ** Get offset ** \\
    const offset = (page - 1) * limit;
    // ** Query ** \\
    let dbQuery = { user: userId };
    // ** Object being sent to frontend *8 \\
    let paginationData = {
        offset,
        page,
        limit,
        totalItems: 0,
        totalPages: 0,
        items: [],
    };
    // ** Prepare cache key ** \\
    let cacheKey = `user:${userId}-analysisDetails-page:${paginationData.page}-limit:${paginationData.limit}-offset:${paginationData.offset}`;
    // ** Customize cache key based off of data coming from the client ** \\
    // ** Search query based filtering ** \\
    if (searchQuery) {
        cacheKey += `-searchQuery:${searchQuery}`;
        dbQuery = {
            ...dbQuery,
            $or: [
                { "request.endpoint": { $regex: searchQuery, $options: "i" } },
                { aiAnalysis: { $regex: searchQuery, $options: "i" } }
            ],
        };
    }
    ;
    // ** Method based filtering ** \\
    if (method) {
        cacheKey += `-method:${method}`;
        dbQuery = {
            ...dbQuery,
            "request.method": method
        };
    }
    ;
    // ** Status based filtering ** \\
    if (status) {
        cacheKey += `-status:${status}`;
        dbQuery = {
            ...dbQuery,
            "response.status": status,
        };
    }
    ;
    try {
        // ** Find the total items based off of the custom db query ** \\
        const totalItems = await Analysis.countDocuments(dbQuery);
        const totalPages = Math.ceil(totalItems / limit);
        // ** Update cache key to also have total items ** \\
        cacheKey += `-totalItems:${totalItems}`;
        // ** Check if a data chunk has already been cached ** \\
        const cachedDataChunk = readOperation(cacheKey);
        if (!cachedDataChunk) {
            // ** Cache miss ** \\
            const user = await User.exists({ _id: userId });
            if (!user)
                return res.status(404).json({
                    success: false,
                    message: "Account was not found",
                    error: {
                        code: "NOT_FOUND",
                        statusCode: 404,
                    }
                });
            // ** Data chunk ** \\
            const savedAnalysisDataChunk = await Analysis.find(dbQuery)
                .lean()
                .select("_id request response aiAnalysis cost createdAt updatedAt")
                .limit(paginationData.limit)
                .skip(paginationData.offset)
                .sort({ createdAt: -1 });
            // ** Typed data chunk ** \\
            const typedSavedAnalysisDataChunk = savedAnalysisDataChunk;
            // ** Formatted chunk ** \\
            const formattedSavedAnalysisDataChunk = typedSavedAnalysisDataChunk.map((savedAnalysis) => {
                const stringifiedId = savedAnalysis?._id?.toString();
                return {
                    _id: stringifiedId,
                    response: { status: savedAnalysis?.response?.status },
                    request: {
                        endpoint: savedAnalysis?.request?.endpoint,
                        method: savedAnalysis?.request.method
                    },
                    aiAnalysis: savedAnalysis.aiAnalysis,
                    cost: savedAnalysis.cost,
                    createdAt: savedAnalysis?.createdAt?.toISOString(),
                    updatedAt: savedAnalysis?.updatedAt?.toISOString(),
                };
            }) || [];
            // ** Update pagination data before storing in cache ** \\
            paginationData = {
                ...paginationData,
                items: formattedSavedAnalysisDataChunk,
                totalItems: formattedSavedAnalysisDataChunk.length,
                totalPages,
            };
            // ** Store in cache in case of the same request ** \\
            writeOperation(cacheKey, paginationData);
            return res.status(200).json({
                success: true,
                message: "Saved analysis fetched successfully",
                data: { paginationData },
            });
        }
        else {
            // ** Cache hit ** \\
            const parsedCachedDataChunk = JSON.parse(cachedDataChunk);
            return res.status(200).json({
                success: true,
                message: "Saved analysis fetched successfully",
                data: { paginationData: parsedCachedDataChunk },
            });
        }
        ;
    }
    catch (err) {
        console.error(`A server error occured in "fetchSavedAnalysisDetails controller" in file analysis.controllers.ts: ${err}`);
        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch all your saved analysis details, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        });
    }
};
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const getSingleAnalysisDetails = async (req, res) => {
    // ** Extract the users id attached to request ** \\
    const userId = req.accessTokenPayload.userId;
    //  ** Extract validated id attached to request ** \\
    const singleAnalysisDetailsId = req.data.analysisId;
    // ** Possibly cached analysis ** \\
    const cacheKey = `singleAnalysisDetail:${singleAnalysisDetailsId}`;
    const cachedAnalysisDetails = readOperation(cacheKey);
    try {
        if (!cachedAnalysisDetails) {
            // ** Cache miss ** \\
            // ** Look for the analysis being requested ** \\
            const analysisBeingRequested = await Analysis.findOne({
                _id: singleAnalysisDetailsId,
                user: userId
            }).lean()
                .select("_id request response aiAnalysis cost createdAt updatedAt");
            if (!analysisBeingRequested)
                return res.status(404).json({
                    success: false,
                    message: "The analysis that you requested was not found",
                    error: {
                        code: "NOT_FOUND",
                        statusCode: 404
                    }
                });
            const typedAnalysis = analysisBeingRequested;
            const formattedAnalysis = {
                ...(typedAnalysis || {}),
                _id: typedAnalysis?._id?.toString(),
                createdAt: typedAnalysis?.createdAt?.toISOString(),
                updatedAt: typedAnalysis?.updatedAt?.toISOString(),
            };
            // ** Store in cache ** \\
            writeOperation(cacheKey, formattedAnalysis);
            return res.status(200).json({
                success: true,
                message: "Requested analysis details have been fetched successfully",
                data: {
                    analysisDetails: formattedAnalysis
                }
            });
        }
        else {
            // ** Cache hit ** \\
            const parsedAnalysisDetails = JSON.parse(cachedAnalysisDetails);
            return res.status(200).json({
                success: true,
                message: "Requested analysis details have been fetched successfully",
                data: {
                    analysisDetails: parsedAnalysisDetails
                }
            });
        }
    }
    catch (err) {
        console.error(`A server error occured in "getSingleAnalysis controller" in file analysis.controllers.ts: ${err}`);
        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch your requested analysis details, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        });
    }
};
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const deleteSingleAnalysisDetails = async (req, res) => {
    // ** Extract the users id attached to request ** \\
    const userId = req.accessTokenPayload.userId;
    //  ** Extract validated id attached to request ** \\
    const singleAnalysisDetailsId = req.data.analysisId;
    try {
        // ** Look for the analysis being deleted ** \\
        const analysisBeingDeleted = await Analysis.findOneAndDelete({
            _id: singleAnalysisDetailsId,
            user: userId
        }).lean()
            .select("_id request response aiAnalysis cost createdAt updatedAt");
        if (!analysisBeingDeleted)
            return res.status(404).json({
                success: false,
                message: "The analysis that you requested to delete was not found",
                error: {
                    code: "NOT_FOUND",
                    statusCode: 404
                }
            });
        // ** Delete analysis from cache patterns ** \\
        const cacheKey = `singleAnalysisDetail:${singleAnalysisDetailsId}`;
        deleteOperation("cacheKey", cacheKey);
        return res.status(200).json({
            success: true,
            message: "Request has been successfully deleted"
        });
    }
    catch (err) {
        console.error(`A server error occured in "deleteSingleAnalysisDetails controller" in file analysis.controllers.ts: ${err}`);
        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to delete your requested analysis detail, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        });
    }
};
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const disabledOrEnableAiAnalysis = async (req, res) => {
    // ** Extract the usersId attached to request ** \\
    const userId = req.accessTokenPayload.userId;
    try {
        // ** Checks if the user requesting exists ** \\
        const user = await User.findById(userId)
            .lean()
            .select("_id enableAiAnalysis");
        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                error: {
                    code: "NOT_FOUND",
                    statusCode: 404,
                }
            });
        // ** Update the user's enableAiAnalysis field ** \\
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: { enableAiAnalysis: !user.enableAiAnalysis }
        }, { new: true })
            .lean()
            .select("_id fullname email avatar credits plan role createdAt updatedAt enableAiAnalysis creditRefillDate");
        if (!updatedUser)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                error: {
                    code: "NOT_FOUND",
                    statusCode: 404,
                }
            });
        // ** Update the user in cache ** \\
        writeOperation(`user:${updatedUser._id}`, getUserProfilePayload(updatedUser));
        // ** Return a success response ** \\
        return res.status(200).json({
            success: true,
            message: `Ai analysis has been successfully ${updatedUser.enableAiAnalysis ? "enabled" : "disabled"}`,
        });
    }
    catch (err) {
        console.error(`A server error occured in "disabledOrEnableAiAnalysis controller" in file analysis.controllers.ts: ${err}`);
        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to disable/enable ai analysis, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        });
    }
};
//# sourceMappingURL=analysis.controllers.js.map