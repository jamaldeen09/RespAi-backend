import { body, param, query } from "express-validator";
// ** Custom class to help with validation ** \\
export class Validation {
    /**
     @param {"signup" | "login"} authType - Helps determine what type of auth validation is needed from this function
     @returns {ValidationChain[]} - It returns an array of validation chain's
    */
    newAuthValidation(authType) {
        if (authType === "signup") {
            return [
                body("email")
                    .trim()
                    .notEmpty()
                    .withMessage("Email address must be provided")
                    .isEmail()
                    .withMessage("Invalid email address"),
                body("password")
                    .trim()
                    .notEmpty()
                    .withMessage("Password must be provided")
                    .isString()
                    .withMessage("Password must be a string")
                    .isLength({ min: 8 })
                    .withMessage("Password must be at least 8 characters long")
                    .matches(/[a-z]/)
                    .withMessage("Password must contain at least one lowercase letter")
                    .matches(/[0-9]/)
                    .withMessage("Password must contain at least one number")
                    .matches(/[^A-Za-z0-9]/)
                    .withMessage("Password must contain at least one special character"),
                body("firstname")
                    .trim()
                    .notEmpty()
                    .withMessage("Firstname must be provided")
                    .isString()
                    .withMessage("Firstname must be a string")
                    .isLength({ min: 2 })
                    .withMessage("Firstname must be at least 2 characters")
                    .isLength({ max: 50 })
                    .withMessage("Firstname cannot exceed 50 characters"),
                body("lastname")
                    .trim()
                    .notEmpty()
                    .withMessage("Lastname must be provided")
                    .isString()
                    .withMessage("Lastname must be a string")
                    .isLength({ min: 2 })
                    .withMessage("Lastname must be at least 2 characters")
                    .isLength({ max: 50 })
                    .withMessage("Lastname cannot exceed 50 characters")
            ];
        }
        ;
        if (authType === "login") {
            return [
                body("email")
                    .trim()
                    .notEmpty()
                    .withMessage("Email address must be provided")
                    .isEmail()
                    .withMessage("Invalid email address"),
                body("password")
                    .trim()
                    .notEmpty()
                    .withMessage("Password must be provided")
                    .isString()
                    .withMessage("Password must be a string")
                    .isLength({ min: 8 })
                    .withMessage("Password must be at least 8 characters long")
                    .matches(/[a-z]/)
                    .withMessage("Password must contain at least one lowercase letter")
                    .matches(/[0-9]/)
                    .withMessage("Password must contain at least one number")
                    .matches(/[^A-Za-z0-9]/)
                    .withMessage("Password must contain at least one special character"),
            ];
        }
        ;
        return [];
    }
    ;
    newAnalysisValidation() {
        return [
            body('method')
                .isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
                .withMessage('Method must be one of: GET, POST, PUT, PATCH, DELETE'),
            body('endpoint')
                .notEmpty()
                .withMessage('Endpoint URL is required')
                .isString()
                .withMessage('Endpoint must be a string')
                .custom((value) => {
                if (!value.trim()) {
                    throw new Error('Endpoint URL is required');
                }
                try {
                    let urlToValidate = value;
                    if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
                        urlToValidate = 'https://' + urlToValidate;
                    }
                    const parsedUrl = new URL(urlToValidate);
                    // ** Basic URL structure validation ** \\
                    if (!parsedUrl.hostname) {
                        throw new Error('Invalid URL: Missing hostname');
                    }
                    // ** Allow localhost and IP addresses for development *8 \\
                    if (parsedUrl.hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(parsedUrl.hostname)) {
                        return true;
                    }
                    // ** Basic domain validation ** \\
                    if (!parsedUrl.hostname.includes('.') && parsedUrl.hostname !== 'localhost') {
                        throw new Error('Invalid URL: Please include a valid domain');
                    }
                    return true;
                }
                catch (error) {
                    throw new Error('Invalid URL format. Please use a valid URL like: https://api.example.com/endpoint');
                }
            }),
            body('body')
                .optional()
                .custom((value) => {
                if (!value)
                    return true;
                try {
                    JSON.parse(value);
                    return true;
                }
                catch (e) {
                    throw new Error('Body must be valid JSON');
                }
            }),
            body('headers')
                .isArray()
                .withMessage('Headers must be an array')
                .custom((headers) => {
                if (!Array.isArray(headers))
                    return false;
                for (const header of headers) {
                    if (typeof header !== 'object' || header === null) {
                        throw new Error('Each header must be an object');
                    }
                    if (!header.key || typeof header.key !== 'string') {
                        throw new Error('Each header must have a key string');
                    }
                    if (header.value === undefined || header.value === null) {
                        throw new Error('Each header must have a value');
                    }
                    // ** Allow any value type (string, number, boolean, etc.) ** \\
                }
                return true;
            }),
            body('queryParams')
                .isArray()
                .withMessage('Query params must be an array')
                .custom((queryParams) => {
                if (!Array.isArray(queryParams))
                    return false;
                for (const queryParam of queryParams) {
                    if (typeof queryParam !== 'object' || queryParam === null) {
                        throw new Error('Each query param must be an object');
                    }
                    if (!queryParam.key || typeof queryParam.key !== 'string') {
                        throw new Error('Each query param must have a key string');
                    }
                    if (queryParam.value === undefined || queryParam.value === null) {
                        throw new Error('Each query param must have a value');
                    }
                    // ** Allow any value type (string, number, boolean, etc.) ** \\
                }
                return true;
            })
        ];
    }
    ;
    saveAnalysisValidation() {
        return [
            body("cost")
                .trim()
                .notEmpty()
                .withMessage("Cost of the analysis must be provided")
                .isNumeric()
                .withMessage("Analysis cost must be numeric"),
            body("aiAnalysis")
                .optional()
                .trim()
                .notEmpty()
                .withMessage("An ai analysis must be provided")
                .isString()
                .withMessage("Ai analysis must be a string")
                .isLength({ min: 6 })
                .withMessage("Minimum ai analysis is 6 characters"),
            body('response')
                .exists()
                .withMessage('The "response" object is required in the body.')
                .isObject()
                .withMessage('The "response" field must be a valid JSON object.'),
            body("response.status")
                .notEmpty()
                .withMessage("Response status must be provided")
                .isNumeric()
                .withMessage("Response stats must be numeric"),
            body("response.headers")
                .isArray()
                .withMessage('Response headers must be an array')
                .custom((headers) => {
                if (!Array.isArray(headers))
                    return false;
                for (const header of headers) {
                    if (typeof header !== 'object' || header === null) {
                        throw new Error('Each header must be an object');
                    }
                    if (!header.key || typeof header.key !== 'string') {
                        throw new Error('Each header must have a key string');
                    }
                    if (header.value === undefined || header.value === null) {
                        throw new Error('Each header must have a value');
                    }
                    // ** Allow any value type (string, number, boolean, etc.) ** \\
                }
                return true;
            }),
            body('response.body')
                .optional()
                .custom((value) => {
                if (!value)
                    return true;
                try {
                    JSON.parse(value);
                    return true;
                }
                catch (e) {
                    throw new Error('Response body must be valid JSON');
                }
            }),
            body('request')
                .exists()
                .withMessage('The "request" object is required in the body.')
                .isObject()
                .withMessage('The "request" field must be a valid JSON object.'),
            body('request.method')
                .trim()
                .isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
                .withMessage('Method must be one of: GET, POST, PUT, PATCH, DELETE'),
            body("request.headers")
                .isArray()
                .withMessage('Request headers must be an array')
                .custom((headers) => {
                if (!Array.isArray(headers))
                    return false;
                for (const header of headers) {
                    if (typeof header !== 'object' || header === null) {
                        throw new Error('Each header must be an object');
                    }
                    if (!header.key || typeof header.key !== 'string') {
                        throw new Error('Each header must have a key string');
                    }
                    if (header.value === undefined || header.value === null) {
                        throw new Error('Each header must have a value');
                    }
                    // ** Allow any value type (string, number, boolean, etc.) ** \\
                }
                return true;
            }),
            body("request.queryParams")
                .isArray()
                .withMessage('Query params must be an array')
                .custom((queryParams) => {
                if (!Array.isArray(queryParams))
                    return false;
                for (const queryParam of queryParams) {
                    if (typeof queryParam !== 'object' || queryParam === null) {
                        throw new Error('Each query param must be an object');
                    }
                    if (!queryParam.key || typeof queryParam.key !== 'string') {
                        throw new Error('Each query param must have a key string');
                    }
                    if (queryParam.value === undefined || queryParam.value === null) {
                        throw new Error('Each query param must have a value');
                    }
                    // ** Allow any value type (string, number, boolean, etc.) ** \\
                }
                return true;
            }),
            body('request.body')
                .optional()
                .custom((value) => {
                if (!value)
                    return true;
                try {
                    JSON.parse(value);
                    return true;
                }
                catch (e) {
                    throw new Error('Request body must be valid JSON');
                }
            }),
            body("request.endpoint")
                .trim()
                .notEmpty()
                .withMessage('Endpoint URL is required')
                .isString()
                .withMessage('Endpoint must be a string')
                .custom((value) => {
                if (!value.trim()) {
                    throw new Error('Endpoint URL is required');
                }
                try {
                    let urlToValidate = value;
                    if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
                        urlToValidate = 'https://' + urlToValidate;
                    }
                    const parsedUrl = new URL(urlToValidate);
                    // ** Basic URL structure validation ** \\
                    if (!parsedUrl.hostname) {
                        throw new Error('Invalid URL: Missing hostname');
                    }
                    // ** Allow localhost and IP addresses for development *8 \\
                    if (parsedUrl.hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(parsedUrl.hostname)) {
                        return true;
                    }
                    // ** Basic domain validation ** \\
                    if (!parsedUrl.hostname.includes('.') && parsedUrl.hostname !== 'localhost') {
                        throw new Error('Invalid URL: Please include a valid domain');
                    }
                    return true;
                }
                catch (error) {
                    throw new Error('Invalid URL format. Please use a valid URL like: https://api.example.com/endpoint');
                }
            }),
        ];
    }
    ;
    paginationValidation() {
        return [
            query("page")
                .trim()
                .optional()
                .isString()
                .withMessage("Page must be a valid string")
                .custom((value) => {
                const numericValue = Number(value) || parseInt(value);
                if (isNaN(numericValue))
                    throw new Error("Invalid page, please input a valid page");
                return true;
            })
                .customSanitizer((value) => {
                const numericValue = Number(value) || parseInt(value);
                return numericValue;
            }),
            query("searchQuery")
                .trim()
                .optional()
                .isString()
                .withMessage("Search query must be a string")
                .isLength({ min: 1 })
                .withMessage("Search query must be at least 1 character"),
            query("method")
                .trim()
                .optional()
                .isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
                .withMessage('Method must be one of: GET, POST, PUT, PATCH, DELETE'),
            query("status")
                .trim()
                .optional()
                .custom((value) => {
                const numericValue = Number(value) || parseInt(value);
                if (isNaN(numericValue))
                    throw new Error("Invalid status, please input a valid status");
                return true;
            })
                .customSanitizer((value) => {
                const numericValue = Number(value) || parseInt(value);
                return numericValue;
            }),
        ];
    }
    idValidation(idValue, idValueUsedInErrMessages) {
        return [
            param(idValue)
                .trim()
                .notEmpty()
                .withMessage(`${idValueUsedInErrMessages} must be provided`)
                .isString()
                .withMessage(`${idValueUsedInErrMessages} must be a string`)
                .isLength({ min: 24, max: 24 })
                .withMessage(`${idValueUsedInErrMessages} must be exactly 24 characters`)
        ];
    }
    ;
    editProfileValidation() {
        return [
            body("firstname")
                .optional()
                .trim()
                .notEmpty()
                .withMessage("Firstname must be provided")
                .isString()
                .withMessage("Firstname must be a string")
                .isLength({ min: 2 })
                .withMessage("Firstname must be at least 2 characters")
                .isLength({ max: 50 })
                .withMessage("Firstname cannot exceed 50 characters"),
            body("lastname")
                .optional()
                .trim()
                .notEmpty()
                .withMessage("Lastname must be provided")
                .isString()
                .withMessage("Lastname must be a string")
                .isLength({ min: 2 })
                .withMessage("Lastname must be at least 2 characters")
                .isLength({ max: 50 })
                .withMessage("Lastname cannot exceed 50 characters"),
            body("avatar").optional()
        ];
    }
}
;
//# sourceMappingURL=validation.services.js.map