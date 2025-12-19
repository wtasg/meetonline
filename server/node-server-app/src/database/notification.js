import { pool } from "./db.js";
import { NotificationModel } from "../models/notificationModel.js";

/**
 * Get notification by ID
 * @param {string} id
 * @returns {Promise<NotificationModel|null>}
 */
async function getNotificationById(id) {
    try {
        const query = "SELECT * FROM public.user_notifications WHERE id = $1 AND is_deleted = false";
        const value = [id];
        const res = await pool.query(query, value);
        if (res.rowCount === 0) {
            return null;
        }
        return NotificationModel.fromDatabaseRow(res.rows[0]);
    } catch (err) {
        console.error("ERROR : getNotificationById");
        console.error(err);
        return null;
    }
}

/**
 * List notifications by user profile ID
 * @param {string} userProfileId
 * @param {{limit?: number, offset?: number, isRead?: boolean, days?: number}} options
 * @returns {Promise<Array<NotificationModel>>}
 */
async function listNotificationsByUserProfileId(userProfileId, options = {}) {
    try {
        const {
            limit: rawLimit = 20,
            offset: rawOffset = 0,
            isRead,
            days = 3
        } = options;

        if (!userProfileId) {
            console.warn("listNotificationsByUserProfileId called without userProfileId");
            return [];
        }

        const limit = Math.max(1, Math.min(100, Number(rawLimit) || 20));
        const offset = Math.max(0, Number(rawOffset) || 0);

        const conditions = ["user_profile_id = $1", "is_deleted = false"];
        const values = [userProfileId];
        let paramIndex = 2;

        // Filter by read status if specified
        if (typeof isRead === "boolean") {
            conditions.push(`is_read = $${paramIndex}`);
            values.push(isRead);
            paramIndex++;
        }

        // Filter by days (last N days)
        if (days && days > 0) {
            conditions.push(`created_at >= NOW() - INTERVAL '${Math.floor(days)} days'`);
        }

        const query = `
            SELECT *
            FROM public.user_notifications
            WHERE ${conditions.join(" AND ")}
            ORDER BY created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        values.push(limit, offset);

        const res = await pool.query(query, values);

        return res.rows.map(NotificationModel.fromDatabaseRow);
    } catch (err) {
        console.error("ERROR : listNotificationsByUserProfileId", { options, err });
        console.error(err);
        return [];
    }
}

/**
 * Create notification
 * @param {object} payload
 * @returns {Promise<NotificationModel|null>}
 */
async function createNotification(payload) {
    try {
        if (!payload) {
            console.error("createNotification: missing payload");
            return null;
        }

        const {
            userProfileId,
            user_profile_id,
            type,
            source,
            message
        } = payload;

        const finalUserProfileId = userProfileId ?? user_profile_id;
        if (!finalUserProfileId || !type || !message) {
            console.error("createNotification: missing required fields");
            return null;
        }

        const validTypes = [
            "comment",
            "event_create",
            "event_modify",
            "event_delete",
            "group_create",
            "group_modify",
            "group_delete",
            "message",
            "system",
            "other"
        ];

        if (!validTypes.includes(type)) {
            console.error("createNotification: invalid type");
            return null;
        }

        const values = [
            finalUserProfileId,
            type,
            source ?? "",
            message
        ];

        const query = `
            INSERT INTO public.user_notifications
              (user_profile_id, type, source, message)
            VALUES
              ($1, $2, $3, $4)
            RETURNING *;
        `;

        const res = await pool.query(query, values);
        if (!res || res.rowCount === 0) return null;
        return NotificationModel.fromDatabaseRow(res.rows[0]);

    } catch (err) {
        console.error("ERROR : createNotification");
        console.error(err);
        return null;
    }
}

/**
 * Mark notification as read
 * @param {string} id
 * @returns {Promise<NotificationModel|null>}
 */
async function markNotificationAsRead(id) {
    try {
        if (!id) return null;

        const query = `
            UPDATE public.user_notifications
            SET is_read = true, read_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_deleted = false
            RETURNING *
        `;

        const res = await pool.query(query, [id]);

        if (!res || res.rowCount === 0) return null;
        return NotificationModel.fromDatabaseRow(res.rows[0]);

    } catch (err) {
        console.error("ERROR : markNotificationAsRead");
        console.error(err);
        return null;
    }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userProfileId
 * @returns {Promise<boolean>}
 */
async function markAllNotificationsAsRead(userProfileId) {
    try {
        if (!userProfileId) return false;

        const query = `
            UPDATE public.user_notifications
            SET is_read = true, read_at = CURRENT_TIMESTAMP
            WHERE user_profile_id = $1 AND is_read = false AND is_deleted = false
        `;

        const res = await pool.query(query, [userProfileId]);
        return res.rowCount > 0;

    } catch (err) {
        console.error("ERROR : markAllNotificationsAsRead");
        console.error(err);
        return false;
    }
}

/**
 * Delete notification (soft delete)
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function deleteNotification(id) {
    try {
        const query = `
            UPDATE public.user_notifications 
            SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING id
        `;
        const values = [id];
        const res = await pool.query(query, values);
        return res.rowCount > 0;
    } catch (err) {
        console.error("ERROR: deleteNotification");
        console.error(err);
        return false;
    }
}

/**
 * Get unread notification count for user
 * @param {string} userProfileId
 * @returns {Promise<number>}
 */
async function getUnreadNotificationCount(userProfileId) {
    try {
        if (!userProfileId) return 0;

        const query = `
            SELECT COUNT(*) as count
            FROM public.user_notifications
            WHERE user_profile_id = $1 AND is_read = false AND is_deleted = false
        `;

        const res = await pool.query(query, [userProfileId]);
        return parseInt(res.rows[0]?.count || 0, 10);

    } catch (err) {
        console.error("ERROR : getUnreadNotificationCount");
        console.error(err);
        return 0;
    }
}

export {
    getNotificationById,
    listNotificationsByUserProfileId,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount,
};
