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
import rateLimit from "express-rate-limit";

const notificationRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Setup notification handlers
 * @param {Express} app
 */
function setupNotificationHandler(app) {
    app.get("/notification/:id", notificationRateLimiter, hybridAuthMiddleware, notificationGET);
    app.get("/notifications", notificationRateLimiter, hybridAuthMiddleware, notificationsGET);
    app.get("/notifications/unread-count", notificationRateLimiter, hybridAuthMiddleware, notificationsUnreadCountGET);
    app.patch("/notification/:id/read", notificationRateLimiter, hybridAuthMiddleware, notificationMarkAsReadPATCH);
    app.patch("/notifications/read-all", notificationRateLimiter, hybridAuthMiddleware, notificationsMarkAllAsReadPATCH);
    app.delete("/notification/:id", notificationRateLimiter, hybridAuthMiddleware, notificationDELETE);
}

/**
 * Get a notification by ID
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
 * Get notifications for user
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
 * Get unread notification count
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
 * Mark notification as read
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
 * Mark all notifications as read
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
 * Delete a notification
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
