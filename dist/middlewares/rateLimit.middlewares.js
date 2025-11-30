import { RateLimitIp } from "../models/RateLimitIp.js";
import { RateLimitUser } from "../models/RateLimitUser.js";
/**
 @param {{key: "ip" | "user", limit: number, windowMs: number}} options - Determines what type of rate limit is needed and also the specifications of it
*/
export const rateLimit = (options) => {
    return async (req, res, next) => {
        try {
            const now = Date.now();
            const windowStart = now - options.windowMs;
            let identifier;
            // ** Choose key type ** \\
            if (options.key === "ip") {
                identifier = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
                identifier = identifier.replace("::ffff:", "");
                // ** Find or create record ** \\
                let record = await RateLimitIp.findOne({ ip: identifier });
                const debugMessage = record ? `Found record: ${record}` : `Record was not found will soon create record`;
                if (!record) {
                    await RateLimitIp.create({
                        ip: identifier,
                        windowStart: new Date(),
                        count: 1,
                    });
                    return next();
                }
                // ** If window expired → reset ** \\
                if (record.windowStart.getTime() < windowStart) {
                    await RateLimitIp.findByIdAndUpdate(record._id, {
                        $set: {
                            windowStart: new Date(),
                            count: 1,
                        }
                    });
                    return next();
                }
                // ** Within window → check limit ** \\
                if (record.count >= options.limit) {
                    return res.status(429).json({
                        success: false,
                        message: "Too many requests. Please try again later.",
                        error: {
                            code: "RATE_LIMIT_EXCEEDED",
                            statusCode: 429,
                        },
                    });
                }
                const rateLimitUpdate = await RateLimitIp.findByIdAndUpdate(record._id, {
                    $inc: { count: 1 }
                }, { new: true });
                return next();
            }
            // === USER KEY ===
            if (options.key === "user") {
                const userId = req.accessTokenPayload.userId;
                const debugMessage = userId ? `Received user id: ${userId}` : "User id was not found therefore user is not authorized";
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized access",
                        error: {
                            code: "UNAUTHORIZED",
                            statusCode: 401,
                        },
                    });
                }
                let record = await RateLimitUser.findOne({ userId });
                const debugMessage2 = record ? `Found record: ${record}` : `Record was not found will soon create record`;
                if (!record) {
                    await RateLimitUser.create({
                        userId,
                        windowStart: new Date(),
                        count: 1,
                    });
                    return next();
                }
                if (record.windowStart.getTime() < windowStart) {
                    await RateLimitUser.findByIdAndUpdate(record._id, {
                        $set: {
                            windowStart: new Date(),
                            count: 1
                        }
                    });
                    return next();
                }
                if (record.count >= options.limit) {
                    return res.status(429).json({
                        success: false,
                        message: "Request limit exceeded. Slow down.",
                        error: {
                            code: "RATE_LIMIT_EXCEEDED",
                            statusCode: 429,
                        },
                    });
                }
                ;
                await RateLimitUser.findByIdAndUpdate(record._id, {
                    $inc: { count: 1 }
                });
                return next();
            }
        }
        catch (err) {
            console.error("Rate limit error:", err);
            return res.status(500).json({
                success: false,
                message: "A server error occurred while processing rate limit",
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    statusCode: 500,
                },
            });
        }
    };
};
//# sourceMappingURL=rateLimit.middlewares.js.map