import mongoose from "mongoose";
import { IAnalysis } from "../models/Analysis";
import { UnionType } from "./reqPayload.types";
export interface UserProfile {
    _id: string;
    fullname: string;
    avatar: string;
    email: string;
    credits: number;
    plan: "starter" | "pro" | "enterprise";
    role: "creator" | "admin" | "user";
    enableAiAnalysis: boolean;
    creditRefillDate: string;
    createdAt: string;
    updatedAt: string;
}
export interface TypedExpectedData {
    body: unknown;
    queryParams: Array<{
        key: string;
        value: UnionType;
    }>;
    headers: Record<any, any>;
    status: number;
}
export interface AnalysisDetailSchema {
    _id: string;
    request: IAnalysis["request"];
    response: IAnalysis["response"];
    aiAnalysis: string;
    cost: number;
    createdAt: string;
    updatedAt: string;
}
export interface LazyLoadedAnalysisDetailData {
    _id: string;
    response: {
        status: number;
    };
    request: {
        endpoint: string;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    };
    aiAnalysis: string;
    cost: number;
    createdAt: string;
    updatedAt: string;
}
export interface InitialDbAnalysisDetailSchema {
    _id: mongoose.Types.ObjectId;
    request: IAnalysis["request"];
    response: IAnalysis["response"];
    aiAnalysis: string;
    cost: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface PaginationData<T> {
    offset: number;
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    items: T;
}
//# sourceMappingURL=resPayload.types.d.ts.map