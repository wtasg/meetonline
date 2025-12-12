import {
    fetchUserSettings as netFetchUserSettings,
    updateUserSettings as netUpdateUserSettings
} from "../net/userSettings.js";

async function fetchUserSettings() {
    return netFetchUserSettings({});
}

async function updateTheme(value) {
    return netUpdateUserSettings({ key: "theme", value });
}

async function updateFontSize(value) {
    return netUpdateUserSettings({ key: "fontSize", value });
}

async function updateFontFamily(value) {
    return netUpdateUserSettings({ key: "fontFamily", value });
}

async function updateFontContrast(value) {
    return netUpdateUserSettings({ key: "fontContrast", value });
}

async function updateNotifications(value) {
    return netUpdateUserSettings({ key: "notifications", value });
}

async function updateOnlinePresence(value) {
    return netUpdateUserSettings({ key: "onlinePresence", value });
}

async function updateSounds(value) {
    return netUpdateUserSettings({ key: "sounds", value });
}

export {
    fetchUserSettings,
    updateTheme,
    updateFontSize,
    updateFontFamily,
    updateFontContrast,
    updateNotifications,
    updateOnlinePresence,
    updateSounds,
};
