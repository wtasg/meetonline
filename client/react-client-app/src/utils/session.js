import { user_session, resetUserSession, resetLocation } from "../session";
import { isNonEmptyString } from "./string";

function hasUserSession() {
    return user_session &&
        isNonEmptyString(user_session.retrieve("username")) &&
        isNonEmptyString(user_session.retrieve("session"));
}

function destroySession() {
    resetUserSession();
    resetLocation();
}

export { hasUserSession, destroySession };
