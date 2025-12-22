import { user_session, resetUserSession, resetLocation } from "../session";
import { isNonEmptyString } from "./string";
import { hasValidTokens, clearTokens } from "./jwt";

/**
 * Check if user has an active session
 * @returns {boolean} True if user has valid JWT tokens or cookie-based session
 */
function hasUserSession(): boolean {
    // Check JWT tokens first
    if (hasValidTokens()) {
        return true;
    }

    // Fallback to cookie-based session
    return user_session &&
        isNonEmptyString(user_session.retrieve("username")) &&
        isNonEmptyString(user_session.retrieve("session"));
}

/**
 * Destroy current user session
 * @returns {void}
 */
function destroySession(): void {
    resetUserSession();
    resetLocation();

    // Also clear JWT tokens if they exist
    clearTokens();
}

/**
 * Get currently stored username
 * @returns {(string|null)} Username or null
 */
function username(): string | null {
    return user_session.retrieve("username");
}

/**
 * Get stored display name
 * @returns {(string|null)} Display name or null
 */
function getStoredDisplayName(): string | null {
    return user_session.retrieve("displayName");
}

/**
 * Store display name
 * @param {string} name - Display name to store
 * @returns {void}
 */
function setStoredDisplayName(name: string): void {
    user_session.store("displayName", name);
}

/**
 * Get display name for UI (with fallback)
 * @returns {string} Display name or "User" as fallback
 */
function displayName(): string {
    const stored = getStoredDisplayName();
    return isNonEmptyString(stored) ? stored : "User";
}

export { hasUserSession, destroySession, username, getStoredDisplayName, setStoredDisplayName, displayName };
