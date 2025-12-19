import { getUserAccountByUsername } from "../database/user_account.js";
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";
import { apiRateLimiter } from "../middlewares/rateLimitMiddleware.js";

/**
 *
 * @param {Express.Application} app
 */
function setupUserAccountHandler(app) {
    app.post("/user_account", apiRateLimiter, hybridAuthMiddleware, userAccountPOST);
}

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function userAccountPOST(req, res) {
    try {
        // User info is in req.user from hybrid middleware (works for both JWT and cookies)
        const username = req.user.username;
        const { createdAt, modifiedAt } = await getUserAccountByUsername(username);
        
        return res.status(200)
            .json({
                username,
                createdAt,
                modifiedAt
            });
    } catch (err) {
        console.error(err);
        return res.status(500)
            .json({
                ok: false,
                user_account: false,
                message: "Server failed to fetch user account from database."
            });
    }
}

export { setupUserAccountHandler };
