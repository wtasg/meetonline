import {
    fetchNotification as netFetchNotification,
    fetchNotifications as netFetchNotifications,
    fetchUnreadNotificationCount as netFetchUnreadNotificationCount,
    markNotificationAsRead as netMarkNotificationAsRead,
    markAllNotificationsAsRead as netMarkAllNotificationsAsRead,
    deleteNotification as netDeleteNotification,
} from "../net/notification.js";

interface NotificationActionResponse {
    ok: boolean;
    message?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * Fetches a single notification by its unique identifier.
 * @param {string} notificationId - The unique identifier of the notification to fetch.
 * @returns {Promise<NotificationActionResponse>} A promise that resolves to a NotificationActionResponse containing the notification data or error message.
 */
async function fetchNotification(notificationId: string): Promise<NotificationActionResponse> {
    return netFetchNotification(notificationId);
}

/**
 * Fetches notifications for the current user with optional filtering and pagination.
 * @param {Object} [options] - Optional configuration for the fetch operation.
 * @param {number} [options.limit] - Maximum number of notifications to return.
 * @param {number} [options.offset] - Number of notifications to skip for pagination.
 * @param {boolean} [options.isRead] - Filter by read status (true/false).
 * @param {number} [options.days] - Filter notifications from the last N days.
 * @returns {Promise<NotificationActionResponse>} A promise that resolves to a NotificationActionResponse containing the notifications list or error message.
 */
async function fetchNotifications(options: { limit?: number; offset?: number; isRead?: boolean; days?: number } = {}): Promise<NotificationActionResponse> {
    return netFetchNotifications(options);
}

/**
 * Fetches the count of unread notifications for the current user.
 * @returns {Promise<NotificationActionResponse>} A promise that resolves to a NotificationActionResponse containing the unread count or error message.
 */
async function fetchUnreadNotificationCount(): Promise<NotificationActionResponse> {
    return netFetchUnreadNotificationCount();
}

/**
 * Marks a specific notification as read.
 * @param {string} notificationId - The unique identifier of the notification to mark as read.
 * @returns {Promise<NotificationActionResponse>} A promise that resolves to a NotificationActionResponse indicating success or failure.
 */
async function markNotificationAsRead(notificationId: string): Promise<NotificationActionResponse> {
    return netMarkNotificationAsRead(notificationId);
}

/**
 * Marks all notifications for the current user as read.
 * @returns {Promise<NotificationActionResponse>} A promise that resolves to a NotificationActionResponse indicating success or failure.
 */
async function markAllNotificationsAsRead(): Promise<NotificationActionResponse> {
    return netMarkAllNotificationsAsRead();
}

/**
 * Deletes a notification by its unique identifier.
 * @param {string} notificationId - The unique identifier of the notification to delete.
 * @returns {Promise<NotificationActionResponse>} A promise that resolves to a NotificationActionResponse indicating success or failure.
 */
async function deleteNotification(notificationId: string): Promise<NotificationActionResponse> {
    return netDeleteNotification(notificationId);
}

export {
    fetchNotification,
    fetchNotifications,
    fetchUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};
