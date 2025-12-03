import { login, signup, logout, prelogin, presignup } from "../net/auth";
import { user_session } from "../session";

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
    // console.log(JSON.stringify({ actionResult: result }), null, 4);
    if (result.ok) {
        user_session.store("username", result.login.username);
        user_session.store("session", result.login.session);
        return true;
    }

    // failed login
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
    return await signup({ username, password });
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
    user_session.eject("username");
    user_session.eject("session");
    // server session destruction
    const result = await logout({ username: usernameInSession });
    if (!result.ok) {
        throw new Error("Could not logout from server!");
    }
    return result;
}

export { loginAction, signupAction, logoutAction, preLoginAction, preSignupAction };
