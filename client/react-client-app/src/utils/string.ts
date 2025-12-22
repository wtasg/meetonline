/**
 * Check if a value is null, undefined, or an empty/whitespace-only string.
 * @param {unknown} inputStr - Value to check
 * @returns {boolean} true if null, undefined, or empty/whitespace string
 */
function isEmptyOrNull(inputStr: unknown): boolean {
    return inputStr === null ||
        inputStr === undefined ||
        (typeof inputStr === "string" && inputStr.trim() === "");
}

/**
 * Check if a value is a string that is empty or contains only whitespace.
 * @param {unknown} inputStr - Value to check
 * @returns {boolean} true only if it's a string and is empty/whitespace
 */
function isEmptyString(inputStr: unknown): boolean {
    return typeof inputStr === "string" && inputStr.trim() === "";
}

/**
 * Check if a value is a non-empty string with actual content.
 * @param {unknown} inputStr - Value to check
 * @returns {boolean} true only if it's a string with non-whitespace content
 */
function isNonEmptyString(inputStr: unknown): inputStr is string {
    return typeof inputStr === "string" &&
        inputStr.trim().length > 0;
}

export {
    isEmptyOrNull,
    isEmptyString,
    isNonEmptyString,
};
