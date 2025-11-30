import jwt, { JwtPayload } from "jsonwebtoken"
import { Request, Response } from "express"
import { ApiResponse, ConfiguredRequest, TokenPayload } from "../types/api.types.js";
import { envData } from "../config/env.config.js";
import { IUserDocument, IUserQuery } from "../models/User.js";
import { UserProfile } from "../types/resPayload.types.js";
import { writeOperation } from "./cache.services.js";



/** 
  @param {Request} req - Http request that contains all data about a requesting client
  @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
  @returns {Promise<ApiResponse & { code: number }>}
*/
export const validateToken = async (
    req: Request,
    res: Response,
    tokenType: "accessToken" | "refreshToken"
): Promise<ApiResponse> => {
    try {
        // ** Extract token conditionally ** \\
        let accessToken: string | undefined;
        let refreshToken: string | undefined;

        if (tokenType === "accessToken") {
            accessToken = req.headers.authorization?.split(" ")[1];
            if (!accessToken)
                return {
                    success: false,
                    message: "Unauthorized",
                    error: {
                        code: "AUTHENTICATION_ERROR",
                        statusCode: 401,
                    }
                };


            // ** Attach decoded access token to request ** \\
            const decoded = jwt.verify(accessToken, envData.ACCESS_TOKEN_SECRET) as (TokenPayload["accessToken"] & JwtPayload);
            (req as ConfiguredRequest).accessTokenPayload = {
                userId: decoded.userId,
                fullname: decoded.fullname,
            };
            return {
                success: true,
                message: "Token validated successfully",
            }
        } else {
            refreshToken = req.headers["x-refresh-token"] as string | undefined;
            if (!refreshToken)
                return {
                    success: false,
                    message: "Unauthorized",
                    error: {
                        code: "AUTHENTICATION_ERROR",
                        statusCode: 401,
                    },
                };

            // ** Attach decoded refresh token to request ** \\
            const decoded = jwt.verify(refreshToken, envData.REFRESH_TOKEN_SECRET) as (TokenPayload["refreshToken"] & JwtPayload)
            (req as ConfiguredRequest).refreshTokenPayload = {
                userId: decoded.userId
            };
            return {
                success: true,
                message: "Token validated successfully",
            }
        };
    } catch (err: unknown) {
        // ** Error handling ** \\
        if (err instanceof jwt.JsonWebTokenError) {
            // ** Malformed token/ invalid token ** \\
            return {
                success: false,
                message: "Invalid token",
                error: {
                    code: "AUTHENTICATION_ERROR",
                    statusCode: 401,
                }
            };
        };

        if (err instanceof jwt.TokenExpiredError) {
            // ** Expired token ** \\
            return {
                success: false,
                message: "Token has expired",
                error: {
                    code: "AUTHENTICATION_ERROR",
                    statusCode: 401,
                    details: {
                        token: "Token has likely expired"
                    }
                }
            }
        };

        // ** Server error ** \\
        console.error(`Error in "validateToken" service in file "auth.services.ts": ${err}`);
        return {
            success: false,
            message: "A server error occured during token validation",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        };
    };
};

/** 
  @param { "accessToken" | "refreshToken"} tokenType - Used to determine what type of token this function should create and output
  @param {TokenPayload["accessToken"] | TokenPayload["refreshToken"]} payload - Used to determine what payload would be signed. It could be the reqired payload for accessToken or refreshToken
  @returns {string} - Returns a string which is the signed and created token
*/
export const createToken = (
    tokenType: "accessToken" | "refreshToken",
    payload: TokenPayload["accessToken"] | TokenPayload["refreshToken"]
): string => {
    if (tokenType === "accessToken") {
        const typedPayload = payload as TokenPayload["accessToken"]
        return jwt.sign(typedPayload, envData.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    }

    if (tokenType === "refreshToken") {
        const typedPayload = payload as TokenPayload["refreshToken"];
        return jwt.sign(typedPayload, envData.REFRESH_TOKEN_SECRET, { expiresIn: "5d" });
    }

    return ""
}


/** 
  @param {IUserDocument} user - The user's document stored in the database (used for extracting necessary cache data)
  @returns {void}
*/
export const cacheUser = (user: IUserDocument): void => {
    const cacheData: UserProfile = {
        _id: user._id.toString(),
        fullname: user.fullname,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        enableAiAnalysis: user.enableAiAnalysis,
        creditRefillDate: user.creditRefillDate.toISOString(),
        avatar: user.avatar
    }

    writeOperation<UserProfile>(`user-${user._id}`, cacheData);
}


/** 
  @param {IUserDocument} user - The user's document stored in the database 
  @returns {void}
*/
export const getUserProfilePayload = (user: IUserDocument): (Omit<
    IUserQuery,
    "creditRefillDate" |
    "createdAt" |
    "updatedAt"
> & {
    creditRefillDate: string;
    createdAt: string;
    updatedAt: string;
}) => {
    return {
        ...user,
        creditRefillDate: user.creditRefillDate.toISOString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }
};