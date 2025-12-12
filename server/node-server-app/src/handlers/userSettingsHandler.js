import { getUserSettingsByUsername, updateUserSettings } from "../database/user_settings.js";
import { UserSettingsModel } from "../models/userSettingsModel.js";
import { userSession } from "../utils/session.js";

/**
 * Setup user settings handler routes
 * @param {Express} app
 */
function setupUserSettingsHandler(app) {
    app.get("/user_settings", userSettingsGET);
    app.patch("/user_settings", userSettingsPATCH);
}

async function userSettingsGET(req, res) {
    try {
        const { cookies } = req;
        if (!cookies) {
            return res.status(400).json({
                ok: false,
                user_settings: UserSettingsModel.null().toClient(),
                message: "Missing Cookie Headers."
            });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({
                ok: false,
                user_settings: UserSettingsModel.null().toClient(),
                message: "Missing Session."
            });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({
                ok: false,
                user_settings: UserSettingsModel.null().toClient(),
                message: "Invalid Session."
            });
        }

        const user_settings = await getUserSettingsByUsername(username);
        if (user_settings.__isNull) {
            return res.status(500).json({
                ok: false,
                user_settings: UserSettingsModel.null().toClient(),
                message: "Cannot fetch user settings."
            });
        }

        return res.status(200).json({
            ok: true,
            user_settings: user_settings.toClient(),
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            user_settings: UserSettingsModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

async function userSettingsPATCH(req, res) {
    try {
        const { key, value } = req.body;
        const { cookies } = req;

        if (!cookies) {
            return res.status(400).json({
                ok: false,
                user_settings: UserSettingsModel.null().toClient(),
                message: "Missing Cookie Headers."
            });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({
                ok: false,
                user_settings: UserSettingsModel.null().toClient(),
                message: "Missing Session."
            });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({
                ok: false,
                user_settings: UserSettingsModel.null().toClient(),
                message: "Invalid Session."
            });
        }

        if (!key || value === undefined) {
            return res.status(400).json({
                ok: false,
                user_settings: UserSettingsModel.null().toClient(),
                message: "Missing key or value."
            });
        }

        const result = await updateUserSettings(username, key, value);
        if (!result) {
            return res.status(500).json({
                ok: false,
                user_settings: UserSettingsModel.null().toClient(),
                message: "Cannot update user settings."
            });
        }

        const settings = await getUserSettingsByUsername(username);
        return res.status(200).json({
            ok: true,
            user_settings: settings.toClient(),
            message: "Success"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            user_settings: UserSettingsModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

export {
    setupUserSettingsHandler
};
