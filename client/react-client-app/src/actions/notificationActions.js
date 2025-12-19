import {
    fetchNotification as netFetchNotification,
    fetchNotifications as netFetchNotifications,
    fetchUnreadNotificationCount as netFetchUnreadNotificationCount,
    markNotificationAsRead as netMarkNotificationAsRead,
    markAllNotificationsAsRead as netMarkAllNotificationsAsRead,
    deleteNotification as netDeleteNotification,
} from "../net/notification.js";

async function fetchNotification(notificationId) {
    return netFetchNotification(notificationId);
}

async function fetchNotifications(options = {}) {
    return netFetchNotifications(options);
}

async function fetchUnreadNotificationCount() {
    return netFetchUnreadNotificationCount();
}

async function markNotificationAsRead(notificationId) {
    return netMarkNotificationAsRead(notificationId);
}

async function markAllNotificationsAsRead() {
    return netMarkAllNotificationsAsRead();
}

async function deleteNotification(notificationId) {
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
