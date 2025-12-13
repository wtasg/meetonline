import { login, signup, logout, prelogin, presignup, authToken, logoutJwt } from "../net/auth";
import { resetLocation, resetUserSession, user_session } from "../session";
import { storeTokens, clearTokens, getAccessToken, hasValidTokens, getUsername } from "../utils/jwt.js";

/**
 *
 * @returns {Promise<{ok:true}|{ok:false,message:string}>}
 */
async function preLoginAction() {
    try {
        const result = await prelogin();
        if (result.ok) {
            user_session.store("login_token", result.token);
        } else {
            result.message = "Cannot fetch login_token. Check Server.";
        }
        delete result.token;
        return result;
    }
    catch (err) {
        console.error(err);
        return { ok: false, message: err.message };
    }
}

/**
 *
 * @returns {Promise<{ok:true}|{ok:false,message:string}>}
 */
async function preSignupAction() {
    try {
        const result = await presignup();
        if (result.ok) {
            user_session.store("signup_token", result.token);
        } else {
            result.message = "Cannot fetch signup_token. Check Server.";
        }
        delete result.token;
        return result;
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message };
    }
}

/**
 * POST /login action (legacy cookie-based)
 * @param {{username: string, password: string}} credentials
 * @returns {Promise<true|false>}
 */
async function loginAction({ username, password }) {
    if (!username || !password) {
        return Promise.reject("Username and password are required");
    }
    const token = user_session.retrieve("login_token");
    user_session.eject("login_token");
    const result = await login({ username, password, token });
    if (result.ok) {
        user_session.store("username", result.login.username);
        user_session.store("session", result.login.session);
        return true;
    }

    // failed login
    // refetching token when action fails
    await preLoginAction();
    user_session.eject("username");
    console.error(result.error);
    return false;
}

/**
 * POST /auth_token action (JWT-based authentication)
 * @param {{username: string, password: string}} credentials
 * @returns {Promise<true|false>}
 */
async function authTokenAction({ username, password }) {
    if (!username || !password) {
        return Promise.reject("Username and password are required");
    }
    
    try {
        const result = await authToken({ username, password });
        
        if (result.ok && result.auth_token) {
            // Store JWT tokens
            storeTokens({
                accessToken: result.auth_token.accessToken,
                refreshToken: result.auth_token.refreshToken,
                accessTokenExpiresAt: result.auth_token.accessTokenExpiresAt,
                refreshTokenExpiresAt: result.auth_token.refreshTokenExpiresAt,
                username: result.auth_token.username
            });
            
            // Also store username in session for compatibility
            user_session.store("username", result.auth_token.username);
            
            return true;
        }
        
        console.error(result.message);
        return false;
    } catch (err) {
        console.error("Auth token action failed:", err);
        return false;
    }
}

/**
 *
 * @param {{username:string, password:string}} userCredentials
 * @returns {Promise<{ok:boolean,signup:{username:string},message:string}>}
 */
async function signupAction({ username, password }) {
    if (!username || !password) {
        return Promise.reject("Username and password are required");
    }
    const token = user_session.retrieve("signup_token");
    user_session.eject("signup_token");
    const result = await signup({ username, password, token });
    if (result.ok) {
        return result;
    }
    // refetching token when action fails
    await preSignupAction();
    return result;
}

/**
 * Logout action - supports both JWT and cookie-based sessions
 * @returns {Promise<{ok: boolean, logout: boolean, message: string}>}
 */
async function logoutAction() {
    // Check if using JWT authentication
    const accessToken = getAccessToken();
    
    if (accessToken) {
        // JWT-based logout
        try {
            const result = await logoutJwt(accessToken);
            clearTokens();
            resetUserSession();
            resetLocation();
            
            if (!result.ok) {
                console.error(result.message);
            }
            
            return result;
        } catch (error) {
            console.error("JWT logout failed:", error);
            // Clear tokens anyway
            clearTokens();
            resetUserSession();
            resetLocation();
            return { ok: false, logout: false, message: error.message };
        }
    } else {
        // Cookie-based logout (legacy)
        const usernameInSession = user_session.retrieve("username");
        if (!usernameInSession) {
            throw new Error("Username not found!");
        }
        resetUserSession();
        resetLocation();
        // server session destruction
        const result = await logout({ username: usernameInSession });
        if (!result.ok) {
            console.error(result.message);
        }
        return result;
    }
}

/**
 * Check if user is authenticated (either JWT or cookie-based)
 * @returns {boolean}
 */
function isAuthenticated() {
    // Check JWT tokens first
    if (hasValidTokens()) {
        return true;
    }
    
    // Fallback to cookie-based session
    const username = user_session.retrieve("username");
    const session = user_session.retrieve("session");
    
    return !!(username && session);
}

/**
 * Get current username from either JWT or session
 * @returns {string|null}
 */
function getCurrentUsername() {
    // Try JWT first
    const jwtUsername = getUsername();
    if (jwtUsername) {
        return jwtUsername;
    }
    
    // Fallback to session
    return user_session.retrieve("username");
}

export {
    loginAction,
    signupAction,
    logoutAction,
    preLoginAction,
    preSignupAction,
    authTokenAction,
    isAuthenticated,
    getCurrentUsername
};

