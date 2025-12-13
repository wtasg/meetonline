import { pool } from "./db.js";
import { JwtTokenModel } from "../models/jwtTokenModel.js";

/**
 * Create a new JWT token pair for a user
 * @param {string} userId - User ID
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 * @param {Date} accessTokenExpiresAt - Access token expiration time
 * @param {Date} refreshTokenExpiresAt - Refresh token expiration time
 * @returns {Promise<JwtTokenModel>}
 */
async function createJwtTokenPair(userId, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt) {
    try {
        const query = `
            INSERT INTO jwt_tokens (user_id, access_token, refresh_token, access_token_expires_at, refresh_token_expires_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [userId, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt];
        const res = await pool.query(query, values);
        
        if (res.rows.length === 0) {
            return JwtTokenModel.null();
        }
        
        return JwtTokenModel.fromDatabaseRow(res.rows[0]);
    } catch (error) {
        console.error("Error creating JWT token pair:", error);
        throw error;
    }
}

/**
 * Get JWT token by access token
 * @param {string} accessToken - JWT access token
 * @returns {Promise<JwtTokenModel>}
 */
async function getJwtTokenByAccessToken(accessToken) {
    try {
        const query = "SELECT * FROM jwt_tokens WHERE access_token = $1 AND is_revoked = false";
        const values = [accessToken];
        const res = await pool.query(query, values);
        
        if (res.rows.length === 0) {
            return JwtTokenModel.null();
        }
        
        return JwtTokenModel.fromDatabaseRow(res.rows[0]);
    } catch (error) {
        console.error("Error fetching JWT token by access token:", error);
        return JwtTokenModel.null();
    }
}

/**
 * Get JWT token by refresh token
 * @param {string} refreshToken - JWT refresh token
 * @returns {Promise<JwtTokenModel>}
 */
async function getJwtTokenByRefreshToken(refreshToken) {
    try {
        const query = "SELECT * FROM jwt_tokens WHERE refresh_token = $1 AND is_revoked = false";
        const values = [refreshToken];
        const res = await pool.query(query, values);
        
        if (res.rows.length === 0) {
            return JwtTokenModel.null();
        }
        
        return JwtTokenModel.fromDatabaseRow(res.rows[0]);
    } catch (error) {
        console.error("Error fetching JWT token by refresh token:", error);
        return JwtTokenModel.null();
    }
}

/**
 * Revoke JWT token pair
 * @param {string} tokenId - JWT token ID
 * @returns {Promise<boolean>}
 */
async function revokeJwtToken(tokenId) {
    try {
        const query = `
            UPDATE jwt_tokens 
            SET is_revoked = true, modified_at = CURRENT_TIMESTAMP 
            WHERE id = $1
        `;
        const values = [tokenId];
        await pool.query(query, values);
        return true;
    } catch (error) {
        console.error("Error revoking JWT token:", error);
        return false;
    }
}

/**
 * Revoke all JWT tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
async function revokeAllJwtTokensForUser(userId) {
    try {
        const query = `
            UPDATE jwt_tokens 
            SET is_revoked = true, modified_at = CURRENT_TIMESTAMP 
            WHERE user_id = $1 AND is_revoked = false
        `;
        const values = [userId];
        await pool.query(query, values);
        return true;
    } catch (error) {
        console.error("Error revoking all JWT tokens for user:", error);
        return false;
    }
}

/**
 * Delete expired JWT tokens (cleanup)
 * @returns {Promise<number>} Number of deleted tokens
 */
async function deleteExpiredJwtTokens() {
    try {
        const query = `
            DELETE FROM jwt_tokens 
            WHERE refresh_token_expires_at < CURRENT_TIMESTAMP
        `;
        const res = await pool.query(query);
        return res.rowCount || 0;
    } catch (error) {
        console.error("Error deleting expired JWT tokens:", error);
        return 0;
    }
}

export {
    createJwtTokenPair,
    getJwtTokenByAccessToken,
    getJwtTokenByRefreshToken,
    revokeJwtToken,
    revokeAllJwtTokensForUser,
    deleteExpiredJwtTokens
};
