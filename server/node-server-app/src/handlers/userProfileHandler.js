import { getUserProfileByUsername, updateUserProfile } from "../database/user_profile.js";
import { UserProfileModel } from "../models/userProfileModel.js";
import { userSession } from "../utils/session.js";

/**
 *
 * @param {Express} app
 */
function setupUserProfileHandler(app) {
    app.get("/user_profile", userProfileGET);
    app.patch("/user_profile", userProfilePATCH);
}

async function userProfileGET(req, res) {
    try {
        const { cookies } = req;
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                user_profile: UserProfileModel.null().toClient(),
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
                    user_profile: UserProfileModel.null().toClient(),
                    message: "Missing Session."
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
                    user_profile: UserProfileModel.null().toClient(),
                    message: "Invalid Session."
                });
        }

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
        const { cookies } = req;
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                user_profile: UserProfileModel.null().toClient(),
                message: "Invalid Session."
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
                    user_profile: UserProfileModel.null().toClient(),
                    message: "Invalid Session."
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
                    user_profile: UserProfileModel.null().toClient(),
                    message: "Invalid session."
                });
        }

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
