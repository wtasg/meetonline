/**
 * Sanitize filename
 * @param {string} originalName - original filename
 * @returns {string} sanitized filename
 */
function sanitizeFilename(originalName) {
    if (!originalName || typeof originalName !== "string") {
        throw new Error("Invalid filename input");
    }

    let name = originalName.toLowerCase();

    name = name.replace(/\s+/g, " ");
    name = name.trim();
    name = name.replace(/\s/g, "_");
    name = name.replace(/[^\u0020-\u007E]/g, "");

    const parts = name.split(".");
    const compoundExtensions = ["tar.gz", "tar.bz2", "tar.xz"];
    const lastTwo = parts.slice(-2).join(".");

    if (compoundExtensions.includes(lastTwo)) {
        const base = parts.slice(0, -2).join("_");
        name = `${base}.${lastTwo}`;
    } else if (parts.length > 2) {
        const ext = parts.pop();
        name = parts.join("_") + "." + ext;
    }
    name = name.replace(/[^a-z0-9._-]/g, "_");
    name = name.replace(/_+/g, "_");

    if (name.startsWith(".") && !name.startsWith("..")) {
        return name;
    }

    name = name.replace(/^_+|_+$/g, "").replace(/_+\./g, ".");

    return name;
}

export { sanitizeFilename };
