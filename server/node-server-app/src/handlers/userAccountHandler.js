import { getUserAccountByUsername } from "../database/user_account.js";
import { userSession } from "../utils/session.js";

/**
 *
 * @param {Express.Application} app
 */
function setupUserAccountHandler(app) {
    app.post("/user_account", userAccountPOST);
}

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function userAccountPOST(req, res) {
    try {
        const { cookies } = req;
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                user_account: false,
                message: "Missing Cookie Headers."
            });
        }
        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400)
                .json({
                    ok: false,
                    user_account: false,
                    message: "Missing session."
                });
        }
        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403)
                .json({
                    ok: false,
                    user_account: false,
                    message: "Invalid session."
                });
        }

        const { createdAt, modifiedAt } = await getUserAccountByUsername(username);

        return res.status(200)
            .json({
                username,
                createdAt,
                modifiedAt
            });
    } catch (err) {
        console.error(err);
        res.clearCookie("session-1");
        res.clearCookie("username");
        res.clearCookie("loggedin");
        return res.status(500)
            .json({
                ok: false,
                user_account: false,
                message: "Server failed to fetch user account from database."
            });
    }
}

export { setupUserAccountHandler };
