import { validateToken } from "../services/auth.services.js";
import { matchedData, validationResult } from "express-validator";
/**
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @param {NextFunction} next - Used to allow a requesting client move to the next operation after going through any logic in this middleware
*/
// ** Middleware handles access token verification and validation ** \\
export const verifyAccessToken = async (req, res, next) => {
    try {
        // ** Use custom servie ** \\
        const validationResponse = await validateToken(req, res, "accessToken");
        if (!validationResponse.success)
            return res.status(validationResponse.error?.statusCode).json(validationResponse);
        next();
    }
    catch (err) {
        console.error(`Error occured in "verifyAccessToken" middleware in file "auth.middlewares.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured during token validation",
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
 @param {NextFunction} next - Used to allow a requesting client move to the next operation after going through any logic in this middleware
*/
// ** Middleware handles refresh token verification and validation ** \\
export const verifyRefreshToken = async (req, res, next) => {
    try {
        // ** Use custom servie ** \\
        const validationResponse = await validateToken(req, res, "refreshToken");
        if (!validationResponse.success)
            return res.status(validationResponse.error?.statusCode).json(validationResponse);
        next();
    }
    catch (err) {
        console.error(`Error occured in "verifyRefreshToken" middleware in file "auth.middlewares.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured during token validation",
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
 @param {NextFunction} next - Used to allow a requesting client move to the next operation after going through any logic in this middleware
*/
// ** Middleware handle's express validator responses ** \\
export const expressValidationHandler = async (req, res, next) => {
    try {
        // ** Extract errors ** \\
        const errors = validationResult(req);
        // ** Check if there are any errors ** \\
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map((err) => {
                const e = err;
                return {
                    field: e.path ?? e.param ?? 'unknown',
                    message: e.msg,
                };
            });
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: {
                    code: "VALIDATION_ERROR",
                    statusCode: 400,
                    details: {
                        errors: formattedErrors
                    }
                }
            });
        }
        // ** Attach matched data to request ** \\
        req.data = matchedData(req);
        next();
    }
    catch (err) {
        console.error(`A server error occured in "expressValidationHandler" in file "auth.middlewares.ts": ${err}`);
        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured during data validation",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        });
    }
};
//# sourceMappingURL=auth.middlewares.js.map