import { login, signup, logout, prelogin, presignup } from "../net/auth";
import { user_session } from "../session";
import { hasUserSession } from "../utils/session";

/**
 * Perform server-side pre-login preparation by invoking the prelogin step.
 */
async function preLoginAction() {
    await prelogin();
}

/**
 * Perform client-side preparation required before signup.
 */
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

/**
 * Clear the current username from the in-memory session and invoke the logout operation.
 *
 * @throws {Error} If no user session is present ("Username not found!").
 * @returns {*} The value returned by the `logout` call.
 */
async function logoutAction() {
    console.log(user_session, user_session["username"]);
    if (!hasUserSession()) {
        throw new Error("Username not found!");
    } else {
        user_session["username"] = null;
    }
    return await logout({ username: user_session["username"] });
}

export { loginAction, signupAction, logoutAction, preLoginAction, preSignupAction };