import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

/**
 * Fetches User Settings
 * @returns {Promise<{ok: boolean, message: string, user_settings: {id: string, theme: string, fontSize: string, fontFamily: string, fontContrast: string, notifications: boolean, onlinePresence: boolean, sounds: boolean, createdAt: string, modifiedAt: string}}>}
 */
async function fetchUserSettings() {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.USER_SETTINGS}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();

    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, user_settings: false };
    }
}

/**
 * Updates a single user setting
 * @param {{key: string, value: string|boolean}} options
 * @returns {Promise<{ok: boolean, message: string, user_settings: {id: string, theme: string, fontSize: string, fontFamily: string, fontContrast: string, notifications: boolean, onlinePresence: boolean, sounds: boolean, createdAt: string, modifiedAt: string}}>}
 */
async function updateUserSettings({ key, value }) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.USER_SETTINGS}`, {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ key, value }),
        });
        const json = await response.json();
        if (!json.ok) {
            console.error(json);
        }
        return json;
    }
    catch (err) {
        console.error(err);
        return { ok: false, message: err.message };
    }
}

export {
    fetchUserSettings,
    updateUserSettings
};
