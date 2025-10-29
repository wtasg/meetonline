import { UserAccountModel } from "../models/userModel.js";
import { pool } from "./db.js";

/**
 *
 * @param username {string}  The username received from client
 * @returns UserAccount information
 */
async function getUserAccountByUsername(username) {
    try {
        const query = 'SELECT * FROM user_account WHERE username = $1';
        const values = [username];
        const res = await pool.query(query, values);
        return UserAccountModel.fromDatabaseRow(res.rows[0]);
    }
    catch (error) {
        console.error("Error fetching user account by username:", error);
        return UserAccountModel.default();
    }
}

async function createUserAccount(username, password, salt) {
    const query = `
        INSERT INTO user_account (username, password, salt, is_active, is_deleted, is_blocked, is_forgotten)
        VALUES ($1, $2, $3, true, false, false, false)
        RETURNING *`;
    const values = [username, password, salt];
    const res = await pool.query(query, values);
    return UserAccountModel.fromDatabaseRow(res.rows[0]);
}

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
        SET ${fields.join(', ')}, modified_at = NOW()
        WHERE id = $${index}
        RETURNING *`;

    const res = await pool.query(query, values);
    return UserAccountModel.fromDatabaseRow(res.rows[0]);
}

async function deleteUserAccount(userId) {
    const query = 'UPDATE user_account SET is_deleted = true, modified_at = NOW() WHERE id = $1';
    const values = [userId];
    await pool.query(query, values);
}

async function blockUserAccount(userId) {
    const query = 'UPDATE user_account SET is_blocked = true, modified_at = NOW() WHERE id = $1';
    const values = [userId];
    await pool.query(query, values);
}

async function unblockUserAccount(userId) {
    const query = 'UPDATE user_account SET is_blocked = false, modified_at = NOW() WHERE id = $1';
    const values = [userId];
    await pool.query(query, values);
}


export { getUserAccountByUsername, createUserAccount, updateUserAccountStatus, deleteUserAccount, blockUserAccount, unblockUserAccount };

