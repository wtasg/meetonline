import {
    getNotificationById,
    listNotificationsByUserProfileId,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount,
} from "../database/notification.js";
import { NotificationModel } from "../models/notificationModel.js";
import { getUserProfileByUsername } from "../database/user_profile.js";
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";
import { apiRateLimiter } from "../middlewares/rateLimitMiddleware.js";

/**
 * Sets up notification-related route handlers.
 * @param {import('express').Application} app - The Express application instance.
 * @returns {void}
 */
function setupNotificationHandler(app) {
    app.get("/notification/:id", apiRateLimiter, hybridAuthMiddleware, notificationGET);
    app.get("/notifications", apiRateLimiter, hybridAuthMiddleware, notificationsGET);
    app.get("/notifications/unread-count", apiRateLimiter, hybridAuthMiddleware, notificationsUnreadCountGET);
    app.patch("/notification/:id/read", apiRateLimiter, hybridAuthMiddleware, notificationMarkAsReadPATCH);
    app.patch("/notifications/read-all", apiRateLimiter, hybridAuthMiddleware, notificationsMarkAllAsReadPATCH);
    app.delete("/notification/:id", apiRateLimiter, hybridAuthMiddleware, notificationDELETE);
}

/**
 * GET /notification/:id - Get a notification by ID.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function notificationGET(req, res) {
    try {
        const { id } = req.params;
        const username = req.user?.username;

        if (!username) {
            return res.status(401).json({
                ok: false,
                notification: NotificationModel.null().toClient(),
                message: "Authentication required."
            });
        }

        const userProfile = await getUserProfileByUsername(username);
        if (!userProfile || userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                notification: NotificationModel.null().toClient(),
                message: "Cannot fetch user profile."
            });
        }

        const notification = await getNotificationById(id);
        if (!notification) {
            return res.status(404).json({
                ok: false,
                notification: NotificationModel.null().toClient(),
                message: "Notification not found."
            });
        }

        // Verify notification belongs to user
        if (String(notification.userProfileId) !== String(userProfile.id)) {
            return res.status(403).json({
                ok: false,
                notification: NotificationModel.null().toClient(),
                message: "Not authorized to view this notification."
            });
        }

        return res.status(200).json({
            ok: true,
            notification: notification.toClient(),
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            notification: NotificationModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * GET /notifications - Get all notifications for the current user.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function notificationsGET(req, res) {
    try {
        const { limit, offset, isRead, days } = req.query;
        const username = req.user?.username;

        if (!username) {
            return res.status(401).json({
                ok: false,
                notifications: [],
                message: "Authentication required."
            });
        }

        const userProfile = await getUserProfileByUsername(username);
        if (!userProfile || userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                notifications: [],
                message: "Cannot fetch user profile."
            });
        }

        const options = {
            limit,
            offset,
            days
        };

        // Parse isRead if provided
        if (isRead !== undefined) {
            options.isRead = isRead === "true" || isRead === true;
        }

        const notifications = await listNotificationsByUserProfileId(userProfile.id, options);

        return res.status(200).json({
            ok: true,
            notifications: notifications.map(n => n.toClient()),
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            notifications: [],
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * GET /notifications/unread-count - Get count of unread notifications.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function notificationsUnreadCountGET(req, res) {
    try {
        const username = req.user?.username;

        if (!username) {
            return res.status(401).json({
                ok: false,
                count: 0,
                message: "Authentication required."
            });
        }

        const userProfile = await getUserProfileByUsername(username);
        if (!userProfile || userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                count: 0,
                message: "Cannot fetch user profile."
            });
        }

        const count = await getUnreadNotificationCount(userProfile.id);

        return res.status(200).json({
            ok: true,
            count,
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            count: 0,
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * PATCH /notification/:id/read - Mark a notification as read.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function notificationMarkAsReadPATCH(req, res) {
    try {
        const { id } = req.params;
        const username = req.user?.username;

        if (!username) {
            return res.status(401).json({
                ok: false,
                notification: NotificationModel.null().toClient(),
                message: "Authentication required."
            });
        }

        const userProfile = await getUserProfileByUsername(username);
        if (!userProfile || userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                notification: NotificationModel.null().toClient(),
                message: "Cannot fetch user profile."
            });
        }

        const existingNotification = await getNotificationById(id);
        if (!existingNotification) {
            return res.status(404).json({
                ok: false,
                notification: NotificationModel.null().toClient(),
                message: "Notification not found."
            });
        }

        // Verify notification belongs to user
        if (String(existingNotification.userProfileId) !== String(userProfile.id)) {
            return res.status(403).json({
                ok: false,
                notification: NotificationModel.null().toClient(),
                message: "Not authorized to update this notification."
            });
        }

        const notification = await markNotificationAsRead(id);
        if (!notification) {
            return res.status(500).json({
                ok: false,
                notification: NotificationModel.null().toClient(),
                message: "Failed to mark notification as read."
            });
        }

        return res.status(200).json({
            ok: true,
            notification: notification.toClient(),
            message: "Notification marked as read."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            notification: NotificationModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * PATCH /notifications/read-all - Mark all notifications as read.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function notificationsMarkAllAsReadPATCH(req, res) {
    try {
        const username = req.user?.username;

        if (!username) {
            return res.status(401).json({
                ok: false,
                message: "Authentication required."
            });
        }

        const userProfile = await getUserProfileByUsername(username);
        if (!userProfile || userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                message: "Cannot fetch user profile."
            });
        }

        const success = await markAllNotificationsAsRead(userProfile.id);

        return res.status(200).json({
            ok: true,
            message: success ? "All notifications marked as read." : "No unread notifications."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * DELETE /notification/:id - Delete a notification.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function notificationDELETE(req, res) {
    try {
        const { id } = req.params;
        const username = req.user?.username;

        if (!username) {
            return res.status(401).json({
                ok: false,
                message: "Authentication required."
            });
        }

        const userProfile = await getUserProfileByUsername(username);
        if (!userProfile || userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                message: "Cannot fetch user profile."
            });
        }

        const existingNotification = await getNotificationById(id);
        if (!existingNotification) {
            return res.status(404).json({
                ok: false,
                message: "Notification not found."
            });
        }

        // Verify notification belongs to user
        if (String(existingNotification.userProfileId) !== String(userProfile.id)) {
            return res.status(403).json({
                ok: false,
                message: "Not authorized to delete this notification."
            });
        }

        const success = await deleteNotification(id);
        if (!success) {
            return res.status(500).json({
                ok: false,
                message: "Failed to delete notification."
            });
        }

        return res.status(200).json({
            ok: true,
            message: "Notification deleted successfully."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            message: "CAUGHT ERROR."
        });
    }
}

export { setupNotificationHandler };
