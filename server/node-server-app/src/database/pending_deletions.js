import { pool } from "./db.js";

/**
 * Create a pending deletion record
 * @param {object} payload
 * @param {string} payload.entityType - Type of entity (event, group, user_account, user_profile)
 * @param {string} payload.entityId - ID of the entity
 * @param {string} payload.userProfileId - User profile ID who initiated the deletion
 * @param {number} payload.daysUntilDeletion - Days until hard deletion (default 90)
 * @returns {Promise<object|null>}
 */
async function createPendingDeletion({ entityType, entityId, userProfileId, daysUntilDeletion = 90 }) {
    try {
        if (!entityType || !entityId || !userProfileId) {
            console.error("createPendingDeletion: missing required fields");
            return null;
        }

        const validEntityTypes = ["event", "group", "user_account", "user_profile"];
        if (!validEntityTypes.includes(entityType)) {
            console.error("createPendingDeletion: invalid entity type");
            return null;
        }

        // Calculate scheduled deletion date
        const scheduledDeletionAt = new Date();
        scheduledDeletionAt.setDate(scheduledDeletionAt.getDate() + daysUntilDeletion);

        const query = `
            INSERT INTO public.pending_deletions
              (entity_type, entity_id, user_profile_id, scheduled_deletion_at)
            VALUES
              ($1, $2, $3, $4)
            RETURNING *;
        `;

        const values = [entityType, entityId, userProfileId, scheduledDeletionAt.toISOString()];
        const res = await pool.query(query, values);

        if (!res || res.rowCount === 0) return null;
        return res.rows[0];
    } catch (err) {
        console.error("ERROR: createPendingDeletion");
        console.error(err);
        return null;
    }
}

/**
 * Get pending deletions that are due for processing
 * @returns {Promise<Array<object>>}
 */
async function getDuePendingDeletions() {
    try {
        const query = `
            SELECT *
            FROM public.pending_deletions
            WHERE is_processed = false
              AND scheduled_deletion_at <= CURRENT_TIMESTAMP
            ORDER BY scheduled_deletion_at ASC
        `;

        const res = await pool.query(query);
        return res.rows || [];
    } catch (err) {
        console.error("ERROR: getDuePendingDeletions");
        console.error(err);
        return [];
    }
}

/**
 * Mark a pending deletion as processed
 * @param {string} id - Pending deletion ID
 * @returns {Promise<boolean>}
 */
async function markPendingDeletionAsProcessed(id) {
    try {
        const query = `
            UPDATE public.pending_deletions
            SET is_processed = true, processed_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id
        `;

        const res = await pool.query(query, [id]);
        return res.rowCount > 0;
    } catch (err) {
        console.error("ERROR: markPendingDeletionAsProcessed");
        console.error(err);
        return false;
    }
}

/**
 * Cancel a pending deletion (used when user restores/undeletes)
 * @param {string} entityType - Type of entity
 * @param {string} entityId - ID of the entity
 * @returns {Promise<boolean>}
 */
async function cancelPendingDeletion(entityType, entityId) {
    try {
        const query = `
            DELETE FROM public.pending_deletions
            WHERE entity_type = $1
              AND entity_id = $2
              AND is_processed = false
        `;

        const res = await pool.query(query, [entityType, entityId]);
        return res.rowCount > 0;
    } catch (err) {
        console.error("ERROR: cancelPendingDeletion");
        console.error(err);
        return false;
    }
}

/**
 * Get pending deletions by user profile ID
 * @param {string} userProfileId - User profile ID
 * @returns {Promise<Array<object>>}
 */
async function getPendingDeletionsByUserProfileId(userProfileId) {
    try {
        const query = `
            SELECT *
            FROM public.pending_deletions
            WHERE user_profile_id = $1
              AND is_processed = false
            ORDER BY scheduled_deletion_at ASC
        `;

        const res = await pool.query(query, [userProfileId]);
        return res.rows || [];
    } catch (err) {
        console.error("ERROR: getPendingDeletionsByUserProfileId");
        console.error(err);
        return [];
    }
}

export {
    createPendingDeletion,
    getDuePendingDeletions,
    markPendingDeletionAsProcessed,
    cancelPendingDeletion,
    getPendingDeletionsByUserProfileId,
};
