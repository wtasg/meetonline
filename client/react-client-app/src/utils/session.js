import { user_session, resetUserSession, resetLocation } from "../session";
import { isNonEmptyString } from "./string";
import { hasValidTokens, clearTokens } from "./jwt";

function hasUserSession() {
    // Check JWT tokens first
    if (hasValidTokens()) {
        return true;
    }

    // Fallback to cookie-based session
    return user_session &&
        isNonEmptyString(user_session.retrieve("username")) &&
        isNonEmptyString(user_session.retrieve("session"));
}

function destroySession() {
    resetUserSession();
    resetLocation();

    // Also clear JWT tokens if they exist
    clearTokens();
}

function username() {
    return user_session.retrieve("username");
}

function getStoredDisplayName() {
    return user_session.retrieve("displayName");
}

function setStoredDisplayName(name) {
    user_session.store("displayName", name);
}

function displayName() {
    const stored = getStoredDisplayName();
    return isNonEmptyString(stored) ? stored : "User";
}

export { hasUserSession, destroySession, username, getStoredDisplayName, setStoredDisplayName, displayName };
