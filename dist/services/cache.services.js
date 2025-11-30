import { cacheStore } from "../server.js";
/**
 @param {string} cacheKey - Used to find the specific cache value needed
 @returns {string | undefined} - Returns the cached value as a JSON string or undefined if cache miss
*/
const readOperation = (cacheKey) => {
    const item = cacheStore.get(cacheKey);
    return item;
};
/**
 @param {string} cacheKey - Used to as the key to store the cache value needed
 @param {T} value - Actual value being cached
 @returns {void}
*/
const writeOperation = (cacheKey, value) => {
    cacheStore.set(cacheKey, JSON.stringify(value));
};
/**
 @param {"patterns" | "cacheKey"} deleteType - Used to decide how to delete items from cache either by finding items that matches the provided pattern or deleting one
 @param {string} cacheKey - Used to delete the specific value needed to be deleted (if using "cacheKey")
 @param {string} pattern - Used to delete multiple value that matches this param (if using "patterns")
 @returns {void}
*/
const deleteOperation = (deleteType, cacheKey, pattern) => {
    if (deleteType === "cacheKey") {
        cacheStore.delete(cacheKey);
        return;
    }
    else {
        for (const key of cacheStore.keys()) {
            if (key.startsWith(pattern)) {
                cacheStore.delete(key);
            }
        }
        return;
    }
};
export { readOperation, writeOperation, deleteOperation, };
//# sourceMappingURL=cache.services.js.map