import { Request, Response } from "express";
import { ApiResponse, TokenPayload } from "../types/api.types.js";
import { IUserDocument, IUserQuery } from "../models/User.js";
/**
  @param {Request} req - Http request that contains all data about a requesting client
  @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
  @returns {Promise<ApiResponse & { code: number }>}
*/
export declare const validateToken: (req: Request, res: Response, tokenType: "accessToken" | "refreshToken") => Promise<ApiResponse>;
/**
  @param { "accessToken" | "refreshToken"} tokenType - Used to determine what type of token this function should create and output
  @param {TokenPayload["accessToken"] | TokenPayload["refreshToken"]} payload - Used to determine what payload would be signed. It could be the reqired payload for accessToken or refreshToken
  @returns {string} - Returns a string which is the signed and created token
*/
export declare const createToken: (tokenType: "accessToken" | "refreshToken", payload: TokenPayload["accessToken"] | TokenPayload["refreshToken"]) => string;
/**
  @param {IUserDocument} user - The user's document stored in the database (used for extracting necessary cache data)
  @returns {void}
*/
export declare const cacheUser: (user: IUserDocument) => void;
/**
  @param {IUserDocument} user - The user's document stored in the database
  @returns {void}
*/
export declare const getUserProfilePayload: (user: IUserDocument) => (Omit<IUserQuery, "creditRefillDate" | "createdAt" | "updatedAt"> & {
    creditRefillDate: string;
    createdAt: string;
    updatedAt: string;
});
//# sourceMappingURL=auth.services.d.ts.map