import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

/**
 * Fetch a notification by ID
 * @param {string} notificationId
 * @returns {Promise<{ok: boolean, message: string, notification: object}>}
 */
async function fetchNotification(notificationId) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/notification/${notificationId}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, notification: false };
    }
}

/**
 * Fetch notifications for the current user
 * @param {{limit?: number, offset?: number, isRead?: boolean, days?: number}} options
 * @returns {Promise<{ok: boolean, message: string, notifications: array}>}
 */
async function fetchNotifications(options = {}) {
    try {
        const params = new URLSearchParams();
        if (options.limit) params.append("limit", options.limit);
        if (options.offset) params.append("offset", options.offset);
        if (typeof options.isRead === "boolean") params.append("isRead", options.isRead);
        if (options.days) params.append("days", options.days);

        const queryString = params.toString();
        const url = `${CONF.HTTPS_SERVER}/notifications${queryString ? `?${queryString}` : ""}`;

        const response = await authenticatedFetch(url, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, notifications: [] };
    }
}

/**
 * Fetch unread notification count
 * @returns {Promise<{ok: boolean, message: string, count: number}>}
 */
async function fetchUnreadNotificationCount() {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/notifications/unread-count`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, count: 0 };
    }
}

/**
 * Mark notification as read
 * @param {string} notificationId
 * @returns {Promise<{ok: boolean, message: string, notification: object}>}
 */
async function markNotificationAsRead(notificationId) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/notification/${notificationId}/read`, {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, notification: false };
    }
}

/**
 * Mark all notifications as read
 * @returns {Promise<{ok: boolean, message: string}>}
 */
async function markAllNotificationsAsRead() {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/notifications/read-all`, {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message };
    }
}

/**
 * Delete a notification
 * @param {string} notificationId
 * @returns {Promise<{ok: boolean, message: string}>}
 */
async function deleteNotification(notificationId) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/notification/${notificationId}`, {
            credentials: "include",
            method: "DELETE",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message };
    }
}

export {
    fetchNotification,
    fetchNotifications,
    fetchUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};
