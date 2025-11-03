import { login, signup, logout } from "../net/auth";
import { user_session } from "../session";
import { hasUserSession } from "../utils/session";

async function loginAction({ username, password }) {
    if (!username || !password) {
        return Promise.reject("Username and password are required");
    }
    const result = JSON.parse(await login({ username, password }));
    console.log({ result });
    if (result.ok) {
        user_session["username"] = username;
    } else {
        user_session["username"] = null;
    }
    return result;
}

async function signupAction({ username, password }) {
    if (!username || !password) {
        return Promise.reject("Username and password are required");
    }
    return await signup({ username, password });
}

async function logoutAction() {
    console.log(user_session, user_session["username"]);
    if (!hasUserSession()) {
        throw new Error("Username not found!");
    } else {
        user_session["username"] = null;
    }
    return await logout({ username: user_session["username"] });
}

export { loginAction, signupAction, logoutAction };
