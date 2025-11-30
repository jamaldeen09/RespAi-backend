import mongoose, { Schema, Document, Model } from "mongoose";
import { UnionType } from "../types/reqPayload.types";

// ** Initial type in which schema references from ** \\
export interface IAnalysis {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    request: {
        endpoint: string;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        headers: { key: string; value: UnionType }[];
        queryParams: { key: string; value: UnionType }[];
        body: string | null;
    },
    response: {
        status: number;
        headers: { key: string; value: UnionType }[];
        body: string | null;
    }
    aiAnalysis: string;
    cost: number;
    createdAt: Date;
    updatedAt: Date;
};



// ** Query and document type ** \\
export type IAnalysisDocument = Document & IAnalysis
export type IAnalysisQuery = IAnalysisDocument | null;


// ** Actual schema ** \\
const AnalysisSchema = new Schema<IAnalysis, Model<IAnalysis>>({
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
export const Analysis = mongoose.model<IAnalysis, Model<IAnalysis>>("AnalysisDetail", AnalysisSchema);