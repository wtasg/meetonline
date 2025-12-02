function isEmptyOrNull(inputStr) {
    return typeof inputStr === "string" &&
        (inputStr === "" || inputStr === null);
}

function isEmptyString(inputStr) {
    return typeof inputStr === "string" && inputStr === "";
}

function isNonEmptyString(inputStr) {
    return inputStr !== undefined &&
        typeof inputStr === "string" &&
        inputStr.length > 0;
}

export {
    isEmptyOrNull,
    isEmptyString,
    isNonEmptyString,
};
