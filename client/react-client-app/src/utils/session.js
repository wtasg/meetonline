import { user_session } from "../session";
import { isNonEmptyString } from "./string";

function hasUserSession() {
    return user_session &&
        isNonEmptyString(user_session.retrieve("username")) &&
        isNonEmptyString(user_session.retrieve("session"));
}

export { hasUserSession };
