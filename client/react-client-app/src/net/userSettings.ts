import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";
import { ThemeConfig } from "../utils/theme.js";

export interface UserSettings extends ThemeConfig {
    id: string;
    fontSize: string;
    fontFamily: string;
    fontContrast: string;
    notifications: boolean;
    onlinePresence: boolean;
    sounds: boolean;
    createdAt: string;
    modifiedAt: string;
}

interface UserSettingsResponse {
    ok: boolean;
    message?: string;
    user_settings?: UserSettings | false;
}

/**
 * Fetches the settings for the current authenticated user from the server.
 * @returns {Promise<UserSettingsResponse>} A promise resolving to a UserSettingsResponse containing the settings or error.
 */
async function fetchUserSettings(): Promise<UserSettingsResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.USER_SETTINGS}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();

    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, user_settings: false };
    }
}

/**
 * Updates a single user setting on the server.
 * @param {Object} options - The update options.
 * @param {string} options.key - The setting key to update (e.g., 'theme', 'notifications').
 * @param {(string|boolean)} options.value - The new value for the setting (string or boolean).
 * @returns {Promise<UserSettingsResponse>} A promise resolving to a UserSettingsResponse indicating success or failure.
 */
async function updateUserSettings({ key, value }: { key: string; value: string | boolean }): Promise<UserSettingsResponse> {
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
    catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

export {
    fetchUserSettings,
    updateUserSettings
};
