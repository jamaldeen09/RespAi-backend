import express from "express"
import { expressValidationHandler, verifyAccessToken } from "../middlewares/auth.middlewares.js";
import { editProfile, getProfile } from "../controllers/profile.controllers.js";
import { Validation } from "../services/validation.services.js";
import { rateLimit } from "../middlewares/rateLimit.middlewares.js";
export const profileRouter: express.Router = express.Router();

// ** Validation helper ** \\
const {
    editProfileValidation
} = new Validation();

// ** Fetches a user's profile ** \\
profileRouter.get("/me",
    verifyAccessToken,
    getProfile,
);

// ** Edits a user's profile *8 \\
profileRouter.patch("/me",
    verifyAccessToken,
    rateLimit({
        key: "user",
        limit: 30,
        windowMs: 60_000
    }),
    editProfileValidation(),
    expressValidationHandler,
    editProfile,
);