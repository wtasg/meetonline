/**
 * JWT Token Storage and Management Utilities
 * Uses sessionStorage for JWT tokens
 */

const TOKEN_STORAGE_KEY = "jwt_tokens";

/**
 * Store JWT tokens in sessionStorage
 * @param {Object} tokens - Token object
 * @param {string} tokens.accessToken - JWT access token
 * @param {string} tokens.refreshToken - JWT refresh token
 * @param {string} tokens.accessTokenExpiresAt - Access token expiration date
 * @param {string} tokens.refreshTokenExpiresAt - Refresh token expiration date
 * @param {string} tokens.username - Username
 */
function storeTokens({ accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, username }) {
    const tokens = {
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        username,
        storedAt: new Date().toISOString()
    };
    
    try {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
        console.error("Error storing tokens:", error);
    }
}

/**
 * Get all stored tokens
 * @returns {Object|null} Token object or null if not found
 */
function getTokens() {
    try {
        const tokensStr = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        if (!tokensStr) {
            return null;
        }
        return JSON.parse(tokensStr);
    } catch (error) {
        console.error("Error retrieving tokens:", error);
        return null;
    }
}

/**
 * Get access token
 * @returns {string|null} Access token or null if not found
 */
function getAccessToken() {
    const tokens = getTokens();
    return tokens?.accessToken || null;
}

/**
 * Get refresh token
 * @returns {string|null} Refresh token or null if not found
 */
function getRefreshToken() {
    const tokens = getTokens();
    return tokens?.refreshToken || null;
}

/**
 * Get username from stored tokens
 * @returns {string|null} Username or null if not found
 */
function getUsername() {
    const tokens = getTokens();
    return tokens?.username || null;
}

/**
 * Clear all stored tokens
 */
function clearTokens() {
    try {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
        console.error("Error clearing tokens:", error);
    }
}

/**
 * Check if access token is expired or about to expire
 * @param {number} bufferSeconds - Buffer time in seconds (default: 60)
 * @returns {boolean} True if token is expired or about to expire
 */
function isAccessTokenExpired(bufferSeconds = 60) {
    const tokens = getTokens();
    if (!tokens || !tokens.accessTokenExpiresAt) {
        return true;
    }
    
    const expiresAt = new Date(tokens.accessTokenExpiresAt);
    const now = new Date();
    const bufferMs = bufferSeconds * 1000;
    
    return (expiresAt.getTime() - bufferMs) <= now.getTime();
}

/**
 * Check if refresh token is expired
 * @returns {boolean} True if refresh token is expired
 */
function isRefreshTokenExpired() {
    const tokens = getTokens();
    if (!tokens || !tokens.refreshTokenExpiresAt) {
        return true;
    }
    
    const expiresAt = new Date(tokens.refreshTokenExpiresAt);
    const now = new Date();
    
    return expiresAt <= now;
}

/**
 * Check if user has valid tokens
 * @returns {boolean} True if user has valid tokens
 */
function hasValidTokens() {
    const tokens = getTokens();
    return tokens !== null && !isRefreshTokenExpired();
}

/**
 * Update access token (after refresh)
 * @param {string} accessToken - New access token
 * @param {string} accessTokenExpiresAt - New access token expiration date
 */
function updateAccessToken(accessToken, accessTokenExpiresAt) {
    const tokens = getTokens();
    if (!tokens) {
        console.error("No tokens found to update");
        return;
    }
    
    tokens.accessToken = accessToken;
    tokens.accessTokenExpiresAt = accessTokenExpiresAt;
    
    try {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
        console.error("Error updating access token:", error);
    }
}

export {
    storeTokens,
    getTokens,
    getAccessToken,
    getRefreshToken,
    getUsername,
    clearTokens,
    isAccessTokenExpired,
    isRefreshTokenExpired,
    hasValidTokens,
    updateAccessToken
};
