import mongoose, { Schema } from "mongoose";
;
// ** Actual schema ** \
const UserSchema = new Schema({
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
        default: false,
    }
}, { timestamps: true });
// ** Model ** \\
export const User = mongoose.model("User", UserSchema);
//# sourceMappingURL=User.js.map