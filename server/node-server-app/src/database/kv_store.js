import { KVStoreModel } from "../models/kvstoreModel.js";
import { pool } from "./db.js";

/**
 * Insert or update (in case of conflict) the key-value pairs
 * @param {string} key
 * @param {string} value
 */
async function createOrUpdateKVPair(key, value) {
    try {
        const query = `
            INSERT INTO kv_store (key, value)
            VALUES ($1, $2)
        `;
        const values = [String(key), value];
        await pool.query(query, values);
    } catch (error) {
        console.error("Error storing key value to kv_store", error);
    }
}

/**
 * Returns the value for the key from the database
 * @param {string} key
 * @returns {string} the value
 */
async function getKVPair(key) {
    try {
        const query = "SELECT * FROM kv_store WHERE key = $1";
        const values = [String(key)];
        const res = await pool.query(query, values);
        return KVStoreModel.fromDatabaseRow(res.rows[0]);
    } catch (error) {
        console.error("Error fetching key value from kv_store", error);
        return KVStoreModel.null();
    }
}

/**
 * Deletes a key-value pair from the database.
 * @param {string} key
 */
async function deleteKVPair(key) {
    try {
        const query = `
            DELETE FROM kv_store
            WHERE key = $1
        `;
        const values = [String(key)];
        await pool.query(query, values);
    } catch (error) {
        console.error("Error while deleting key in kv_store", error);
    }
}

export { createOrUpdateKVPair, getKVPair, deleteKVPair };
