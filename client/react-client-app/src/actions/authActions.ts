import { signup, logout, presignup, authToken, logoutJwt } from "../net/auth";
import { resetLocation, resetUserSession, user_session, clearUserData } from "../session";
import { storeTokens, clearTokens, getAccessToken, hasValidTokens, getUsername } from "../utils/jwt.js";
import { fetchUserSettings } from "./userSettingsActions.js";

interface ActionResponse {
    ok: boolean;
    message?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * Initiates the pre-signup flow by fetching a signup token from the server.
 * The token is stored in the user session for later use during signup.
 * @returns {Promise<ActionResponse>} A promise that resolves to an ActionResponse indicating success or failure.
 */
async function preSignupAction(): Promise<ActionResponse> {
    try {
        const result = await presignup();
        if (result.ok && result.token) {
            user_session.store("signup_token", result.token);
        } else {
            result.message = "Cannot fetch signup_token. Check Server.";
        }
        // Create a copy to avoid mutating the typed response if strictly typed, 
        // but here result is somewhat flexible.
        // We delete token from result before returning as per original logic.
        const responseCtx: ActionResponse = { ...result };
        delete responseCtx.token;
        return responseCtx;
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

/**
 * Authenticates a user using JWT-based authentication.
 * On success, stores the JWT tokens and syncs user settings from the server.
 * @param {Object} credentials - The user credentials object.
 * @param {string} credentials.username - The username to authenticate.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<boolean>} A promise that resolves to true if authentication succeeds, false otherwise.
 * @throws {Error} If username or password is not provided.
 */
async function authTokenAction({ username, password }: { username: string; password: string }): Promise<boolean> {
    if (!username || !password) {
        return Promise.reject(new Error("Username and password are required"));
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

            // Sync user settings from server to localStorage
            await fetchUserSettings();

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
 * Registers a new user account with the provided credentials.
 * Uses the signup token stored during preSignupAction.
 * @param {Object} credentials - The user credentials object.
 * @param {string} credentials.username - The desired username.
 * @param {string} credentials.password - The desired password.
 * @returns {Promise<ActionResponse>} A promise that resolves to an ActionResponse indicating success or failure.
 * @throws {Error} If username or password is not provided.
 */
async function signupAction({ username, password }: { username: string; password: string }): Promise<ActionResponse> {
    if (!username || !password) {
        return Promise.reject(new Error("Username and password are required"));
    }
    const token = user_session.retrieve("signup_token");
    user_session.eject("signup_token");

    // token should be string, but retrieve returns string|null. Handle null case?
    if (!token) {
        // Should we refetch or error? Original code refetches on failure of signup call, 
        // but if token is missing implicitly here we might fail.
        // Passing empty string or handling implicitly.
    }

    const result = await signup({ username, password, token: token || "" });
    if (result.ok) {
        return result;
    }
    // refetching token when action fails
    await preSignupAction();
    return result;
}

/**
 * Logs out the current user from the application.
 * Supports both JWT-based and legacy cookie-based session logout.
 * Clears all stored tokens/sessions and resets the application state.
 * @returns {Promise<ActionResponse>} A promise that resolves to an ActionResponse indicating logout success or failure.
 */
async function logoutAction(): Promise<ActionResponse> {
    // Check if using JWT authentication
    const accessToken = getAccessToken();

    if (accessToken) {
        // JWT-based logout
        try {
            const result = await logoutJwt(accessToken);
            clearTokens();
            resetUserSession();
            resetLocation();
            clearUserData();

            if (!result.ok) {
                console.error(result.message);
            }

            return result;
        } catch (error: unknown) {
            console.error("JWT logout failed:", error);
            // Clear tokens anyway
            clearTokens();
            resetUserSession();
            resetLocation();
            clearUserData();
            return { ok: false, logout: false, message: (error as Error).message };
        }
    } else {
        // Cookie-based logout (legacy)
        const usernameInSession = user_session.retrieve("username");
        if (!usernameInSession) {
            throw new Error("Username not found!");
        }
        resetUserSession();
        resetLocation();
        clearUserData();
        // server session destruction
        const result = await logout({ username: usernameInSession });
        if (!result.ok) {
            console.error(result.message);
        }
        return result;
    }
}

/**
 * Checks if the current user is authenticated.
 * Supports both JWT token-based and legacy cookie-based session authentication.
 * @returns {boolean} True if the user has valid authentication credentials, false otherwise.
 */
function isAuthenticated(): boolean {
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
 * Retrieves the username of the currently authenticated user.
 * Checks JWT tokens first, then falls back to session storage.
 * @returns {(string|null)} The username if authenticated, or null if not authenticated.
 */
function getCurrentUsername(): string | null {
    // Try JWT first
    const jwtUsername = getUsername();
    if (jwtUsername) {
        return jwtUsername;
    }

    // Fallback to session
    return user_session.retrieve("username");
}

export {
    signupAction,
    logoutAction,
    preSignupAction,
    authTokenAction,
    isAuthenticated,
    getCurrentUsername
};
