import { login, signup, logout, prelogin, presignup } from "../net/auth";
import { user_session } from "../session";
import { hasUserSession } from "../utils/session";

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
    console.log(user_session, user_session.retrieve("username"));
    if (!hasUserSession()) {
        throw new Error("Username not found!");
    }
    const result = await logout({ username: user_session.retrieve("username") });
    if (!result.ok) {
        throw new Error("Could not logout!");
    }
    user_session.eject("username");
    return result;
}

export { loginAction, signupAction, logoutAction, preLoginAction, preSignupAction };
