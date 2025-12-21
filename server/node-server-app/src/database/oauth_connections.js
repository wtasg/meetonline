import { pool } from "./db.js";
import { OAuthConnectionModel } from "../models/oauthConnectionModel.js";

async function createOAuthConnection(userId, provider, providerId, email, profileData) {
    const query = `
        INSERT INTO user_oauth_connections (user_id, provider, provider_id, email, profile_data)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (provider, provider_id) DO UPDATE 
        SET user_id = EXCLUDED.user_id, 
            email = EXCLUDED.email, 
            profile_data = EXCLUDED.profile_data,
            modified_at = CURRENT_TIMESTAMP
        RETURNING *`;
    const values = [userId, provider, providerId, email, profileData ? JSON.stringify(profileData) : null];
    const res = await pool.query(query, values);
    return OAuthConnectionModel.fromDatabaseRow(res.rows[0]);
}

async function getOAuthConnectionsByUserId(userId) {
    const query = "SELECT * FROM user_oauth_connections WHERE user_id = $1";
    const values = [userId];
    const res = await pool.query(query, values);
    return res.rows.map(row => OAuthConnectionModel.fromDatabaseRow(row));
}

async function getOAuthConnectionByProvider(provider, providerId) {
    const query = "SELECT * FROM user_oauth_connections WHERE provider = $1 AND provider_id = $2";
    const values = [provider, providerId];
    const res = await pool.query(query, values);
    return OAuthConnectionModel.fromDatabaseRow(res.rows[0]);
}

async function deleteOAuthConnection(userId, provider) {
    const query = "DELETE FROM user_oauth_connections WHERE user_id = $1 AND provider = $2";
    const values = [userId, provider];
    await pool.query(query, values);
}

export {
    createOAuthConnection,
    getOAuthConnectionsByUserId,
    getOAuthConnectionByProvider,
    deleteOAuthConnection
};
