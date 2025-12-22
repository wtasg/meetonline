/**
 * JWT Token Storage and Management Utilities
 * Uses sessionStorage for JWT tokens
 */

const TOKEN_STORAGE_KEY = "jwt_tokens";

interface TokenData {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt: string;
    username: string;
    storedAt?: string;
}

interface StoreTokensParams {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt: string;
    username: string;
}

/**
 * Store JWT tokens in sessionStorage
 * @param {StoreTokensParams} tokens - Token object with access and refresh tokens
 * @returns {void}
 */
function storeTokens({ accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, username }: StoreTokensParams): void {
    const tokens: TokenData = {
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
 * @returns {(TokenData|null)} Token object or null if not found
 */
function getTokens(): TokenData | null {
    try {
        const tokensStr = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        if (!tokensStr) {
            return null;
        }
        return JSON.parse(tokensStr) as TokenData;
    } catch (error) {
        console.error("Error retrieving tokens:", error);
        return null;
    }
}

/**
 * Get access token
 * @returns {(string|null)} Access token or null if not found
 */
function getAccessToken(): string | null {
    const tokens = getTokens();
    return tokens?.accessToken || null;
}

/**
 * Get refresh token
 * @returns {(string|null)} Refresh token or null if not found
 */
function getRefreshToken(): string | null {
    const tokens = getTokens();
    return tokens?.refreshToken || null;
}

/**
 * Get username from stored tokens
 * @returns {(string|null)} Username or null if not found
 */
function getUsername(): string | null {
    const tokens = getTokens();
    return tokens?.username || null;
}

/**
 * Clear all stored tokens
 * @returns {void}
 */
function clearTokens(): void {
    try {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
        console.error("Error clearing tokens:", error);
    }
}

/**
 * Check if access token is expired or about to expire
 * @param {number} [bufferSeconds=60] - Buffer time in seconds (default: 60)
 * @returns {boolean} True if token is expired or about to expire
 */
function isAccessTokenExpired(bufferSeconds: number = 60): boolean {
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
function isRefreshTokenExpired(): boolean {
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
function hasValidTokens(): boolean {
    const tokens = getTokens();
    return tokens !== null && !isRefreshTokenExpired();
}

/**
 * Update access token (after refresh)
 * @param {string} accessToken - New access token
 * @param {string} accessTokenExpiresAt - New access token expiration date
 * @returns {void}
 */
function updateAccessToken(accessToken: string, accessTokenExpiresAt: string): void {
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

export type { TokenData, StoreTokensParams };
