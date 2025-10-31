import { CONF } from "./net-conf.js";

function login({ username, password }) {
    return fetch(`${CONF.SERVER}/${CONF.URLS.LOGIN}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, token: "token" }),
    }).then((res) => res.text());
}

function signup({ username, password }) {
    return fetch(`${CONF.SERVER}/${CONF.URLS.SIGNUP}`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, token: "token" }),
    }).then((res) => res.text());
}

export { login, signup };
