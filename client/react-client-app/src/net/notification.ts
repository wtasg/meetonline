import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

interface NotificationResponse {
    ok: boolean;
    message?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notification?: any | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notifications?: any[];
    count?: number;
}

/**
 * Fetches a single notification by its unique identifier.
 * @param {string} notificationId - The unique identifier of the notification to fetch.
 * @returns {Promise<NotificationResponse>} A promise resolving to a NotificationResponse containing the notification data or error.
 */
async function fetchNotification(notificationId: string): Promise<NotificationResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/notification/${notificationId}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, notification: null };
    }
}

/**
 * Fetches notifications for the current user with optional filtering and pagination.
 * @param {Object} [options] - Optional configuration for the fetch operation.
 * @param {number} [options.limit] - Maximum number of notifications to return.
 * @param {number} [options.offset] - Number of notifications to skip for pagination.
 * @param {boolean} [options.isRead] - Filter by read status (true/false).
 * @param {number} [options.days] - Filter notifications from the last N days.
 * @returns {Promise<NotificationResponse>} A promise resolving to a NotificationResponse containing the notifications list or error.
 */
async function fetchNotifications(options: { limit?: number; offset?: number; isRead?: boolean; days?: number } = {}): Promise<NotificationResponse> {
    try {
        const params = new URLSearchParams();
        if (options.limit) params.append("limit", String(options.limit));
        if (options.offset) params.append("offset", String(options.offset));
        if (typeof options.isRead === "boolean") params.append("isRead", String(options.isRead));
        if (options.days) params.append("days", String(options.days));

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
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, notifications: [] };
    }
}

/**
 * Fetches the count of unread notifications for the current user.
 * @returns {Promise<NotificationResponse>} A promise resolving to a NotificationResponse containing the unread count or error.
 */
async function fetchUnreadNotificationCount(): Promise<NotificationResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/notifications/unread-count`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, count: 0 };
    }
}

/**
 * Marks a specific notification as read.
 * @param {string} notificationId - The unique identifier of the notification to mark as read.
 * @returns {Promise<NotificationResponse>} A promise resolving to a NotificationResponse indicating success or failure.
 */
async function markNotificationAsRead(notificationId: string): Promise<NotificationResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/notification/${notificationId}/read`, {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, notification: null };
    }
}

/**
 * Marks all notifications for the current user as read.
 * @returns {Promise<NotificationResponse>} A promise resolving to a NotificationResponse indicating success or failure.
 */
async function markAllNotificationsAsRead(): Promise<NotificationResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/notifications/read-all`, {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

/**
 * Deletes a notification by its unique identifier.
 * @param {string} notificationId - The unique identifier of the notification to delete.
 * @returns {Promise<NotificationResponse>} A promise resolving to a NotificationResponse indicating success or failure.
 */
async function deleteNotification(notificationId: string): Promise<NotificationResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/notification/${notificationId}`, {
            credentials: "include",
            method: "DELETE",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
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
