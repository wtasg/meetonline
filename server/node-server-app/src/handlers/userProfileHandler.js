import { getUserProfileByUsername, updateUserProfile } from "../database/user_profile.js";
import { UserProfileModel } from "../models/userProfileModel.js";
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";
import { apiRateLimiter } from "../middlewares/rateLimitMiddleware.js";

/**
 * Sets up user profile route handlers.
 * @param {import('express').Application} app - The Express application instance.
 * @returns {void}
 */
function setupUserProfileHandler(app) {
    app.get("/user_profile", apiRateLimiter, hybridAuthMiddleware, userProfileGET);
    app.patch("/user_profile", apiRateLimiter, hybridAuthMiddleware, userProfilePATCH);
}

/**
 * GET /user_profile - Fetch the current user's profile.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function userProfileGET(req, res) {
    try {
        // User info is in req.user from hybrid middleware (works for both JWT and cookies)
        const username = req.user.username;
        const user_profile = await getUserProfileByUsername(username);

        if (user_profile.__isDefault || user_profile.__isNull) {
            return res.status(500)
                .json({
                    ok: false,
                    user_profile: UserProfileModel.null().toClient(),
                    message: "Cannot fetch proper user profile."
                });
        }

        return res.status(200)
            .json({
                ok: true,
                user_profile: user_profile.toClient(),
                message: "Success."
            });
    } catch (err) {
        console.error(err);
        return res.status(500)
            .json({
                ok: false,
                user_profile: UserProfileModel.null().toClient(),
                message: "CAUGHT ERROR."
            });
    }
}

/**
 * PATCH /user_profile - Update a field in the current user's profile.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function userProfilePATCH(req, res) {
    try {
        const { key, value } = req.body;
        // User info is in req.user from hybrid middleware (works for both JWT and cookies)
        const username = req.user.username;

        const result = await updateUserProfile(username, key, value);
        if (!result) {
            return res.status(500)
                .json({
                    ok: false,
                    user_profile: UserProfileModel.null().toClient(),
                    message: "Cannot update user profile."
                });
        }

        const profile = await getUserProfileByUsername(username);
        return res.status(200)
            .json({
                ok: true,
                user_profile: profile.toClient(),
                message: "Success"
            });
    } catch (err) {
        console.error(err);
        return res.status(500)
            .json({
                ok: false,
                user_profile: UserProfileModel.null().toClient(),
                message: "CAUGHT ERROR."
            });
    }
}

export {
    setupUserProfileHandler
};
