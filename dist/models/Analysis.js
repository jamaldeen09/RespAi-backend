import mongoose, { Schema } from "mongoose";
;
// ** Actual schema ** \\
const AnalysisSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        trim: true,
        required: true,
    },
    request: {
        type: {
            endpoint: {
                type: String,
                trim: true,
                required: true,
            },
            method: {
                type: String,
                enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                required: true,
                trim: true,
            },
            headers: {
                type: [{
                        key: { type: String, required: true, trim: true },
                        value: { type: mongoose.Schema.Types.Mixed, required: true },
                    }],
                default: [],
            },
            queryParams: {
                type: [{
                        key: { type: String, required: true, trim: true },
                        value: { type: mongoose.Schema.Types.Mixed, required: true }
                    }],
                default: [],
            },
            body: {
                type: String,
                default: null,
            },
        },
        required: true,
        _id: false,
    },
    response: {
        type: {
            status: {
                type: Number,
                required: true,
            },
            headers: {
                type: [{
                        key: { type: String, required: true, trim: true },
                        value: { type: mongoose.Schema.Types.Mixed, required: true },
                    }],
                default: [],
            },
            body: {
                type: String,
                default: null,
            },
        },
        _id: false,
    },
    aiAnalysis: {
        type: String,
        trim: true,
        default: null,
    },
    cost: {
        type: Number,
        required: true,
    }
}, { timestamps: true });
// ** Model ** \\
export const Analysis = mongoose.model("AnalysisDetail", AnalysisSchema);
//# sourceMappingURL=Analysis.js.map