import { getUserProfileByUsername, updateUserProfile } from "../database/user_profile.js";
import { userSession } from "../utils/session.js";

/**
 *
 * @param {Express} app
 */
function setupUserProfileHandler(app) {
    app.post("/user_profile", userProfilePOST);
    app.patch("/user_profile", userProfilePATCH);
}

async function userProfilePOST(req, res) {
    try {
        const { cookies } = req;
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                user_profile: false,
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
                    user_profile: false,
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
                    user_profile: false,
                    message: "Invalid session."
                });
        }

        const user_profile = await getUserProfileByUsername(username);
        if (user_profile.__isDefault || user_profile.__isNull) {
            return res.status(500)
                .json({
                    ok: false,
                    user_profile: false,
                    message: "Cannot fetch proper user profile."
                });
        }

        return res.status(200)
            .json({
                ok: true,
                user_profile: user_profile.toClient(),
                message: "success"
            });
    } catch (err) {
        console.error(err);
        return res.status(500)
            .json({
                ok: false,
                user_profile: false,
                message: "CAUGHT ERROR."
            });
    }
}

async function userProfilePATCH(req, res) {
    try {
        const { username: bodyUsername, key, value } = req.body;
        const { cookies } = req;
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                user_profile: false,
                message: "Invalid Session."
            });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username || username !== bodyUsername) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400)
                .json({
                    ok: false,
                    user_profile: false,
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
                    user_profile: false,
                    message: "Invalid session."
                });
        }

        const result = await updateUserProfile(username, key, value);
        if (!result) {
            return res.status(500)
                .json({
                    ok: false,
                    user_profile: false,
                    message: "Cannot update user profile."
                });
        }

        return res.status(200)
            .json({
                ok: true,
                user_profile: true,
                message: "Success"
            });
    } catch (err) {
        console.error(err);
        return res.status(500)
            .json({
                ok: false,
                user_profile: false,
                message: "CAUGHT ERROR."
            });
    }
}

export {
    setupUserProfileHandler
};
