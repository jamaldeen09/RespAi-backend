/**
 @param {string} cacheKey - Used to find the specific cache value needed
 @returns {string | undefined} - Returns the cached value as a JSON string or undefined if cache miss
*/
declare const readOperation: (cacheKey: string) => string | undefined;
/**
 @param {string} cacheKey - Used to as the key to store the cache value needed
 @param {T} value - Actual value being cached
 @returns {void}
*/
declare const writeOperation: <T>(cacheKey: string, value: T) => void;
/**
 @param {"patterns" | "cacheKey"} deleteType - Used to decide how to delete items from cache either by finding items that matches the provided pattern or deleting one
 @param {string} cacheKey - Used to delete the specific value needed to be deleted (if using "cacheKey")
 @param {string} pattern - Used to delete multiple value that matches this param (if using "patterns")
 @returns {void}
*/
declare const deleteOperation: (deleteType: "patterns" | "cacheKey", cacheKey?: string, pattern?: string) => void;
export { readOperation, writeOperation, deleteOperation, };
//# sourceMappingURL=cache.services.d.ts.map