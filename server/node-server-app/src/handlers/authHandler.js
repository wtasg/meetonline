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
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
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
    res.status(200).json({ ok: true, token });
}

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
        res.json({ ok: true, signup: true, message: "Signup successful!" });
    }).catch((err) => {
        console.error("Error creating user account:", err);
        res.status(500).json({ ok: false, signup: false, message: "Internal server error" });
    });
}

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
        return res.status(401).json({ ok: false, login: false, message: "Account not found or active." });
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
    res.status(200).json({ ok: true, login: true, message: "Login successful!" });
}

function logoutHandlerPOST(req, res) {
    // const { cookies, signedCookies } = req;
    const username = req.body.username;
    // @todo security bug: find it
    user_sessions.sessions = (user_sessions.sessions || {});
    user_sessions.sessions[username] = null;

    // clear cookies
    res.clearCookie("session-1");
    res.clearCookie("username");
    res.clearCookie("loggedin");
    // only success case
    res.status(200).json({ ok: true, logout: true, message: "Logout successful!" });
}

export { setupAuthHandlers };
