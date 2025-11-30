import { ValidationChain } from "express-validator";
export declare class Validation {
    /**
     @param {"signup" | "login"} authType - Helps determine what type of auth validation is needed from this function
     @returns {ValidationChain[]} - It returns an array of validation chain's
    */
    newAuthValidation(authType: "signup" | "login"): ValidationChain[];
    newAnalysisValidation(): ValidationChain[];
    saveAnalysisValidation(): ValidationChain[];
    paginationValidation(): ValidationChain[];
    idValidation(idValue: string, idValueUsedInErrMessages: string): ValidationChain[];
    editProfileValidation(): ValidationChain[];
}
//# sourceMappingURL=validation.services.d.ts.map