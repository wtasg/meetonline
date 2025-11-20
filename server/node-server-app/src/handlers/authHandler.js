import { createUserAccount, getUserAccountByUsername } from "../database/user_account.js";
import { comparePassword, hashWithSalt, saltWithRounds } from "../utils/hash.js";
import { v4 as uuidv4 } from "uuid";
import { authStore, tokenStore } from "../utils/store.js";

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
async function signupHandlerGET(req, res) {
    const token = uuidv4();
    res.cookie("signup_token", token, {
        sameSite: "strict",
        httpOnly: false,
        secure: false,
        maxAge: 2 * 60 * 1000
    });
    await tokenStore.store(token, (new Date()).toUTCString());
    res.status(200).json({ ok: true, token });
}

async function signupHandlerPOST(req, res) {
    const { token, username, password } = req.body;
    if (!token || !username || !password) {
        return res.status(400).json({ ok: false, message: "Missing token, username or password", signup: false });
    }

    const tokenCreatedAt = new Date(await tokenStore.retrieve(token));
    if ((new Date() - tokenCreatedAt) / 1000 > 120) {
        const newToken = uuidv4();
        await tokenStore.store(newToken, (new Date()).toUTCString());
        await tokenStore.eject(token);
        return res.status(400).json({ ok: false, message: "Old token. Retry!", signup: false, token: newToken });
    }

    const salt = await saltWithRounds();
    const hashedPassword = await hashWithSalt(password, salt);
    createUserAccount(username, hashedPassword, salt).then(() => {
        res.json({ ok: true, signup: true, message: "Signup successful!" });
    }).catch((err) => {
        console.error("Error creating user account:", err);
        res.status(500).json({ ok: false, signup: false, message: "Internal server error" });
    });
}

async function loginHandlerGET(req, res) {
    const token = uuidv4();
    res.cookie("login_token", token, {
        sameSite: "strict",
        httpOnly: false,
        secure: false,
        maxAge: 2 * 60 * 1000
    });
    await tokenStore.store(token, (new Date()).toUTCString());
    res.json({ ok: true, token });
}

async function loginHandlerPOST(req, res) {
    const { cookies } = req;
    const { token, username: candidateUsername, password: candidatePassword } = req.body;
    if (!token || !candidateUsername || !candidatePassword) {
        return res.status(400).json({ ok: false, message: "Missing token, username or password", login: false });
    }
    const tokenCreatedAt = new Date(await tokenStore.retrieve(token));
    if ((new Date() - tokenCreatedAt) / 1000 > 120) {
        const newToken = uuidv4();
        await tokenStore.store(newToken, (new Date()).toUTCString());
        await tokenStore.eject(token);
        return res.status(403).json({ ok: false, message: "Old token. Retry!", login: false, token: newToken });
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

    const session_id = uuidv4();
    await authStore.store(`session_for_${candidateUsername}`, session_id);
    // @todo: setup cookies
    res.cookie("session-1", session_id, {
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

async function logoutHandlerPOST(req, res) {
    await destroySession(req, res);

    res.status(200)
        .json({ ok: true, logout: true, message: "Logout successful!" });
}

async function destroySession(req, res) {
    const { cookies } = req;
    const sessionId = cookies?.["session-1"];
    const username = cookies?.username;
    // clear cookies
    res.clearCookie("session-1");
    res.clearCookie("username");
    res.clearCookie("loggedin");

    if (sessionId && username) {
        const storedSession = await authStore.retrieve(`session_for_${username}`);
        if (storedSession === sessionId) {
            await authStore.eject(`session_for_${username}`);
        }
    }
}

export { setupAuthHandlers, authStore };
