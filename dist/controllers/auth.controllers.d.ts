import { Request } from "express";
import { ConfiguredResponse } from "../types/api.types.js";
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const signup: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<void | ConfiguredResponse>}
*/
export declare const googleCallbackHandler: (req: Request, res: ConfiguredResponse) => Promise<void>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const login: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const logout: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const refresh: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export declare const getAuthState: (req: Request, res: ConfiguredResponse) => Promise<ConfiguredResponse>;
//# sourceMappingURL=auth.controllers.d.ts.map