import mongoose, { Document, Model, Schema } from "mongoose"

// ** Initial type in which schema references from ** \\
export interface IRateLimitUser {
    userId: mongoose.Types.ObjectId;
    windowStart: Date,
    count: number
};


// ** Query and document type ** \\
export type IRateLimitUserDocument = (Document & IRateLimitUser);
export type IRateLimitUserQuery = IRateLimitUserDocument | null;


// ** Actual schema ** \\
const RateLimitUserSchema = new Schema<IRateLimitUser, Model<IRateLimitUser>>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    windowStart: {
        type: Date,
        required: true,
        default: Date.now,
    },
    count: {
        type: Number,
        required: true,
        default: 1,
    },
});


// ** Model ** \\
export const RateLimitUser = mongoose.model<IRateLimitUser, Model<IRateLimitUser>>("RateLimitUse", RateLimitUserSchema);