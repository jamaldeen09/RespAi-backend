import { ConfiguredResponse } from "../types/api.types.js";
import { Request } from "express";
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const newAnalysis: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const saveAnalysis: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const fetchSavedAnalysisDetails: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const getSingleAnalysisDetails: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const deleteSingleAnalysisDetails: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const disabledOrEnableAiAnalysis: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
//# sourceMappingURL=analysis.controllers.d.ts.map