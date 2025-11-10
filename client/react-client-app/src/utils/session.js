import { user_session } from "../session";
import { readCookie } from "./cookie";

function hasAuthCookies() {
    return !!readCookie("loggedin");
}

function hasUserSession() {
    return hasAuthCookies() && user_session && user_session.retrieve("username") !== null;
}

export { hasUserSession, hasAuthCookies };
