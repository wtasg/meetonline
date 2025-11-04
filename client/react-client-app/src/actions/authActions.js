import { login, signup, logout } from "../net/auth";
import { user_session } from "../session";
import { hasUserSession } from "../utils/session";

/**
 * POST /login action
 * @param {{username: string, password: string}} credentials
 * @returns {Promise<true|false>}
 */
async function loginAction({ username, password }) {
    if (!username || !password) {
        return Promise.reject("Username and password are required");
    }
    const result = JSON.parse(await login({ username, password }));

    if (result.ok) {
        user_session["username"] = username;
        return true;
    }

    // failed login
    user_session["username"] = null;
    console.error(result.error);
    return false;
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
