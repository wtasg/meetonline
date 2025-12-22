import { UTC } from "./date";

interface CookieOptions {
    Path?: string;
    "Max-Age"?: number;
    SameSite?: "strict" | "lax" | "none";
    Secure?: boolean;
    Domain?: string;
}

/**
 * Read a single cookie by name
 * @param {string} name - Cookie name to read
 * @returns {(string|null)} Cookie value or null if not found
 */
function readCookie(name: string = "example-name"): string | null {
    const cookie = readAllCookies()
        .filter(cookie => cookie.startsWith(name))
        .filter(cookie => cookie.split("=")[0] === name);
    if (cookie.length !== 1) {
        return null;
    }
    return cookie[0].split("=")[1] || null;
}

/**
 * Fetch all cookies as an array of "key=value" strings
 * @returns {string[]} Array of cookie strings
 */
function readAllCookies(): string[] {
    let cookies: string[] = [];
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

/**
 * Delete a cookie by name
 * @param {string} name - Cookie name to delete
 * @param {string} [path='/'] - Cookie path (default: "/")
 * @returns {null}
 */
function deleteCookie(name: string = "example-name", path: string = "/"): null {
    document.cookie = `${name}=; Path=${path}; Expires=${UTC.zero()}; Max-Age=0;`;
    return null;
}

/**
 * Create a new cookie or overwrite existing one
 * @param {string} name - Name of the cookie
 * @param {string} value - Value of the cookie
 * @param {CookieOptions} [options] - Cookie options
 * @returns {string} The cookie string that was set
 */
function createCookie(
    name: string = "example-name",
    value: string = "example-value",
    options: CookieOptions = { Path: "/" }
): string {
    const defaults: CookieOptions = {
        Path: "/",
        "Max-Age": 7,
        SameSite: "strict"
    };
    const mergedOptions = { ...defaults, ...options };
    const Expires = UTC.someday(Number(mergedOptions["Max-Age"] ?? 7));
    const parts: string[] = [`${name}=${value}`, `Expires=${Expires}`];
    for (const [k, v] of Object.entries(mergedOptions)) {
        parts.push(`${k}=${v}`);
    }
    const cookie = parts.join("; ");
    document.cookie = cookie;
    return cookie;
}

export { readCookie, readAllCookies, deleteCookie, createCookie };
export type { CookieOptions };
