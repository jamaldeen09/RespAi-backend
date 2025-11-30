import { Document, Model } from "mongoose";
export interface IRateLimitIp {
    ip: string;
    windowStart: Date;
    count: number;
}
export type IRateLimitIpDocument = (Document & IRateLimitIp);
export type IRateLimitIpQuery = IRateLimitIpDocument | null;
type RateLimitIpModelType = Model<IRateLimitIp, {}, {}>;
export declare const RateLimitIp: RateLimitIpModelType;
export {};
//# sourceMappingURL=RateLimitIp.d.ts.map