import { CONF } from "./net-conf.js";

function login({ username, password }) {
    return fetch(`${CONF.SERVER}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, token: "token" }),
    }).then((res) => res.text());
}

function signup({ username, password }) {
    return fetch(`${CONF.SERVER}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, token: "token" }),
    }).then((res) => res.text());
}

export { login, signup };
