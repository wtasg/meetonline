
/**
 * collapse consecutive spaces
 * @param {string|String} input
 * @param {{preserveLineBreaks: boolean, maxChars: number, countCodePoints: boolean}} options
 * @returns {string}
 */
function removeConsecutiveSpaces(input, options = { preserveLineBreaks: false, maxChars: 1024, countCodePoints: true }) {
    if (input === undefined || input === null) {
        throw new TypeError("Param input should be a string.");
    }
    const str = String(input);
    const max = options.maxChars ?? 1024;
    const length = options.countCodePoints ? [...str].length : str.length;
    if (length === 0) {
        return str;
    }
    if (length > max) {
        throw new RangeError("Param input is too long. (1024+)");
    }
    if (options.preserveLineBreaks) {
        // remove line spaces except line endings
        return str.trim().replace(/[^\S\r\n]+/g, " ");
    }
    // default: remove all whitespace
    return str.trim().replace(/\s+/g, " ");
}

/**
 * Sanitize filename
 * @param {string} input - original filename
 * @returns {string} sanitized filename
 */
function sanitizeFilename(input, options = { maxChars: 255, countCodePoints: true }) {
    if (input === undefined || input === null) {
        return "_";
    }
    input = String(input);
    input = removeConsecutiveSpaces(input);

    // limit to 255 code points (avoid breaking surrogate pairs)
    const MAX = options.maxChars;
    if (options.countCodePoints) {
        input = [...input].slice(0, MAX).join("");
    } else {
        input = input.slice(0, MAX).join("");
    }

    const hasLeadingDot = input.startsWith(".");

    const parts = input
        .toLowerCase()
        .split(".")
        .map(part =>
            part
                .replace(/[^a-z0-9_-]+/g, "_")
                .replace(/_+/g, "_")
                .replace(/^_+|_+$/g, "")
        )
        .filter(Boolean);

    let out = parts.join(".");

    if (hasLeadingDot && out) {
        out = "." + out;
    } else if (hasLeadingDot && !out) {
        out = ".";
    }

    if (!out) {
        return "_";
    }

    return out;
}

export { sanitizeFilename, removeConsecutiveSpaces };
