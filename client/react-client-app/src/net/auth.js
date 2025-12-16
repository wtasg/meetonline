import { CONF } from "./net-conf.js";

/**
 * GET login tokens
 * @returns {Promise<{ok: boolean, token?: string, message?: string}>}
 */
async function prelogin() {
    try {
        const res = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGIN}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        });
        
        if (!res.ok) {
            return { ok: false, message: `HTTP error! status: ${res.status}` };
        }
        
        return await res.json();
    } catch (error) {
        console.error("prelogin error:", error);
        return { ok: false, message: error.message };
    }
}

/**
 * GET signup tokens
 * @returns {Promise<{ok: boolean, token?: string, message?: string}>}
 */
async function presignup() {
    try {
        const res = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.SIGNUP}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        });
        
        if (!res.ok) {
            return { ok: false, message: `HTTP error! status: ${res.status}` };
        }
        
        return await res.json();
    } catch (error) {
        console.error("presignup error:", error);
        return { ok: false, message: error.message };
    }
}

/**
 * POST /login
 * @param {{username: string, password: string, token: string}} userCredentials
 * @returns {Promise<{ok: boolean, login?: {username: string, session: string}, message?: string}>}
 */
async function login({ username, password, token }) {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGIN}`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, token }),
        });
        
        if (!response.ok) {
            return { ok: false, message: `HTTP error! status: ${response.status}` };
        }
        
        return await response.json();
    } catch (error) {
        console.error("login error:", error);
        return { ok: false, message: error.message };
    }
}

/**
 * POST /signup
 * @param {{username: string, password: string, token: string}} userCredentials
 * @returns {Promise<{ok: boolean, signup?: {username: string}, message?: string}>}
 */
async function signup({ username, password, token }) {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.SIGNUP}`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, token }),
        });
        
        if (!response.ok) {
            return { ok: false, message: `HTTP error! status: ${response.status}` };
        }
        
        return await response.json();
    } catch (error) {
        console.error("signup error:", error);
        return { ok: false, message: error.message };
    }
}

/**
 *
 * @param {{username: string}} options
 * @returns {Promise<{ok: boolean, logout?: boolean, message?: string}>}
 */
async function logout({ username }) {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGOUT}`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username })
        });
        
        if (!response.ok) {
            return { ok: false, message: `HTTP error! status: ${response.status}` };
        }
        
        return await response.json();
    } catch (error) {
        console.error("logout error:", error);
        return { ok: false, message: error.message };
    }
}

/**
 * POST /auth_token - JWT-based authentication
 * Authenticates user and returns JWT tokens
 * @param {{username: string, password: string}} credentials
 * @returns {Promise<{ok: boolean, auth_token?: {accessToken: string, refreshToken: string, accessTokenExpiresAt: string, refreshTokenExpiresAt: string, username: string}, message?: string}>}
 */
async function authToken({ username, password }) {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/auth_token`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });
        
        if (!response.ok) {
            return { ok: false, message: `HTTP error! status: ${response.status}` };
        }
        
        return await response.json();
    } catch (error) {
        console.error("authToken error:", error);
        return { ok: false, message: error.message };
    }
}

/**
 * POST /auth_refresh - Refresh JWT access token
 * Uses refresh token to get new access token
 * @param {{refreshToken: string}} params
 * @returns {Promise<{ok: boolean, auth_refresh?: {accessToken: string, refreshToken: string, accessTokenExpiresAt: string, refreshTokenExpiresAt: string}, message?: string}>}
 */
async function authRefresh({ refreshToken }) {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/auth_refresh`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });
        
        if (!response.ok) {
            return { ok: false, message: `HTTP error! status: ${response.status}` };
        }
        
        return await response.json();
    } catch (error) {
        console.error("authRefresh error:", error);
        return { ok: false, message: error.message };
    }
}

/**
 * POST /logout with JWT authentication
 * @param {string} accessToken - JWT access token
 * @returns {Promise<{ok: boolean, logout?: boolean, message?: string}>}
 */
async function logoutJwt(accessToken) {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGOUT}`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({})
        });
        
        if (!response.ok) {
            return { ok: false, message: `HTTP error! status: ${response.status}` };
        }
        
        return await response.json();
    } catch (error) {
        console.error("logoutJwt error:", error);
        return { ok: false, message: error.message };
    }
}

export { login, signup, logout, prelogin, presignup, authToken, authRefresh, logoutJwt };
