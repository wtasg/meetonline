import { CONF } from "./net-conf.js";

/**
 * GET login tokens
 * @returns {Response}
 */
async function prelogin() {
    const res = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGIN}`, {
        credentials: "include",
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });
    return res.json();
}

/**
 * GET signup tokens
 * @returns {Response}
 */
async function presignup() {
    const res = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.SIGNUP}`, {
        credentials: "include",
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
    });
    return res.json();
}

/**
 * POST /login
 * @param {{username: string, password: string, token: string}} userCredentials
 * @returns {Promise<{ok: boolean, login: {username: string, session: string}, message: string}>}
 */
async function login({ username, password, token }) {
    const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGIN}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, token }),
    });
    return response.json();
}

/**
 * POST /signup
 * @param {{username: string, password: string, token: string}} userCredentials
 * @returns {Promise<{ok:boolean,signup:{username:string},message:string}>}
 */
async function signup({ username, password, token }) {
    const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.SIGNUP}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, token }),
    });
    return response.json();
}

/**
 *
 * @param {{username: string}} options
 * @returns {Promise<{ok:boolean,logout:boolean,message:string}>}
 */
async function logout({ username }) {
    const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGOUT}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username })
    });

    return response.json();
}

export { login, signup, logout, prelogin, presignup };
