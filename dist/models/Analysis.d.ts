import mongoose, { Document } from "mongoose";
import { UnionType } from "../types/reqPayload.types";
export interface IAnalysis {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    request: {
        endpoint: string;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        headers: {
            key: string;
            value: UnionType;
        }[];
        queryParams: {
            key: string;
            value: UnionType;
        }[];
        body: string | null;
    };
    response: {
        status: number;
        headers: {
            key: string;
            value: UnionType;
        }[];
        body: string | null;
    };
    aiAnalysis: string;
    cost: number;
    createdAt: Date;
    updatedAt: Date;
}
export type IAnalysisDocument = Document & IAnalysis;
export type IAnalysisQuery = IAnalysisDocument | null;
export declare const Analysis: mongoose.Model<IAnalysis, {}, {}, {}, mongoose.Document<unknown, {}, IAnalysis, {}, {}> & IAnalysis & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Analysis.d.ts.map