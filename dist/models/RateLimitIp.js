import mongoose, { Schema } from "mongoose";
;
// ** Actual schema ** \\
const RateLimitIpSchema = new Schema({
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
export const RateLimitIp = mongoose.model("RateLimitIp", RateLimitIpSchema);
//# sourceMappingURL=RateLimitIp.js.map