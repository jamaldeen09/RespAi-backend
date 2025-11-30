import express from "express";
import cors from "cors";
import initDb from "./config/database.config.js";
import { authRouter } from "./routes/auth.route.js";
import passport from "./config/passport.config.js";
import { analysisRouter } from "./routes/analysis.route.js";
import { profileRouter } from "./routes/profile.route.js";
import { envData } from "./config/env.config.js";
// ** Initializes express app ** \\
const app = express();
// ** Allowed origins ** \\
let allowedOrigins = [envData.FRONTEND_URL, "http://localhost:3000"];
// ** Global middlewares ** \\
app.use(express.json());
app.use(cors({
    origin: allowedOrigins
}));
// ** Cache store used as a caching layer ** \\
export const cacheStore = new Map();
// ** Database initialization ** \\
initDb(app);
// ** Passport js initialization ** \\
app.use(passport.initialize());
// ** Routers ** \\
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/response", analysisRouter);
app.use("/api/v1/profile", profileRouter);
//# sourceMappingURL=server.js.map