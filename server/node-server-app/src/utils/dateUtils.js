const toISOStringOrEmpty = (value) => {
    if (value === null || value === undefined || value === "" || Number.isNaN(value)) {
        return "";
    }

    if (typeof value === "boolean") {
        return "";
    }

    const d = new Date(value);

    if (isNaN(d.getTime())) {
        return "";
    }

    return d.toISOString();
};

export { toISOStringOrEmpty };
