import { login, signup } from "../net/auth";

async function loginAction({ username, password }) {
    if (!username || !password) {
        return Promise.reject("Username and password are required");
    }
    return await login({ username, password });
}

async function signupAction({ username, password }) {
    if (!username || !password) {
        return Promise.reject("Username and password are required");
    }
    return await signup({ username, password });
}

export { loginAction, signupAction };
