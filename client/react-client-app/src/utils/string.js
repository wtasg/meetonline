function isEmptyOrNull(inputStr) {
    return inputStr === null ||
        inputStr === undefined ||
        (typeof inputStr === "string" && inputStr.trim() === "");
}

function isEmptyString(inputStr) {
    return typeof inputStr === "string" && inputStr.trim() === "";
}

function isNonEmptyString(inputStr) {
    return typeof inputStr === "string" &&
        inputStr.trim().length > 0;
}

export {
    isEmptyOrNull,
    isEmptyString,
    isNonEmptyString,
};
