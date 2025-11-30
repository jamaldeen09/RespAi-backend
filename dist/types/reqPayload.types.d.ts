export interface SignupCredentials {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export type UnionType = string | number | boolean | object | any[] | null | undefined;
export interface AnalysisRequestCredentials {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    endpoint: string;
    headers: {
        key: string;
        value: UnionType;
    }[];
    queryParams: {
        key: string;
        value: UnionType;
    }[];
    body?: string;
}
export interface AnalysisPayload {
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
}
export interface ExpectedPaginationData {
    page?: number;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    status?: number;
    searchQuery?: string;
}
//# sourceMappingURL=reqPayload.types.d.ts.map