import mongoose, { Schema, Document } from "mongoose";
export interface IUser {
    _id: mongoose.ObjectId;
    fullname: string;
    email: string;
    password: string | null;
    oAuthProviders: {
        provider: string;
        id: string;
    }[];
    avatar: string;
    credits: number;
    plan: "starter" | "pro" | "enterprise";
    role: "admin" | "user" | "creator";
    creditRefillDate: Date;
    enableAiAnalysis: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type IUserDocument = Document & IUser;
export type IUserQuery = IUserDocument | null;
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: Schema.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map