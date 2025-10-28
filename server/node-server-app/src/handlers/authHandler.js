import { createUserAccount } from "../database/user_account.js";

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
 * @param {Express.Request} _
 * @param {Express.Response} res
 */
function signupHandlerGET(_, res) {
    /* todo: Generate a token here and send it.
     * This token will be consumed by POST /signup endpoint.
     */
    res.send("GET /signup says hello!");
}

function signupHandlerPOST(req, res) {
    console.log("Received signup request:", req.body);
    const { token, username, password } = req.body;
    if (!token || !username || !password) {
        return res.status(400).send("Missing token, username or password");
    }
    const salt = "salt"; // todo: Generate a proper salt
    const hashedPassword = password + salt; // todo: Use a proper hashing function
    console.log(`Username: ${username}, Hashed Password: ${hashedPassword}, Salt: ${salt}`);
    createUserAccount(username, hashedPassword, salt).then(() => {
        res.send("User registered successfully!");
    }).catch((err) => {
        console.error("Error creating user account:", err);
        res.status(500).send("Internal server error");
    });
}

function loginHandlerGET(_, res) {
    res.send("GET /login says hello!");
}

function loginHandlerPOST(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send("Missing username or password");
    }
    console.log(`Username: ${username}, Password: ${password}`);
    res.send("User logged in successfully!");
}

export { setupAuthHandlers };
