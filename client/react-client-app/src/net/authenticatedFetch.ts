import { getAccessToken, isAccessTokenExpired, getRefreshToken, storeTokens, getUsername } from "../utils/jwt.js";
import { authRefresh } from "./auth.js";
import { ensureCsrfToken, getCsrfHeaders } from "./csrf.js";

/**
 * Fetch wrapper that automatically adds JWT authorization header
 * and handles token refresh if needed
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Response promise
 */
async function authenticatedFetch(url: string | URL | Request, options: RequestInit = {}): Promise<Response> {
    // Ensure CSRF token is available
    await ensureCsrfToken();

    // Get current access token
    let accessToken = getAccessToken();

    // Check if access token is expired or about to expire
    if (isAccessTokenExpired()) {
        // Try to refresh token
        const refreshToken = getRefreshToken();

        if (refreshToken) {
            try {
                const result = await authRefresh({ refreshToken });

                if (result.ok && result.auth_refresh) {
                    // Update tokens in storage
                    const username = getUsername();
                    if (username) {
                        storeTokens({
                            accessToken: result.auth_refresh.accessToken,
                            refreshToken: result.auth_refresh.refreshToken,
                            accessTokenExpiresAt: result.auth_refresh.accessTokenExpiresAt,
                            refreshTokenExpiresAt: result.auth_refresh.refreshTokenExpiresAt,
                            username: username
                        });
                    }

                    accessToken = result.auth_refresh.accessToken;
                }
            } catch (error) {
                console.error("Token refresh failed:", error);
                // Continue with expired token, let the server handle it
            }
        }
    }

    // Add Authorization header if token exists
    const headers: HeadersInit = {
        ...options.headers,
        ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
        ...getCsrfHeaders()
    } as unknown as HeadersInit;

    // Make the request
    return fetch(url, {
        ...options,
        headers
    });
}

export { authenticatedFetch };
