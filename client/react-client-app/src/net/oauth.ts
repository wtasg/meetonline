import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

interface OAuthResponse {
    ok: boolean;
    message?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * Fetches all OAuth/social provider connections for the current authenticated user.
 * @returns {Promise<OAuthResponse>} A promise resolving to an OAuthResponse containing the list of connected providers or error.
 */
async function fetchOAuthConnections(): Promise<OAuthResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.OAUTH_CONNECTIONS}`);
        return await response.json();
    } catch (error: unknown) {
        console.error("Error fetching OAuth connections:", error);
        return { ok: false, message: "Network error" };
    }
}

/**
 * Removes an OAuth provider connection from the current user account.
 * @param {string} provider - The OAuth provider to disconnect (e.g., 'google', 'microsoft').
 * @returns {Promise<OAuthResponse>} A promise resolving to an OAuthResponse indicating success or failure.
 */
async function removeOAuthConnection(provider: string): Promise<OAuthResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.OAUTH_CONNECTIONS}/${provider}`, {
            method: "DELETE"
        });
        return await response.json();
    } catch (error: unknown) {
        console.error(`Error removing ${provider} connection:`, error);
        return { ok: false, message: "Network error" };
    }
}

/**
 * Generates the URL to initiate OAuth authentication with a provider.
 * @param {string} provider - The OAuth provider (e.g., 'google', 'microsoft').
 * @param {string} [mode='login'] - The OAuth mode: 'login' for authentication or 'connect' for linking accounts.
 * @returns {string} The full URL to redirect the browser to initiate the OAuth flow.
 */
function getOAuthInitiationUrl(provider: string, mode: string = "login"): string {
    return `${CONF.HTTPS_SERVER}/oauth/${provider}?mode=${mode}`;
}

export {
    fetchOAuthConnections,
    removeOAuthConnection,
    getOAuthInitiationUrl
};
