import mongoose, { Schema } from "mongoose";
;
// ** Actual schema ** \\
const RateLimitUserSchema = new Schema({
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
export const RateLimitUser = mongoose.model("RateLimitUse", RateLimitUserSchema);
//# sourceMappingURL=RateLimitUser.js.map