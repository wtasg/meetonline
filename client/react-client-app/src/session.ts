import { Storage } from "./utils/storage";

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
};

export { user_session, location, resetLocation, resetUserSession, settings };
