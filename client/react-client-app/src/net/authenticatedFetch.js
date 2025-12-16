import { getAccessToken, isAccessTokenExpired, getRefreshToken, storeTokens, getUsername } from "../utils/jwt.js";
import { authRefresh } from "./auth.js";

/**
 * Fetch wrapper that automatically adds JWT authorization header
 * and handles token refresh if needed
 * @param {string} url - Request URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
async function authenticatedFetch(url, options = {}) {
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
                    storeTokens({
                        accessToken: result.auth_refresh.accessToken,
                        refreshToken: result.auth_refresh.refreshToken,
                        accessTokenExpiresAt: result.auth_refresh.accessTokenExpiresAt,
                        refreshTokenExpiresAt: result.auth_refresh.refreshTokenExpiresAt,
                        username: username
                    });
                    
                    accessToken = result.auth_refresh.accessToken;
                }
            } catch (error) {
                console.error("Token refresh failed:", error);
                // Continue with expired token, let the server handle it
            }
        }
    }
    
    // Add Authorization header if token exists
    const headers = {
        ...options.headers,
        ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {})
    };
    
    // Make the request
    return fetch(url, {
        ...options,
        headers
    });
}

export { authenticatedFetch };
