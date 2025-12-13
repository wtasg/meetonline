import { getUserProfileByUsername, updateUserProfile } from "../database/user_profile.js";
import { UserProfileModel } from "../models/userProfileModel.js";
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";

/**
 *
 * @param {Express} app
 */
function setupUserProfileHandler(app) {
    app.get("/user_profile", hybridAuthMiddleware, userProfileGET);
    app.patch("/user_profile", hybridAuthMiddleware, userProfilePATCH);
}

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
