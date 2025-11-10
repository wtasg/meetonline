import { login, signup, logout, prelogin, presignup } from "../net/auth";
import { user_session } from "../session";
import { deleteCookie } from "../utils/cookie";

async function preLoginAction() {
    await prelogin();
}

async function preSignupAction() {
    await presignup();
}

/**
 * POST /login action
 * @param {{username: string, password: string}} credentials
 * @returns {Promise<true|false>}
 */
async function loginAction({ username, password }) {
    if (!username || !password) {
        return Promise.reject("Username and password are required");
    }
    const result = await login({ username, password });

    if (result.ok) {
        user_session.store("username", username);
        return true;
    }

    // failed login
    user_session.eject("username");
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
    deleteCookie("loggedin");
    const usernameInSession = user_session.retrieve("username");
    if (!usernameInSession) {
        throw new Error("Username not found!");
    }
    user_session.eject("username");
    // server session destruction
    const result = await logout({ username: usernameInSession });
    if (!result.ok) {
        throw new Error("Could not logout from server!");
    }
    return result;
}

export { loginAction, signupAction, logoutAction, preLoginAction, preSignupAction };
