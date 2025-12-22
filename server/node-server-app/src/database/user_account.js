import { UserAccountModel } from "../models/userAccountModel.js";
import { pool } from "./db.js";

/**
 * Fetches a user account by username.
 * @param {string} username - The username received from client.
 * @returns {Promise<import('../models/userAccountModel.js').UserAccountModel>} User account information.
 */
async function getUserAccountByUsername(username) {
    try {
        const query = "SELECT * FROM user_account WHERE username = $1";
        const values = [username];
        const res = await pool.query(query, values);
        return UserAccountModel.fromDatabaseRow(res.rows[0]);
    }
    catch (error) {
        console.error("Error fetching user account by username:", error);
        return UserAccountModel.default();
    }
}

/**
 * Creates a new user account.
 * @param {string} username - The username.
 * @param {string} password - The hashed password.
 * @param {string} salt - The password salt.
 * @returns {Promise<import('../models/userAccountModel.js').UserAccountModel>} The created user account.
 */
async function createUserAccount(username, password, salt) {
    const query = `
        INSERT INTO user_account (username, password, salt, is_active, is_deleted, is_blocked, is_forgotten)
        VALUES ($1, $2, $3, true, false, false, false)
        RETURNING *`;
    const values = [username, password, salt];
    const res = await pool.query(query, values);
    return UserAccountModel.fromDatabaseRow(res.rows[0]);
}

/**
 * Updates user account status fields.
 * @param {string|number} userId - The user ID.
 * @param {Object} updates - Object with fields to update.
 * @returns {Promise<import('../models/userAccountModel.js').UserAccountModel>} The updated user account.
 */
async function updateUserAccountStatus(userId, updates) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
    }
    values.push(userId);

    const query = `
        UPDATE user_account
        SET ${fields.join(", ")}, modified_at = CURRENT_TIMESTAMP
        WHERE id = $${index}
        RETURNING *`;

    const res = await pool.query(query, values);
    return UserAccountModel.fromDatabaseRow(res.rows[0]);
}

/**
 * Soft deletes a user account.
 * @param {string|number} userId - The user ID.
 * @returns {Promise<void>}
 */
async function deleteUserAccount(userId) {
    const query = `
        UPDATE user_account
        SET is_deleted = true,
            deleted_at = CURRENT_TIMESTAMP,
            modified_at = CURRENT_TIMESTAMP
        WHERE id = $1
    `;
    const values = [userId];
    await pool.query(query, values);
}

/**
 * Permanently deletes a user account.
 * @param {string|number} userId - The user ID.
 * @returns {Promise<void>}
 */
async function hardDeleteUserAccount(userId) {
    const query = "DELETE FROM user_account WHERE id = $1";
    const values = [userId];
    await pool.query(query, values);
}

/**
 * Blocks a user account.
 * @param {string|number} userId - The user ID.
 * @returns {Promise<void>}
 */
async function blockUserAccount(userId) {
    const query = "UPDATE user_account SET is_blocked = true, modified_at = CURRENT_TIMESTAMP WHERE id = $1";
    const values = [userId];
    await pool.query(query, values);
}

/**
 * Unblocks a user account.
 * @param {string|number} userId - The user ID.
 * @returns {Promise<void>}
 */
async function unblockUserAccount(userId) {
    const query = "UPDATE user_account SET is_blocked = false, modified_at = CURRENT_TIMESTAMP WHERE id = $1";
    const values = [userId];
    await pool.query(query, values);
}

export { getUserAccountByUsername, createUserAccount, updateUserAccountStatus, deleteUserAccount, hardDeleteUserAccount, blockUserAccount, unblockUserAccount };
