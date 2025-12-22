import {
    fetchUserSettings as netFetchUserSettings,
    updateUserSettings as netUpdateUserSettings
} from "../net/userSettings.js";
import { settings } from "../session.js";
import { isAuthenticated } from "./authActions.js";

interface UserSettings {
    theme: string;
    scheme: string;
    filter: string;
    fontSize: string;
    fontFamily: string;
    fontContrast: string;
    notifications: boolean;
    onlinePresence: boolean;
    sounds: boolean;
    [key: string]: string | boolean;
}

interface UserSettingsActionResponse {
    ok: boolean;
    message?: string;
    user_settings?: UserSettings;
}

const DEFAULT_SETTINGS: UserSettings = {
    theme: "gray",
    scheme: "light",
    filter: "default",
    fontSize: "medium",
    fontFamily: "system-ui",
    fontContrast: "normal",
    notifications: true,
    onlinePresence: true,
    sounds: true
};

/**
 * Retrieves user settings from localStorage.
 * Falls back to default settings if no stored settings exist or if parsing fails.
 * @returns {UserSettings} The user settings object from localStorage or default settings.
 */
function getLocalSettings(): UserSettings {
    const stored = settings.retrieve("userSettings");
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return { ...DEFAULT_SETTINGS };
        }
    }
    return { ...DEFAULT_SETTINGS };
}

/**
 * Saves user settings to localStorage.
 * @param {UserSettings} settingsObj - The complete user settings object to persist.
 * @returns {void}
 */
function saveLocalSettings(settingsObj: UserSettings): void {
    settings.store("userSettings", JSON.stringify(settingsObj));
}

/**
 * Fetches user settings from the server if authenticated, otherwise from localStorage.
 * For authenticated users, syncs server settings to localStorage.
 * @returns {Promise<UserSettingsActionResponse>} A promise that resolves to a UserSettingsActionResponse containing the settings or error message.
 */
async function fetchUserSettings(): Promise<UserSettingsActionResponse> {
    if (!isAuthenticated()) {
        return { ok: true, user_settings: getLocalSettings() };
    }

    const result = await netFetchUserSettings();
    if (result.ok && result.user_settings) {
        // Sync server settings to localStorage
        // result.user_settings is UserSettings | false. If false, check is handled by ok.
        // Also result.user_settings from net has extra fields (id, createdAt) which are compatible-ish or ignored.
        // We cast to any for simplicity in saving if needed, but UserSettings matches mostly.
        const settingsToSave = result.user_settings as UserSettings;
        saveLocalSettings(settingsToSave);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
}

/**
 * Updates a single user setting. Saves to server if authenticated, otherwise saves locally.
 * @param {string} key - The setting key to update.
 * @param {(string|boolean)} value - The new value for the setting.
 * @returns {Promise<UserSettingsActionResponse>} A promise that resolves to a UserSettingsActionResponse indicating success or failure.
 */
async function updateSetting(key: string, value: string | boolean): Promise<UserSettingsActionResponse> {
    const localSettings = getLocalSettings();
    const updatedSettings = { ...localSettings, [key]: value };

    if (!isAuthenticated()) {
        saveLocalSettings(updatedSettings);
        return { ok: true, user_settings: updatedSettings };
    }

    const result = await netUpdateUserSettings({ key, value });
    if (result.ok) {
        // Sync updated settings to localStorage
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        saveLocalSettings((result.user_settings as any) || updatedSettings);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
}

/**
 * Updates the font size setting.
 * @param {string} value - The new font size value (e.g., 'small', 'medium', 'large').
 * @returns {Promise<UserSettingsActionResponse>} A promise that resolves to a UserSettingsActionResponse indicating success or failure.
 */
async function updateFontSize(value: string): Promise<UserSettingsActionResponse> {
    return updateSetting("fontSize", value);
}

/**
 * Updates the font family setting.
 * @param {string} value - The new font family value (e.g., 'system-ui', 'Arial', 'Roboto').
 * @returns {Promise<UserSettingsActionResponse>} A promise that resolves to a UserSettingsActionResponse indicating success or failure.
 */
async function updateFontFamily(value: string): Promise<UserSettingsActionResponse> {
    return updateSetting("fontFamily", value);
}

/**
 * Updates the font contrast setting.
 * @param {string} value - The new font contrast value (e.g., 'normal', 'high').
 * @returns {Promise<UserSettingsActionResponse>} A promise that resolves to a UserSettingsActionResponse indicating success or failure.
 */
async function updateFontContrast(value: string): Promise<UserSettingsActionResponse> {
    return updateSetting("fontContrast", value);
}

/**
 * Updates the notifications enabled setting.
 * @param {boolean} value - Whether notifications should be enabled.
 * @returns {Promise<UserSettingsActionResponse>} A promise that resolves to a UserSettingsActionResponse indicating success or failure.
 */
async function updateNotifications(value: boolean): Promise<UserSettingsActionResponse> {
    return updateSetting("notifications", value);
}

/**
 * Updates the online presence visibility setting.
 * @param {boolean} value - Whether online presence should be visible to others.
 * @returns {Promise<UserSettingsActionResponse>} A promise that resolves to a UserSettingsActionResponse indicating success or failure.
 */
async function updateOnlinePresence(value: boolean): Promise<UserSettingsActionResponse> {
    return updateSetting("onlinePresence", value);
}

/**
 * Updates the sounds enabled setting.
 * @param {boolean} value - Whether sounds should be enabled.
 * @returns {Promise<UserSettingsActionResponse>} A promise that resolves to a UserSettingsActionResponse indicating success or failure.
 */
async function updateSounds(value: boolean): Promise<UserSettingsActionResponse> {
    return updateSetting("sounds", value);
}

/**
 * Updates the color theme setting.
 * @param {string} value - The new theme value (e.g., 'gray', 'blue', 'green').
 * @returns {Promise<UserSettingsActionResponse>} A promise that resolves to a UserSettingsActionResponse indicating success or failure.
 */
async function updateTheme(value: string): Promise<UserSettingsActionResponse> {
    return updateSetting("theme", value);
}

/**
 * Updates the color scheme setting.
 * @param {string} value - The new scheme value (e.g., 'light', 'dark', 'auto').
 * @returns {Promise<UserSettingsActionResponse>} A promise that resolves to a UserSettingsActionResponse indicating success or failure.
 */
async function updateScheme(value: string): Promise<UserSettingsActionResponse> {
    return updateSetting("scheme", value);
}

/**
 * Updates the visual filter setting.
 * @param {string} value - The new filter value (e.g., 'default', 'protanopia', 'deuteranopia').
 * @returns {Promise<UserSettingsActionResponse>} A promise that resolves to a UserSettingsActionResponse indicating success or failure.
 */
async function updateFilter(value: string): Promise<UserSettingsActionResponse> {
    return updateSetting("filter", value);
}

export {
    fetchUserSettings,
    updateFontSize,
    updateFontFamily,
    updateFontContrast,
    updateNotifications,
    updateOnlinePresence,
    updateSounds,
    updateTheme,
    updateScheme,
    updateFilter,
    getLocalSettings,
    saveLocalSettings,
};
