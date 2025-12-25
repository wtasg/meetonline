import { Storage } from "./utils/storage";
import { themeStorage } from "./utils/theme";
import { settingsStorage } from "./utils/settings";

/**
 * Session storage instance for user session data (username, session token).
 */
const user_session = new Storage(["session"]);

/**
 * Local storage instance for persisting navigation location across sessions.
 */
const location = new Storage(["local"]);

/**
 * Local storage instance for user settings persistence.
 */
const settings = new Storage(["local"]);

const existingLocation = location?.retrieve("path") ?? "/";
location.store("path", existingLocation);

/**
 * Resets the stored navigation location to the root path.
 */
const resetLocation = (): void => {
    location.eject("path");
    location.store("path", "/");
};

/**
 * Clears user session data (username and session token).
 */
const resetUserSession = (): void => {
    user_session.eject("username");
    user_session.eject("session");
    user_session.eject("displayName");
};

/**
 * Clears all user-specific data from localStorage on logout.
 * This includes user settings, theme preferences, and font settings.
 */
const clearUserData = (): void => {
    // Clear user settings
    settings.eject("userSettings");
    
    // Clear theme settings
    themeStorage.eject("theme");
    themeStorage.eject("scheme");
    themeStorage.eject("filter");
    
    // Clear font settings
    settingsStorage.eject("fontSize");
    settingsStorage.eject("fontContrast");
};

export { user_session, location, resetLocation, resetUserSession, settings, clearUserData };
