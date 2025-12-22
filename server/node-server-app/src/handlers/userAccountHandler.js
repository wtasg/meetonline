import { getUserAccountByUsername } from "../database/user_account.js";
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";
import { apiRateLimiter } from "../middlewares/rateLimitMiddleware.js";

/**
 * Sets up user account route handlers.
 * @param {import('express').Application} app - The Express application instance.
 * @returns {void}
 */
function setupUserAccountHandler(app) {
    app.post("/user_account", apiRateLimiter, hybridAuthMiddleware, userAccountPOST);
}

/**
 * POST /user_account - Fetch the current user's account information.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
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
