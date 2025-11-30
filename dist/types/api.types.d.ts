import { Request, Response } from "express";
import { ValidationError } from "express-validator";
export interface TokenPayload {
    accessToken: {
        userId: string;
        fullname: string;
    };
    refreshToken: {
        userId: string;
    };
}
export interface ConfiguredRequest extends Request {
    data: unknown;
    accessTokenPayload: TokenPayload["accessToken"];
    refreshTokenPayload: TokenPayload["refreshToken"];
}
export interface ApiResponse {
    success: boolean;
    message: string;
    data?: unknown;
    error?: {
        code: string;
        statusCode: number;
        details?: unknown;
    };
}
export type ExtendedValidationError = ValidationError & {
    path?: string;
    param?: string;
};
export type ConfiguredResponse = Response<ApiResponse>;
//# sourceMappingURL=api.types.d.ts.map