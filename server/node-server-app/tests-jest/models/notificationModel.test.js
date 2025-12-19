import { NotificationModel, updateNotification, notificationKeyMap } from "../../src/models/notificationModel.js";
import { describe, it, expect } from "@jest/globals";

describe("NotificationModel", () => {
    describe("constructor", () => {
        it("creates a null instance by default", () => {
            const model = new NotificationModel();
            expect(model.__isNull).toBe(true);
            expect(model.__isDefault).toBe(false);
            expect(model.id).toBeNull();
            expect(model.userProfileId).toBeNull();
            expect(model.type).toBeNull();
            expect(model.message).toBeNull();
        });
    });

    describe("fromDatabaseRow", () => {
        it("creates an instance from a valid database row", () => {
            const row = {
                id: "1",
                user_profile_id: "100",
                type: "event_create",
                source: "event_123",
                message: "New event created",
                created_at: new Date("2024-01-01"),
                is_read: false,
                read_at: null,
                is_deleted: false,
                deleted_at: null,
            };

            const model = NotificationModel.fromDatabaseRow(row);

            expect(model.__isNull).toBe(false);
            expect(model.__isDefault).toBe(false);
            expect(model.id).toBe("1");
            expect(model.userProfileId).toBe("100");
            expect(model.type).toBe("event_create");
            expect(model.source).toBe("event_123");
            expect(model.message).toBe("New event created");
            expect(model.isRead).toBe(false);
            expect(model.readAt).toBe("");
            expect(model.isDeleted).toBe(false);
            expect(model.deletedAt).toBe("");
        });

        it("throws an error when row is null", () => {
            expect(() => NotificationModel.fromDatabaseRow(null)).toThrow("Invalid database row.");
        });

        it("throws an error when row is undefined", () => {
            expect(() => NotificationModel.fromDatabaseRow(undefined)).toThrow("Invalid database row.");
        });

        it("handles null values in row with defaults", () => {
            const row = {
                id: null,
                user_profile_id: null,
                type: null,
                source: null,
                message: null,
                created_at: null,
                is_read: null,
                read_at: null,
                is_deleted: null,
                deleted_at: null,
            };

            const model = NotificationModel.fromDatabaseRow(row);

            expect(model.id).toBe(0);
            expect(model.userProfileId).toBe(0);
            expect(model.type).toBe("other");
            expect(model.source).toBe("");
            expect(model.message).toBe("");
            expect(model.isRead).toBe(false);
            expect(model.isDeleted).toBe(false);
        });
    });

    describe("null", () => {
        it("creates a null instance", () => {
            const model = NotificationModel.null();
            expect(model.__isNull).toBe(true);
            expect(model.__isDefault).toBe(false);
        });
    });

    describe("default", () => {
        it("creates a default instance", () => {
            const model = NotificationModel.default();
            expect(model.__isNull).toBe(false);
            expect(model.__isDefault).toBe(true);
            expect(model.id).toBe(0);
            expect(model.userProfileId).toBe(0);
            expect(model.type).toBe("other");
            expect(model.source).toBe("");
            expect(model.message).toBe("");
            expect(model.isRead).toBe(false);
            expect(model.readAt).toBe("");
            expect(model.isDeleted).toBe(false);
            expect(model.deletedAt).toBe("");
        });
    });

    describe("toClient", () => {
        it("converts model to client-safe object", () => {
            const model = NotificationModel.default();
            const clientObj = model.toClient();

            expect(clientObj.__isNull).toBeUndefined();
            expect(clientObj.__isDefault).toBeUndefined();
            expect(clientObj.id).toBe(0);
            expect(clientObj.type).toBe("other");
            expect(clientObj.message).toBe("");
        });
    });
});

describe("updateNotification", () => {
    it("updates notification with new values", () => {
        const notification = {
            id: "1",
            type: "event_create",
            message: "Old message",
            isRead: false,
        };

        const updates = {
            message: "New message",
            isRead: true,
        };

        const updated = updateNotification(notification, updates);

        expect(updated.message).toBe("New message");
        expect(updated.isRead).toBe(true);
        expect(updated.id).toBe("1");
    });

    it("throws error for invalid notification object", () => {
        expect(() => updateNotification(null, {})).toThrow("Invalid notification object passed to updateNotification.");
        expect(() => updateNotification([], {})).toThrow("Invalid notification object passed to updateNotification.");
        expect(() => updateNotification(undefined, {})).toThrow("Invalid notification object passed to updateNotification.");
    });
});

describe("notificationKeyMap", () => {
    it("maps camelCase to snake_case", () => {
        expect(notificationKeyMap.userProfileId).toBe("user_profile_id");
        expect(notificationKeyMap.createdAt).toBe("created_at");
        expect(notificationKeyMap.isRead).toBe("is_read");
        expect(notificationKeyMap.readAt).toBe("read_at");
        expect(notificationKeyMap.isDeleted).toBe("is_deleted");
        expect(notificationKeyMap.deletedAt).toBe("deleted_at");
    });

    it("maps snake_case to camelCase", () => {
        expect(notificationKeyMap.user_profile_id).toBe("userProfileId");
        expect(notificationKeyMap.created_at).toBe("createdAt");
        expect(notificationKeyMap.is_read).toBe("isRead");
        expect(notificationKeyMap.read_at).toBe("readAt");
        expect(notificationKeyMap.is_deleted).toBe("isDeleted");
        expect(notificationKeyMap.deleted_at).toBe("deletedAt");
    });

    it("maps identical keys to themselves", () => {
        expect(notificationKeyMap.id).toBe("id");
        expect(notificationKeyMap.type).toBe("type");
        expect(notificationKeyMap.source).toBe("source");
        expect(notificationKeyMap.message).toBe("message");
    });
});
