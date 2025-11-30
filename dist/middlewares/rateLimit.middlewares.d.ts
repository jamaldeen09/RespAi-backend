import { NextFunction, Request } from "express";
import { ConfiguredResponse } from "../types/api.types";
/**
 @param {{key: "ip" | "user", limit: number, windowMs: number}} options - Determines what type of rate limit is needed and also the specifications of it
*/
export declare const rateLimit: (options: {
    key: "ip" | "user";
    limit: number;
    windowMs: number;
}) => (req: Request, res: ConfiguredResponse, next: NextFunction) => Promise<void | ConfiguredResponse>;
//# sourceMappingURL=rateLimit.middlewares.d.ts.map