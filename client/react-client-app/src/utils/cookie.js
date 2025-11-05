import { UTC } from "./date";

/**
 *
 * @param {string} name
 * @returns {string} Cookie value
 */
function readCookie(name = "example-name") {
    console.log("readCookie", name);
    const cookie = readAllCookies()
        .filter(cookie => cookie.startsWith(name))
        .filter(cookie => cookie.split("=")[0] === name);
    if (cookie.length !== 1) {
        return null;
    }
    return cookie[0].split("=")[1] || null;
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
    console.log({ cookies });
    return cookies;
}


function deleteCookie(name = "example-name", path = "/") {
    document.cookie = `${name}=; Path=${path}; Expires=${UTC.zero()}; Max-Age=0;`;
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
        "Max-Age": 7,
        "SameSite": "strict"
    };
    options = { ...defaults, ...options };
    const Expires = UTC.someday(Number(options["Max-Age"] ?? 7));
    const parts = [`${name}=${value}`, `Expires=${Expires}`];
    for (const [k, v] of Object.entries(options)) {
        parts.push(`${k}=${v}`);
    }
    const cookie = parts.join("; ");
    document.cookie = cookie;
    return cookie;
}

export { readCookie, readAllCookies, deleteCookie, createCookie };
