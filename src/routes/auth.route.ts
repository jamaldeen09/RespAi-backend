import express from "express"
import { Validation } from "../services/validation.services.js";
import { expressValidationHandler, verifyAccessToken, verifyRefreshToken } from "../middlewares/auth.middlewares.js";
import { getAuthState, googleCallbackHandler, login, logout, refresh, signup } from "../controllers/auth.controllers.js";
import passport from "../config/passport.config.js"
import { rateLimit } from "../middlewares/rateLimit.middlewares.js";
export const authRouter: express.Router = express.Router();

// ** Custom validation class instantiation to aid validation ** \\
const { newAuthValidation } = new Validation();

// ** Signup route ** \\
authRouter.post("/signup",
    rateLimit({ key: "ip", limit: 5, windowMs: 60_000 }),
    newAuthValidation("signup"),
    expressValidationHandler,
    signup
);

// ** Google authentication ** \\
authRouter.get('/google',
    rateLimit({ key: "ip", limit: 20, windowMs: 60_000 }),
    passport.authenticate('google',
        { scope: ['profile', 'email'] }
    )
);

// ** Google callback endpoint for successfull user creation after google auth ** \\
authRouter.get('/google/callback',
    rateLimit({ key: "ip", limit: 20, windowMs: 60_000 }),
    passport.authenticate('google', { session: false }),
    googleCallbackHandler
);


// ** Login route ** \\
authRouter.post("/login",
    rateLimit({ key: "ip", limit: 5, windowMs: 60_000 }),
    newAuthValidation("login"),
    expressValidationHandler,
    login,
);

// ** Logout route ** \\
authRouter.post("/logout",
    verifyAccessToken,
    rateLimit({ key: "user", limit: 20, windowMs: 60_000 }),
    logout,
);

// ** Refreshes requesting users token route ** \\
authRouter.get("/refresh",
    verifyRefreshToken,
    refresh,
)

// ** Fetches requesting users authentication data ** \\
authRouter.get("/me",
    verifyAccessToken,
    getAuthState,
)
