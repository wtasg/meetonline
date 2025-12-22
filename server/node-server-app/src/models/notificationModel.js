import { pojo } from "@wtasnorg/node-lib";
import { toISOStringOrEmpty } from "../utils/dateUtils.js";

/**
 * Updates a notification object with new values.
 * @param {Object} notification - The existing notification object.
 * @param {Object} updates - The updates to apply.
 * @returns {Object} The updated notification object.
 * @throws {Error} If notification is invalid.
 */
const updateNotification = (notification, updates) => {
    if (!notification || typeof notification !== "object" || Array.isArray(notification)) {
        throw new Error("Invalid notification object passed to updateNotification.");
    }
    return {
        ...notification,
        ...updates,
    };
};

const notificationKeyMap = {
    id: "id",
    userProfileId: "user_profile_id",
    user_profile_id: "userProfileId",
    type: "type",
    source: "source",
    message: "message",
    createdAt: "created_at",
    created_at: "createdAt",
    isRead: "is_read",
    is_read: "isRead",
    readAt: "read_at",
    read_at: "readAt",
    isDeleted: "is_deleted",
    is_deleted: "isDeleted",
    deletedAt: "deleted_at",
    deleted_at: "deletedAt",
};

/**
 * Model representing a notification.
 */
class NotificationModel {
    constructor() {
        this.id = null;
        this.userProfileId = null;
        this.type = null;
        this.source = null;
        this.message = null;
        this.createdAt = null;
        this.isRead = false;
        this.readAt = null;
        this.isDeleted = false;
        this.deletedAt = null;
        this.__isNull = true;
        this.__isDefault = false;
    }

    /**
     * Creates a NotificationModel from a database row.
     * @param {Object} row - Database row object.
     * @returns {NotificationModel} The model instance.
     * @throws {Error} If row is invalid.
     */
    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row.");
        }
        const instance = new NotificationModel();

        instance.id = row.id ?? 0;
        instance.userProfileId = row.user_profile_id ?? 0;
        instance.type = row.type ?? "other";
        instance.source = row.source ?? "";
        instance.message = row.message ?? "";
        instance.createdAt = toISOStringOrEmpty(row.created_at);
        instance.isRead = Boolean(row.is_read);
        instance.readAt = toISOStringOrEmpty(row.read_at);
        instance.isDeleted = Boolean(row.is_deleted);
        instance.deletedAt = toISOStringOrEmpty(row.deleted_at);
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    /**
     * Creates a null (empty) NotificationModel.
     * @returns {NotificationModel} A null model instance.
     */
    static null() {
        return new NotificationModel();
    }

    /**
     * Creates a default NotificationModel with sample data.
     * @returns {NotificationModel} A default model instance.
     */
    static default() {
        const instance = new NotificationModel();
        instance.id = 0;
        instance.userProfileId = 0;
        instance.type = "other";
        instance.source = "";
        instance.message = "";
        instance.createdAt = new Date().toISOString();
        instance.isRead = false;
        instance.readAt = "";
        instance.isDeleted = false;
        instance.deletedAt = "";
        instance.__isNull = false;
        instance.__isDefault = true;
        return instance;
    }

    /**
     * Converts the model to a client-safe plain object.
     * @returns {Object} Plain object without internal properties.
     */
    toClient() {
        const obj = pojo(this);
        delete obj.__isDefault;
        delete obj.__isNull;
        return obj;
    }
}

export { updateNotification, NotificationModel, notificationKeyMap };
