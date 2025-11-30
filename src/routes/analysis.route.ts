import express from "express"
import { expressValidationHandler, verifyAccessToken } from "../middlewares/auth.middlewares.js";
import { Validation } from "../services/validation.services.js";
import { deleteSingleAnalysisDetails, disabledOrEnableAiAnalysis, fetchSavedAnalysisDetails, getSingleAnalysisDetails, newAnalysis, saveAnalysis } from "../controllers/analysis.controllers.js";
import { rateLimit } from "../middlewares/rateLimit.middlewares.js";
export const analysisRouter: express.Router = express.Router();

const {
    newAnalysisValidation,
    saveAnalysisValidation,
    paginationValidation,
    idValidation
} = new Validation();


// ** Analyzes an endpoint ** \\
analysisRouter.post("/analysis",
    verifyAccessToken,
    rateLimit({
        key: "user",
        limit: 30,
        windowMs: 60_000
    }),
    newAnalysisValidation(),
    expressValidationHandler,
    newAnalysis,
)

// ** Save an analysis ** \\
analysisRouter.post("/analysis/save",
    verifyAccessToken,
    rateLimit({
        key: "user",
        limit: 30,
        windowMs: 60_000
    }),
    saveAnalysisValidation(),
    expressValidationHandler,
    saveAnalysis,
);

// ** Get saved analysis in chunks ** \\
analysisRouter.get("/analysis",
    verifyAccessToken,
    paginationValidation(),
    expressValidationHandler,
    fetchSavedAnalysisDetails,
)

// ** Get a single saved analysis full data ** \\
analysisRouter.get("/analysis/:analysisId",
    verifyAccessToken,
    rateLimit({
        key: "user",
        limit: 30,
        windowMs: 60_000
    }),
    idValidation("analysisId", "Analysis id"),
    expressValidationHandler,
    getSingleAnalysisDetails
);

// ** Delete an analysis ** \\
analysisRouter.delete("/analysis/:analysisId",
    verifyAccessToken,
    rateLimit({
        key: "user",
        limit: 30,
        windowMs: 60_000
    }),
    idValidation("analysisId", "Analysis id"),
    expressValidationHandler,
    deleteSingleAnalysisDetails,
);

// ** Disables/enables ai response analysis ** \\
analysisRouter.patch("/analysis/ai",
    verifyAccessToken,
    rateLimit({
        key: "user",
        limit: 30,
        windowMs: 60_000
    }),
    disabledOrEnableAiAnalysis,
)