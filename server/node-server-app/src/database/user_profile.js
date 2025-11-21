import { getUserAccountByUsername } from "./user_account.js";
import { userProfileKeyMap, UserProfileModel } from "../models/userProfileModel.js";

import { pool } from "./db.js";

/**
 *
 * @param {string} username The username string
 * @returns {UserProfileModel}
 */
async function getUserProfileByUsername(username) {
    try {
        const q1 = "SELECT * FROM public.user_account WHERE username = $1";
        const v1 = [username];
        const r1 = await pool.query(q1, v1);
        const id = r1.rows[0].id;

        const q2 = "SELECT * from public.user_profile WHERE user_id = $1";
        const v2 = [id];
        const r2 = await pool.query(q2, v2);
        const profile = UserProfileModel.fromDatabaseRow(r2.rows[0]);
        return profile;
    } catch (err) {
        console.error("ERROR: fetching user profile.");
        console.error(err);
        return UserProfileModel.null();
    }
}

async function updateUserProfile(username, key, value) {
    key = userProfileKeyMap[key];
    try {
        const id = (await getUserAccountByUsername(username)).id;
        // fetch profile to see if it exists
        const profile = getUserProfileByUsername(username);
        if (profile.__isNull || profile.__isDefault) {
            const q1 =
                `INSERT INTO public.user_profile
                (user_id, display_name)
                VALUES
                ($1, $2)
            `;
            const v1 = [id, username];
            await pool.query(q1, v1);
        }
        // security issue

        const q2 = `UPDATE public.user_profile SET ${key} = $1 WHERE user_id = ${id}`;
        const v2 = [value];
        await pool.query(q2, v2);

        return true;
    }
    catch (err) {
        console.error("ERROR: updating user profile.");
        console.error(err);
        return false;
    }
}

export {
    getUserProfileByUsername,
    updateUserProfile,
};
