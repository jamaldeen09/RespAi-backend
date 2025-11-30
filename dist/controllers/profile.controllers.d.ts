import { Request } from "express";
import { ConfiguredResponse } from "../types/api.types.js";
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const getProfile: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const editProfile: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
//# sourceMappingURL=profile.controllers.d.ts.map