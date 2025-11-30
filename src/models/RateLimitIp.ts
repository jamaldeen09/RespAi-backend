import mongoose, { Document, Model, Schema } from "mongoose"

// ** Initial type in which schema references from ** \\
export interface IRateLimitIp {
    ip: string,
    windowStart: Date,
    count: number
};


// ** Query and document type ** \\
export type IRateLimitIpDocument = (Document & IRateLimitIp);
export type IRateLimitIpQuery = IRateLimitIpDocument | null;

// ** Define the Mongoose Model Type to use in the check ** \\
type RateLimitIpModelType = Model<IRateLimitIp, {}, {}>;

// ** Actual schema ** \\
const RateLimitIpSchema = new Schema<IRateLimitIp, Model<IRateLimitIp>>({
    ip: {
        type: String,
        required: true,
        trim: true,
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
export const RateLimitIp = mongoose.model<IRateLimitIp, RateLimitIpModelType>("RateLimitIp", RateLimitIpSchema); 

