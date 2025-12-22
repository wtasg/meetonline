import { fetchOAuthConnections, removeOAuthConnection, getOAuthInitiationUrl } from "../net/oauth.js";

/**
 * Fetches all OAuth/social connections for the current authenticated user.
 * @returns {Promise<Array>} A promise that resolves to an array of connected OAuth provider objects.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadOAuthConnectionsAction(): Promise<any[]> {
    const res = await fetchOAuthConnections();
    if (res.ok) {
        return res.connections;
    }
    return [];
}

/**
 * Disconnects an OAuth provider from the current user account.
 * @param {string} provider - The provider to disconnect (e.g., 'google', 'microsoft').
 * @returns {Promise<boolean>} A promise that resolves to true if disconnection was successful, false otherwise.
 */
async function disconnectOAuthAction(provider: string): Promise<boolean> {
    const res = await removeOAuthConnection(provider);
    return res.ok;
}

/**
 * Triggers the OAuth login/connect flow by redirecting the browser to the OAuth provider.
 * @param {string} provider - The OAuth provider (e.g., 'google', 'microsoft').
 * @param {string} [mode='login'] - The OAuth mode, either 'login' for authentication or 'connect' for linking accounts.
 * @returns {void}
 */
function triggerOAuthLoginAction(provider: string, mode: string = "login"): void {
    window.location.href = getOAuthInitiationUrl(provider, mode);
}

export {
    loadOAuthConnectionsAction,
    disconnectOAuthAction,
    triggerOAuthLoginAction
};
