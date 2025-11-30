import mongoose, { Schema, Document, Model } from "mongoose";

// ** Initial type in which schema references from ** \\
export interface IUser {
    _id: mongoose.ObjectId;
    fullname: string;
    email: string;
    password: string | null;
    oAuthProviders: { provider: string, id: string }[];
    avatar: string;
    credits: number;
    plan: "starter" | "pro" | "enterprise";
    role: "admin" | "user" | "creator";
    creditRefillDate: Date;
    enableAiAnalysis: boolean;
    createdAt: Date;
    updatedAt: Date;
};

// ** Query and document type ** \\
export type IUserDocument = Document & IUser;
export type IUserQuery = IUserDocument | null;

// ** Actual schema ** \
const UserSchema = new Schema<IUser, Model<IUser>>({
    fullname: {
        type: String,
        trim: true,
        minLength: 2,
        maxLength: 50,
        required: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
    },
    password: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg"
    },
    oAuthProviders: {
        type: [{
            provider: {
                type: String,
                required: true,
                trim: true,
                enum: ["google"],
            },
            id: {
                type: String,
                trim: true,
                required: true,
            }
        }],
        default: [],
    },
    credits: {
        type: Number,
        default: 50
    },
    plan: {
        type: String,
        enum: ["starter", "pro", "enterprise"],
        default: "starter",
    },
    role: {
        type: String,
        enum: ["admin", "user", "creator"],
        default: "user"
    },
    creditRefillDate: {
        type: Date,
        required: true,
    },
    enableAiAnalysis: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });


// ** Model ** \\
export const User = mongoose.model<IUser, Model<IUser>>("User", UserSchema);