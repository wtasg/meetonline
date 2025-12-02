import { readCookie } from "../utils/cookie.js";
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
    return res;
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
    return res;
}

/**
 * POST /login
 * @param {{username: string, password: string}} userCredentials
 * @returns {{ok: boolean, login: {username: string, session: string}, message: string}} typical network response
 */
async function login({ username, password }) {
    const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGIN}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, token: readCookie("login_token") }),
    });
    const result = await response.json();
    // console.log(JSON.stringify({ result }));
    return result;
}

/**
 * POST /signup
 * @param {{username: string, password: string}} userCredentials
 * @returns
 */
async function signup({ username, password }) {
    return fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.SIGNUP}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, token: readCookie("signup_token") }),
    }).then((res) => res.json());
}

/**
 *
 * @param {{username: string}} options
 * @returns {Promise<{ok:boolean,logout:boolean,message:string}>}
 */
async function logout({ username }) {
    const result = await (await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGOUT}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username })
    })).json();

    return result;
}

export { login, signup, logout, prelogin, presignup };
