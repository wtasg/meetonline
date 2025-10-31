import { createUserAccount, getUserAccountByUsername } from "../database/user_account.js";
import { hashWithSalt, saltWithRounds } from "../utils/hash.js";

/**
 *
 * @param {Express.Application} app
 */
function setupAuthHandlers(app) {
    app.get("/signup", signupHandlerGET);
    app.post("/signup", signupHandlerPOST);
    app.get("/login", loginHandlerGET);
    app.post("/login", loginHandlerPOST);
}

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function signupHandlerGET(req, res) {
    const { cookies, signedCookies } = req;
    console.log({ cookies, signedCookies });

    /* todo: Generate a token here and send it.
     * This token will be consumed by POST /signup endpoint.
     */
    res.send("GET /signup says hello!");
}

async function signupHandlerPOST(req, res) {
    const { cookies, signedCookies } = req;
    console.log({ cookies, signedCookies });

    console.log("Received signup request:", req.body);
    const { token, username, password } = req.body;
    if (!token || !username || !password) {
        return res.status(400).send("Missing token, username or password");
    }
    const salt = await saltWithRounds(); // todo: Generate a proper salt
    const hashedPassword = await hashWithSalt(password, salt);
    console.log(`Username: ${username}, Hashed Password: ${hashedPassword}, Salt: ${salt}`);
    createUserAccount(username, hashedPassword, salt).then(() => {
        res.send("User registered successfully!");
    }).catch((err) => {
        console.error("Error creating user account:", err);
        res.status(500).send("Internal server error");
    });
}

function loginHandlerGET(req, res) {
    const { cookies, signedCookies } = req;
    console.log({ cookies, signedCookies });

    res.send("GET /login says hello!");
}

async function loginHandlerPOST(req, res) {
    const { cookies, signedCookies } = req;
    console.log({ cookies, signedCookies });

    const { token, username: candidateUsername, password: candidatePassword } = req.body;
    if (!token || !candidateUsername || !candidatePassword) {
        return res.status(400).send("Missing token, username or password");
    }
    console.log(`Username: ${candidateUsername}, Password: ${candidatePassword}`);
    let dbuser = null;
    // get from database
    dbuser = await getUserAccountByUsername(candidateUsername);
    console.log("Fetched user from database:", dbuser);
    if (dbuser.__isDefault || dbuser.__isNull || !dbuser.isActive || dbuser.isDeleted || dbuser.isBlocked) {
        return res.status(401).send("Account not found or active.");
    }

    let { salt, password } = dbuser;
    try {
        const hashedInputPassword = await hashWithSalt(candidatePassword, salt);
        if (hashedInputPassword !== password) {
            return res.status(401).send("Invalid credentials.");
        }
    } catch (error) {
        console.error("Error hashing input password:", error);
        return res.status(500).send("Internal server error");
    }

    console.log(`User ${candidateUsername} authenticated successfully.`);
    // @todo: setup session
    // @todo: setup cookies
    // @todo: setup JWT token
    res.send("User logged in successfully!");

}

export { setupAuthHandlers };
