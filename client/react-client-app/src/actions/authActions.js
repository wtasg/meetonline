import { login, signup, logout, prelogin, presignup } from "../net/auth";
import { resetLocation, resetUserSession, user_session } from "../session";

/**
 *
 * @returns {Promise<{ok:true}|{ok:false,message:string}>}
 */
async function preLoginAction() {
    try {
        const result = await prelogin();
        if (result.ok) {
            user_session.store("login_token", result.token);
        } else {
            result.message = "Cannot fetch login_token. Check Server.";
        }
        delete result.token;
        return result;
    }
    catch (err) {
        console.error(err);
        return { ok: false, message: err.message };
    }
}

/**
 *
 * @returns {Promise<{ok:true}|{ok:false,message:string}>}
 */
async function preSignupAction() {
    try {
        const result = await presignup();
        if (result.ok) {
            user_session.store("signup_token", result.token);
        } else {
            result.message = "Cannot fetch signup_token. Check Server.";
        }
        delete result.token;
        return result;
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message };
    }
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
    const token = user_session.retrieve("login_token");
    user_session.eject("login_token");
    const result = await login({ username, password, token });
    if (result.ok) {
        user_session.store("username", result.login.username);
        user_session.store("session", result.login.session);
        return true;
    }

    // failed login
    // refetching token when action fails
    await preLoginAction();
    user_session.eject("username");
    console.error(result.error);
    return false;
}

/**
 *
 * @param {{username:string, password:string}} userCredentials
 * @returns {Promise<{ok:boolean,signup:{username:string},message:string}>}
 */
async function signupAction({ username, password }) {
    if (!username || !password) {
        return Promise.reject("Username and password are required");
    }
    const token = user_session.retrieve("signup_token");
    user_session.eject("signup_token");
    const result = await signup({ username, password, token });
    if (result.ok) {
        return result;
    }
    // refetching token when action fails
    await preSignupAction();
    return result;
}

/**
 *
 * @returns {Promise<{ok: boolean, logout: boolean, message: string}>}
 */
async function logoutAction() {
    const usernameInSession = user_session.retrieve("username");
    if (!usernameInSession) {
        throw new Error("Username not found!");
    }
    resetUserSession();
    resetLocation();
    // server session destruction
    const result = await logout({ username: usernameInSession });
    if (!result.ok) {
        console.error(result.message);
    }
    return result;
}

export { loginAction, signupAction, logoutAction, preLoginAction, preSignupAction };
