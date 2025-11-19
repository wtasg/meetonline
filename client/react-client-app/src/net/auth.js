import { readCookie } from "../utils/cookie.js";
import { CONF } from "./net-conf.js";
import { debounce } from "../utils/debounce.js";

const _prelogin = async function () {
    return fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGIN}`, {
        credentials: "include",
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });
};

const preloginDebouncer = debounce(_prelogin, 400);

function prelogin() {
    return preloginDebouncer();
}

const _presignup = async function () {
    return fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.SIGNUP}`, {
        credentials: "include",
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
    });
};

const presignupDebouncer = debounce(_presignup, 400);

function presignup() {
    return presignupDebouncer();
}


async function login({ username, password }) {
    return fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGIN}`, {
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
