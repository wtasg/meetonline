import { pool } from "./db.js";
import { getUserProfileByUsername } from "./user_profile.js";
import {
    userSettingsKeyMap,
    UserSettingsModel,
    VALID_THEMES,
    VALID_SCHEMES,
    VALID_FILTERS,
    VALID_FONT_SIZES,
    VALID_FONT_CONTRASTS
} from "../models/userSettingsModel.js";

/**
 * Get user settings by username
 * @param {string} username The username string
 * @returns {Promise<UserSettingsModel>}
 */
async function getUserSettingsByUsername(username) {
    try {
        const profile = await getUserProfileByUsername(username);
        if (profile.__isNull || profile.__isDefault) {
            return UserSettingsModel.null();
        }
        const profileId = profile.id;

        const q1 = "SELECT * FROM public.user_settings WHERE user_profile_id = $1";
        const v1 = [profileId];
        const r1 = await pool.query(q1, v1);

        if (r1.rowCount === 0) {
            // Create default settings for the user
            const q2 = `INSERT INTO public.user_settings
                (user_profile_id, theme, scheme, filter, font_size, font_family, font_contrast, notifications, online_presence, sounds)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *`;
            const v2 = [profileId, "gray", "light", "default", "medium", "system-ui", "normal", true, true, true];
            const r2 = await pool.query(q2, v2);
            return UserSettingsModel.fromDatabaseRow(r2.rows[0]);
        }

        return UserSettingsModel.fromDatabaseRow(r1.rows[0]);
    } catch (err) {
        console.error("ERROR: fetching user settings.");
        console.error(err);
        return UserSettingsModel.null();
    }
}

/**
 * Allowed database column names for user_settings updates
 */
const ALLOWED_DB_COLUMNS = new Set([
    "theme", "scheme", "filter", "font_size", "font_family", "font_contrast",
    "notifications", "online_presence", "sounds"
]);

/**
 * Update a single setting for a user
 * @param {string} username
 * @param {string} key
 * @param {string|boolean} value
 * @returns {Promise<boolean>}
 */
async function updateUserSettings(username, key, value) {
    const dbKey = userSettingsKeyMap[key];
    if (!dbKey || !ALLOWED_DB_COLUMNS.has(dbKey)) {
        console.error("Invalid key:", key);
        return false;
    }

    // Validate values based on key
    if (!validateSettingValue(key, value)) {
        console.error("Invalid value for key:", key, value);
        return false;
    }

    try {
        const profile = await getUserProfileByUsername(username);
        if (profile.__isNull || profile.__isDefault) {
            return false;
        }
        const profileId = profile.id;

        // Ensure settings exist
        const settings = await getUserSettingsByUsername(username);
        if (settings.__isNull) {
            return false;
        }

        // dbKey is validated against ALLOWED_DB_COLUMNS whitelist above
        const q1 = `UPDATE public.user_settings SET ${dbKey} = $1, modified_at = CURRENT_TIMESTAMP WHERE user_profile_id = $2`;
        const v1 = [value, profileId];
        await pool.query(q1, v1);

        return true;
    } catch (err) {
        console.error("ERROR: updating user settings.");
        console.error(err);
        return false;
    }
}

/**
 * Validate a setting value based on its key
 * @param {string} key
 * @param {*} value
 * @returns {boolean}
 */
function validateSettingValue(key, value) {
    switch (key) {
        case "theme":
            return VALID_THEMES.includes(value);
        case "scheme":
            return VALID_SCHEMES.includes(value);
        case "filter":
            return VALID_FILTERS.includes(value);
        case "fontSize":
            return VALID_FONT_SIZES.includes(value);
        case "fontContrast":
            return VALID_FONT_CONTRASTS.includes(value);
        case "fontFamily":
            return typeof value === "string" && value.length > 0 && value.length <= 128;
        case "notifications":
        case "onlinePresence":
        case "sounds":
            return typeof value === "boolean";
        default:
            return false;
    }
}

export {
    getUserSettingsByUsername,
    updateUserSettings,
    validateSettingValue
};
