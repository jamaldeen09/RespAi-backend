import { NextFunction, Request } from "express";
import { ConfiguredResponse } from "../types/api.types.js";
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @param {NextFunction} next - Used to allow a requesting client move to the next operation after going through any logic in this middleware
*/
export declare const verifyAccessToken: (req: Request, res: ConfiguredResponse, next: NextFunction) => Promise<ConfiguredResponse | undefined>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @param {NextFunction} next - Used to allow a requesting client move to the next operation after going through any logic in this middleware
*/
export declare const verifyRefreshToken: (req: Request, res: ConfiguredResponse, next: NextFunction) => Promise<ConfiguredResponse | undefined>;
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @param {NextFunction} next - Used to allow a requesting client move to the next operation after going through any logic in this middleware
*/
export declare const expressValidationHandler: (req: Request, res: ConfiguredResponse, next: NextFunction) => Promise<ConfiguredResponse | undefined>;
//# sourceMappingURL=auth.middlewares.d.ts.map