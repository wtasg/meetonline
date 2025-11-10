import { readCookie } from "../utils/cookie.js";
import { CONF } from "./net-conf.js";

async function prelogin() {
    const res = await fetch(`${CONF.SERVER}/${CONF.URLS.LOGIN}`, {
        credentials: "include",
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });
    return res;
}

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

async function login({ username, password }) {
    return fetch(`${CONF.SERVER}/${CONF.URLS.LOGIN}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, token: readCookie("login_token") }),
    }).then((res) => res.json());
}

async function signup({ username, password }) {
    return fetch(`${CONF.SERVER}/${CONF.URLS.SIGNUP}`, {
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
 * @returns
 */
async function logout({ username }) {
    const result = await (await fetch(`${CONF.SERVER}/${CONF.URLS.LOGOUT}`, {
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
