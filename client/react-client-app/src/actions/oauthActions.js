import { fetchOAuthConnections, removeOAuthConnection, getOAuthInitiationUrl } from "../net/oauth.js";

/**
 * Fetches all social connections for the current user.
 * @returns {Promise<Array>} List of connected providers
 */
async function loadOAuthConnectionsAction() {
    const res = await fetchOAuthConnections();
    if (res.ok) {
        return res.connections;
    }
    return [];
}

/**
 * Disconnects a social provider from the current user account.
 * @param {string} provider - The provider to disconnect (e.g. 'google')
 * @returns {Promise<boolean>} Success status
 */
async function disconnectOAuthAction(provider) {
    const res = await removeOAuthConnection(provider);
    return res.ok;
}

/**
 * Triggers the OAuth login/connect flow by redirecting the browser.
 * @param {string} provider - The provider (google, microsoft, etc.)
 * @param {string} mode - 'login' or 'connect'
 */
function triggerOAuthLoginAction(provider, mode = "login") {
    window.location.href = getOAuthInitiationUrl(provider, mode);
}

export {
    loadOAuthConnectionsAction,
    disconnectOAuthAction,
    triggerOAuthLoginAction
};
