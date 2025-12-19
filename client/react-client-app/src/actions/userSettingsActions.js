import {
    fetchUserSettings as netFetchUserSettings,
    updateUserSettings as netUpdateUserSettings
} from "../net/userSettings.js";
import { settings } from "../session.js";
import { isAuthenticated } from "./authActions.js";

const DEFAULT_SETTINGS = {
    fontSize: "medium",
    fontFamily: "system-ui",
    fontContrast: "normal",
    notifications: true,
    onlinePresence: true,
    sounds: true
};

/**
 * Get settings from localStorage
 * @returns {Object} Settings object
 */
function getLocalSettings() {
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
 * Save settings to localStorage
 * @param {Object} settingsObj - Settings object to save
 */
function saveLocalSettings(settingsObj) {
    settings.store("userSettings", JSON.stringify(settingsObj));
}

/**
 * Fetch user settings - from server if authenticated, otherwise from localStorage
 * @returns {Promise<{ok: boolean, message?: string, user_settings: Object}>}
 */
async function fetchUserSettings() {
    if (!isAuthenticated()) {
        return { ok: true, user_settings: getLocalSettings() };
    }

    const result = await netFetchUserSettings();
    if (result.ok && result.user_settings) {
        // Sync server settings to localStorage
        saveLocalSettings(result.user_settings);
    }
    return result;
}

/**
 * Update a single setting - server if authenticated, otherwise just localStorage
 * @param {string} key - Setting key
 * @param {string|boolean} value - Setting value
 * @returns {Promise<{ok: boolean, message?: string, user_settings?: Object}>}
 */
async function updateSetting(key, value) {
    const localSettings = getLocalSettings();
    const updatedSettings = { ...localSettings, [key]: value };

    if (!isAuthenticated()) {
        saveLocalSettings(updatedSettings);
        return { ok: true, user_settings: updatedSettings };
    }

    const result = await netUpdateUserSettings({ key, value });
    if (result.ok) {
        // Sync updated settings to localStorage
        saveLocalSettings(result.user_settings || updatedSettings);
    }
    return result;
}

async function updateFontSize(value) {
    return updateSetting("fontSize", value);
}

async function updateFontFamily(value) {
    return updateSetting("fontFamily", value);
}

async function updateFontContrast(value) {
    return updateSetting("fontContrast", value);
}

async function updateNotifications(value) {
    return updateSetting("notifications", value);
}

async function updateOnlinePresence(value) {
    return updateSetting("onlinePresence", value);
}

async function updateSounds(value) {
    return updateSetting("sounds", value);
}

export {
    fetchUserSettings,
    updateFontSize,
    updateFontFamily,
    updateFontContrast,
    updateNotifications,
    updateOnlinePresence,
    updateSounds,
    getLocalSettings,
    saveLocalSettings,
};
