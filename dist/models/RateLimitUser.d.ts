import mongoose, { Document } from "mongoose";
export interface IRateLimitUser {
    userId: mongoose.Types.ObjectId;
    windowStart: Date;
    count: number;
}
export type IRateLimitUserDocument = (Document & IRateLimitUser);
export type IRateLimitUserQuery = IRateLimitUserDocument | null;
export declare const RateLimitUser: mongoose.Model<IRateLimitUser, {}, {}, {}, mongoose.Document<unknown, {}, IRateLimitUser, {}, {}> & IRateLimitUser & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=RateLimitUser.d.ts.map