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

/**
 * POST /auth_token - JWT-based authentication
 * Authenticates user and returns JWT tokens
 * @param {{username: string, password: string}} credentials
 * @returns {Promise<{ok: boolean, auth_token: {accessToken: string, refreshToken: string, accessTokenExpiresAt: string, refreshTokenExpiresAt: string, username: string}, message: string}>}
 */
async function authToken({ username, password }) {
    const response = await fetch(`${CONF.HTTPS_SERVER}/auth_token`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });
    return response.json();
}

/**
 * POST /auth_refresh - Refresh JWT access token
 * Uses refresh token to get new access token
 * @param {{refreshToken: string}} params
 * @returns {Promise<{ok: boolean, auth_refresh: {accessToken: string, refreshToken: string, accessTokenExpiresAt: string, refreshTokenExpiresAt: string}, message: string}>}
 */
async function authRefresh({ refreshToken }) {
    const response = await fetch(`${CONF.HTTPS_SERVER}/auth_refresh`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    });
    return response.json();
}

/**
 * POST /logout with JWT authentication
 * @param {string} accessToken - JWT access token
 * @returns {Promise<{ok:boolean,logout:boolean,message:string}>}
 */
async function logoutJwt(accessToken) {
    const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGOUT}`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({})
    });

    return response.json();
}

export { login, signup, logout, prelogin, presignup, authToken, authRefresh, logoutJwt };
