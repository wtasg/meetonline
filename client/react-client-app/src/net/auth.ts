import { CONF } from "./net-conf.js";
import { ensureCsrfToken, getCsrfHeaders } from "./csrf.js";

interface AuthResponse {
    ok: boolean;
    message?: string;
}

interface PresignupResponse extends AuthResponse {
    token?: string;
}

interface SignupResponse extends AuthResponse {
    signup?: { username: string };
}

interface AuthTokenResponse extends AuthResponse {
    auth_token?: {
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresAt: string;
        refreshTokenExpiresAt: string;
        username: string;
    };
}

interface AuthRefreshResponse extends AuthResponse {
    auth_refresh?: {
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresAt: string;
        refreshTokenExpiresAt: string;
    };
}

interface LogoutResponse extends AuthResponse {
    logout?: boolean;
}

/**
 * Fetches a signup token from the server for user registration.
 * This is the first step in the signup flow.
 * @returns {Promise<PresignupResponse>} A promise resolving to a PresignupResponse containing the signup token or error.
 */
async function presignup(): Promise<PresignupResponse> {
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
    } catch (error: unknown) {
        console.error("presignup error:", error);
        return { ok: false, message: (error as Error).message };
    }
}

/**
 * Registers a new user account with the provided credentials.
 * Requires a valid signup token obtained from presignup().
 * @param {Object} credentials - The signup credentials.
 * @param {string} credentials.username - The desired username.
 * @param {string} credentials.password - The desired password.
 * @param {string} credentials.token - The signup token from presignup().
 * @returns {Promise<SignupResponse>} A promise resolving to a SignupResponse indicating success or failure.
 */
async function signup({ username, password, token }: { username: string; password: string; token: string }): Promise<SignupResponse> {
    try {
        await ensureCsrfToken();
        const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.SIGNUP}`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...getCsrfHeaders()
            } as HeadersInit,
            body: JSON.stringify({ username, password, token }),
        });

        if (!response.ok) {
            return { ok: false, message: `HTTP error! status: ${response.status}` };
        }

        return await response.json();
    } catch (error: unknown) {
        console.error("signup error:", error);
        return { ok: false, message: (error as Error).message };
    }
}

/**
 * Logs out a user by destroying their server-side session.
 * Used for cookie-based authentication.
 * @param {Object} credentials - The logout credentials.
 * @param {string} credentials.username - The username of the user to log out.
 * @returns {Promise<LogoutResponse>} A promise resolving to a LogoutResponse indicating success or failure.
 */
async function logout({ username }: { username: string }): Promise<LogoutResponse> {
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
    } catch (error: unknown) {
        console.error("logout error:", error);
        return { ok: false, message: (error as Error).message };
    }
}

/**
 * Authenticates a user and obtains JWT access and refresh tokens.
 * @param {Object} credentials - The login credentials.
 * @param {string} credentials.username - The username to authenticate.
 * @param {string} credentials.password - The password to authenticate.
 * @returns {Promise<AuthTokenResponse>} A promise resolving to an AuthTokenResponse containing JWT tokens or error.
 */
async function authToken({ username, password }: { username: string; password: string }): Promise<AuthTokenResponse> {
    try {
        await ensureCsrfToken();
        const response = await fetch(`${CONF.HTTPS_SERVER}/auth_token`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...getCsrfHeaders()
            } as HeadersInit,
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            return { ok: false, message: `HTTP error! status: ${response.status}` };
        }

        return await response.json();
    } catch (error: unknown) {
        console.error("authToken error:", error);
        return { ok: false, message: (error as Error).message };
    }
}

/**
 * Refreshes an expired JWT access token using a valid refresh token.
 * @param {Object} credentials - The refresh credentials.
 * @param {string} credentials.refreshToken - The refresh token to use for obtaining new tokens.
 * @returns {Promise<AuthRefreshResponse>} A promise resolving to an AuthRefreshResponse with new JWT tokens or error.
 */
async function authRefresh({ refreshToken }: { refreshToken: string }): Promise<AuthRefreshResponse> {
    try {
        await ensureCsrfToken();
        const response = await fetch(`${CONF.HTTPS_SERVER}/auth_refresh`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...getCsrfHeaders()
            } as HeadersInit,
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            return { ok: false, message: `HTTP error! status: ${response.status}` };
        }

        return await response.json();
    } catch (error: unknown) {
        console.error("authRefresh error:", error);
        return { ok: false, message: (error as Error).message };
    }
}

/**
 * Logs out a user using JWT authentication.
 * Invalidates the JWT token on the server side.
 * @param {string} accessToken - The JWT access token to invalidate.
 * @returns {Promise<LogoutResponse>} A promise resolving to a LogoutResponse indicating success or failure.
 */
async function logoutJwt(accessToken: string): Promise<LogoutResponse> {
    try {
        await ensureCsrfToken();
        const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.LOGOUT}`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
                ...getCsrfHeaders()
            } as HeadersInit,
            body: JSON.stringify({})
        });

        if (!response.ok) {
            return { ok: false, message: `HTTP error! status: ${response.status}` };
        }

        return await response.json();
    } catch (error: unknown) {
        console.error("logoutJwt error:", error);
        return { ok: false, message: (error as Error).message };
    }
}

export { signup, logout, presignup, authToken, authRefresh, logoutJwt };
