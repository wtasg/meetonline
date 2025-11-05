import { createUserAccount, getUserAccountByUsername } from "../database/user_account.js";
import { comparePassword, hashWithSalt, saltWithRounds } from "../utils/hash.js";
import { user_sessions } from "../utils/session.js";
import { v4 as uuidv4 } from "uuid";
/**
 *
 * @param {Express.Application} app
 */
function setupAuthHandlers(app) {
    app.get("/signup", signupHandlerGET);
    app.post("/signup", signupHandlerPOST);
    app.get("/login", loginHandlerGET);
    app.post("/login", loginHandlerPOST);
    app.post("/logout", logoutHandlerPOST);
}

/**
 * Initiates the signup process by generating a UUID token, storing it in `user_sessions.register`, setting a short-lived `signup_token` cookie, and responding with a confirmation JSON message.
 *
 * The cookie is set with SameSite=strict, httpOnly=false, secure=false, and a 2-minute expiration.
 */
function signupHandlerGET(req, res) {
    // const { cookies, signedCookies } = req;
    const token = uuidv4();
    user_sessions.register = { ...(user_sessions.register || {}), token };
    res.cookie("signup_token", token, {
        sameSite: "strict",
        httpOnly: false,
        secure: false,
        maxAge: 2 * 60 * 1000
    });
    /* todo: Generate a token here and send it.
     * This token will be consumed by POST /signup endpoint.
     */
    res.status(200).json({ ok: true, message: "GET /signup says hello!" });
}

/**
 * Handle POST /signup requests to create a new user account and establish a session cookie.
 *
 * Expects `token`, `username`, and `password` in the request body. If any are missing, responds with HTTP 400 and JSON { ok: false, message: "Missing token, username or password", signup: false }.
 * On successful account creation, sets an HTTP-only session cookie named `session-1` (SameSite=strict, 36-hour maxAge) and responds with JSON { ok: true, login: true }.
 * On internal errors during account creation, responds with HTTP 500 and JSON { ok: false, login: false, error: "Internal server error" }.
 */
async function signupHandlerPOST(req, res) {
    // const { cookies, signedCookies } = req;

    const { token, username, password } = req.body;
    if (!token || !username || !password) {
        return res.status(400).json({ ok: false, message: "Missing token, username or password", signup: false });
    }
    const salt = await saltWithRounds(); // todo: Generate a proper salt
    const hashedPassword = await hashWithSalt(password, salt);
    createUserAccount(username, hashedPassword, salt).then(() => {
        res.cookie("session-1", "sha256-session-string", {
            sameSite: "strict",
            httpOnly: true,
            secure: false,
            maxAge: 36 * 60 * 60 * 1000
        });
        res.json({ ok: true, login: true });
    }).catch((err) => {
        console.error("Error creating user account:", err);
        res.status(500).json({ ok: false, login: false, error: "Internal server error" });
    });
}

/**
 * Create a short-lived login token, persist it to user_sessions.login, set it as the `login_token` cookie, and return the token.
 *
 * @returns {{ok: true, token: string}} JSON response with `ok: true` and the generated `token`.
 */
function loginHandlerGET(req, res) {
    // const { cookies, signedCookies } = req;
    const token = uuidv4();
    user_sessions.login = { ...(user_sessions.login || {}), token };
    res.cookie("login_token", token, {
        sameSite: "strict",
        httpOnly: false,
        secure: false,
        maxAge: 2 * 60 * 1000
    });
    res.json({ ok: true, token });
}

/**
 * Authenticate a user using a one-time login token and password, establish a session, and set session cookies.
 *
 * Validates presence of `token`, `username`, and `password` in `req.body` and verifies the provided token matches the `login_token` cookie.
 * On successful credential verification, stores a session entry under `user_sessions.sessions[username]` and sets the
 * `session-1`, `username`, and `loggedin` cookies (36-hour expiry). On failure, sends an appropriate HTTP status with JSON or text.
 *
 * @param {import('express').Request} req - Express request; expects `body.token`, `body.username`, `body.password` and request cookies (including `login_token`).
 * @param {import('express').Response} res - Express response used to send HTTP responses and to set cookies.
 */
async function loginHandlerPOST(req, res) {
    const { cookies, signedCookies } = req;
    console.log({ cookies, signedCookies });
    const { token, username: candidateUsername, password: candidatePassword } = req.body;
    if (!token || !candidateUsername || !candidatePassword) {
        return res.status(400).json({ ok: false, message: "Missing token, username or password", login: false });
    }
    if (cookies["login_token"] !== token) {
        return res.status(403).json({ ok: false, message: "Invalid login token.", login: false });
    }
    let dbuser = null;
    // get user from database
    dbuser = await getUserAccountByUsername(candidateUsername);
    if (dbuser.__isDefault || dbuser.__isNull || !dbuser.isActive || dbuser.isDeleted || dbuser.isBlocked) {
        return res.status(401).send("Account not found or active.");
    }

    let { salt, password } = dbuser;
    try {
        if (!(await comparePassword(candidatePassword, salt, password))) {
            return res.status(401).json({ ok: false, message: "Invalid credentials.", login: false });
        }
    } catch (error) {
        console.error("Error hashing input password:", error);
        return res.status(500).json({ ok: false, message: "Internal Server Error", login: false });
    }

    // @todo: setup session
    user_sessions.sessions = (user_sessions.sessions || {});
    user_sessions.sessions[candidateUsername] = "sha256-session-string";
    // @todo: setup cookies
    res.cookie("session-1", "sha256-session-string", {
        sameSite: "strict",
        httpOnly: true,
        secure: false,
        maxAge: 36 * 60 * 60 * 1000
    });
    res.cookie("username", candidateUsername, {
        sameSite: "strict",
        httpOnly: true,
        secure: false,
        maxAge: 36 * 60 * 60 * 1000
    });
    res.cookie("loggedin", candidateUsername, {
        sameSite: "strict",
        httpOnly: false,
        secure: false,
        maxAge: 36 * 60 * 60 * 1000
    });
    res.json({ ok: true, login: true });
}

/**
 * Ends a user's session by clearing the server-side session entry and related cookies, then responds with a logout confirmation.
 * @param {import('express').Request} req - Express request; expects `req.body.username` identifying the account to log out.
 * @param {import('express').Response} res - Express response used to clear cookies (`session-1`, the username cookie, `loggedin`) and send the JSON confirmation.
 */
function logoutHandlerPOST(req, res) {
    // const { cookies, signedCookies } = req;
    const username = req.body.username;
    // security bug
    user_sessions.sessions = (user_sessions.sessions || {});
    user_sessions.sessions[username] = null;
    res.clearCookie("session-1");
    res.clearCookie(username);
    res.clearCookie("loggedin");
    res.json({ ok: true, logout: true });
}

export { setupAuthHandlers };