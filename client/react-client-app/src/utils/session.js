import { user_session } from "../session";

function hasUserSession() {
    return user_session && user_session["username"] && user_session["username"] !== null;
}


export { hasUserSession };
