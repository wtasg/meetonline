import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

async function fetchOAuthConnections() {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.OAUTH_CONNECTIONS}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching OAuth connections:", error);
        return { ok: false, message: "Network error" };
    }
}

async function removeOAuthConnection(provider) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.OAUTH_CONNECTIONS}/${provider}`, {
            method: "DELETE"
        });
        return await response.json();
    } catch (error) {
        console.error(`Error removing ${provider} connection:`, error);
        return { ok: false, message: "Network error" };
    }
}

function getOAuthInitiationUrl(provider, mode = "login") {
    return `${CONF.HTTPS_SERVER}/oauth/${provider}?mode=${mode}`;
}

export {
    fetchOAuthConnections,
    removeOAuthConnection,
    getOAuthInitiationUrl
};
