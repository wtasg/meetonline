import { readCookie } from "../utils/cookie.js";
import { CONF } from "./net-conf.js";

/**
 * Retrieve the login page resource from the configured server.
 * @returns {Response} The fetch Response object for the GET request to the login endpoint.
 */
async function prelogin() {
    const res = await fetch(`${CONF.SERVER}/${CONF.URLS.LOGIN}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });
    return res;
}

/**
 * Retrieve the server's signup endpoint with credentials included.
 *
 * @returns {Response} The fetch `Response` object returned by the request.
 */
async function presignup() {
    const res = await fetch(`${CONF.SERVER}/${CONF.URLS.SIGNUP}`, {
        credentials: "include",
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
    });
    return res;
}

/**
 * Send login credentials to the server and retrieve the response body.
 *
 * The request includes the username, password, and a token read from the `login_token` cookie.
 *
 * @param {Object} params - Login parameters.
 * @param {string} params.username - The user's username.
 * @param {string} params.password - The user's password.
 * @returns {string} The response body as text.
 */
async function login({ username, password }) {
    return fetch(`${CONF.SERVER}/${CONF.URLS.LOGIN}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, token: readCookie("login_token") }),
    }).then((res) => res.text());
}

/**
 * Send signup credentials to the server and return the server response body as text.
 *
 * The request includes a `token` read from the `signup_token` cookie in the JSON body.
 * @param {string} username - The desired username.
 * @param {string} password - The desired password.
 * @returns {string} The response body as text.
 */
async function signup({ username, password }) {
    return fetch(`${CONF.SERVER}/${CONF.URLS.SIGNUP}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, token: readCookie("signup_token") }),
    }).then((res) => res.text());
}

/**
 * Log out the specified user by POSTing to the server logout endpoint.
 * @param {string} username - The username to log out.
 * @returns {Response} The fetch Response when the server indicates success.
 * @throws {Error} If the server responds with a non-OK status.
 */
async function logout({ username }) {
    const result = await fetch(`${CONF.SERVER}/${CONF.URLS.LOGOUT}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username })
    });
    if (result.ok) {
        return result;
    } else {
        throw new Error("logout error");
    }
}

export { login, signup, logout, prelogin, presignup };