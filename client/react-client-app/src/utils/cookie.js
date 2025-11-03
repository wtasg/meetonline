import { zero, tomorrow } from "./date";

/**
 *
 * @param {string} name
 * @returns {string[]} Cookie
 */
function readCookie(name = "example-name") {
    return readAllCookies()
        .filter(cookie => cookie.startsWith(name))
        .filter(cookie => cookie.split("=")[0] === name);
}

/**
 * Fetch all Cookies
 * @returns {CookieList}
 */
function readAllCookies() {
    let cookies = [];
    if (!document || !document.cookie) {
        return cookies;
    }
    const raw = document.cookie || "";
    if (!raw) {
        return cookies;
    }
    cookies = raw.split("; ");
    return cookies;
}


function deleteCookie(name = "example-name", path = "/") {
    document.cookie = `${name}=; Path=${path}; Expires=${zero()}; Max-Age=0;`;
    return null;
}

/**
 * Create a new cookie or overwrite existing one
 * @param {string} name name of the cookie
 * @param {string} value value of the cookie
 * @param {Record<string,string>} options Options for cookie
 * @returns {string}
 */
function createCookie(name = "example-name", value = "example-value", options = { "Path": "/" }) {
    const defaults = {
        Path: "/",
        Expires: tomorrow(),
        "Max-Age": 0,
        "SameSite": "strict"
    };
    options = { ...defaults, ...options };
    const parts = [`${name}=${value}`];
    for (const [k, v] of Object.entries(options)) {
        parts.push(`${k}=${v}`);
    }
    const cookie = parts.join("; ");
    document.cookie = cookie;
    return cookie;
}

export { readCookie, readAllCookies, deleteCookie, createCookie };
