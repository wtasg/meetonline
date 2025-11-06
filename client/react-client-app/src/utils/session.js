import { user_session } from "../session";
import { readCookie } from "./cookie";

function hasCookies() {
    return !!readCookie("loggedin");
}

function hasUserSession() {
    return user_session && user_session.retrieve("username") !== null;
}

export { hasUserSession, hasCookies };
