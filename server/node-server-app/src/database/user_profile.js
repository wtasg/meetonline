import { UserProfileModel } from "../models/userProfileModel.js";
import { pool } from "./db.js";

/**
 *
 * @param {string} username The username string
 * @returns {UserProfileModel}
 */
async function getUserProfileByUsername(username) {
    try {
        const q1 = "SELECT id FROM user_account WHERE username = $1";
        const v1 = [username];
        const r1 = await pool.query(q1, v1);
        console.log({ r1 });
        const id = r1.rows[0];
        console.log({ id });

        const q2 = "SELECT * from user_profile WHERE user_id = $1";
        const v2 = [id];
        const r2 = await pool.query(q2, v2);
        console.log({ r2 });
        const profile = UserProfileModel.fromDatabaseRow(r2.rows[0]);
        console.log({ profile });
        return profile;
    } catch (err) {
        console.error("ERROR: fetching user id from user account.");
        console.error(err);
        return UserProfileModel.null();
    }
}

export {
    getUserProfileByUsername
};
