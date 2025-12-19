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
        if (r1.rowCount === 0) {
            return UserProfileModel.null();
        }
        const id = r1.rows[0].id;
        const q2 = "SELECT * from public.user_profile WHERE user_id = $1";
        const v2 = [id];
        const r2 = await pool.query(q2, v2);
        if (r2.rowCount === 0) {
            const q3 =
                `INSERT INTO public.user_profile
                (user_id, profile_name, display_name, phone_number, email, address, website_url)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7)
            `;
            const v3 = [id, "", username, "", "", "", ""];
            await pool.query(q3, v3);
        }
        const id2 = r1.rows[0].id;
        const q4 = "SELECT * from public.user_profile WHERE user_id = $1";
        const v4 = [id2];
        const r4 = await pool.query(q4, v4);
        return UserProfileModel.fromDatabaseRow(r4.rows[0]);

    } catch (err) {
        console.error("ERROR: fetching user profile.");
        console.error(err);
        return UserProfileModel.null();
    }
}

/**
 * what do you think?!
 * @param {string} username
 * @param {string} key
 * @param {string} value
 * @returns {Promise<boolean>}
 */
async function updateUserProfile(username, key, value) {
    key = userProfileKeyMap[key];
    if (!key) {
        console.error("Invalid key");
        return false;
    }
    try {
        const id = (await getUserAccountByUsername(username)).id;
        // fetch profile to see if it exists
        const profile = await getUserProfileByUsername(username);
        if (profile.__isNull || profile.__isDefault) {
            const q1 =
                `INSERT INTO public.user_profile
                (user_id, profile_name, display_name, phone_number, email, address, website_url)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7)
            `;
            const v1 = [id, "", username, "", "", "", ""];
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

/**
 * Soft delete user profile
 * @param {string} userProfileId - User profile ID
 * @returns {Promise<boolean>}
 */
async function deleteUserProfile(userProfileId) {
    try {
        const query = `
            UPDATE public.user_profile 
            SET is_deleted = true, 
                deleted_at = CURRENT_TIMESTAMP, 
                modified_at = CURRENT_TIMESTAMP 
            WHERE id = $1
        `;
        const values = [userProfileId];
        const res = await pool.query(query, values);
        return res.rowCount > 0;
    } catch (err) {
        console.error("ERROR: deleteUserProfile");
        console.error(err);
        return false;
    }
}

/**
 * Hard delete user profile (permanent deletion)
 * @param {string} userProfileId - User profile ID
 * @returns {Promise<boolean>}
 */
async function hardDeleteUserProfile(userProfileId) {
    try {
        const query = "DELETE FROM public.user_profile WHERE id = $1";
        const values = [userProfileId];
        const res = await pool.query(query, values);
        return res.rowCount > 0;
    } catch (err) {
        console.error("ERROR: hardDeleteUserProfile");
        console.error(err);
        return false;
    }
}

export {
    getUserProfileByUsername,
    updateUserProfile,
    deleteUserProfile,
    hardDeleteUserProfile,
};
