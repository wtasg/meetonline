import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    fetchNotification,
    fetchNotifications,
    fetchUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../actions/notificationActions";
import * as notificationNet from "../net/notification";

vi.mock("../net/notification");

describe("notificationActions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("fetchNotification", () => {
        it("should call net layer with notification id", async () => {
            const mockResponse = { ok: true, notification: { id: "1", message: "Test" } };
            vi.spyOn(notificationNet, "fetchNotification").mockResolvedValue(mockResponse);

            const result = await fetchNotification("1");

            expect(notificationNet.fetchNotification).toHaveBeenCalledWith("1");
            expect(result).toEqual(mockResponse);
        });
    });

    describe("fetchNotifications", () => {
        it("should call net layer with options", async () => {
            const mockResponse = { ok: true, notifications: [] };
            vi.spyOn(notificationNet, "fetchNotifications").mockResolvedValue(mockResponse);

            const options = { limit: 10, offset: 0, isRead: false };
            const result = await fetchNotifications(options);

            expect(notificationNet.fetchNotifications).toHaveBeenCalledWith(options);
            expect(result).toEqual(mockResponse);
        });

        it("should call net layer without options", async () => {
            const mockResponse = { ok: true, notifications: [] };
            vi.spyOn(notificationNet, "fetchNotifications").mockResolvedValue(mockResponse);

            const result = await fetchNotifications();

            expect(notificationNet.fetchNotifications).toHaveBeenCalledWith({});
            expect(result).toEqual(mockResponse);
        });
    });

    describe("fetchUnreadNotificationCount", () => {
        it("should call net layer and return count", async () => {
            const mockResponse = { ok: true, count: 5 };
            vi.spyOn(notificationNet, "fetchUnreadNotificationCount").mockResolvedValue(mockResponse);

            const result = await fetchUnreadNotificationCount();

            expect(notificationNet.fetchUnreadNotificationCount).toHaveBeenCalled();
            expect(result).toEqual(mockResponse);
        });
    });

    describe("markNotificationAsRead", () => {
        it("should call net layer with notification id", async () => {
            const mockResponse = { ok: true, notification: { id: "1", isRead: true } };
            vi.spyOn(notificationNet, "markNotificationAsRead").mockResolvedValue(mockResponse);

            const result = await markNotificationAsRead("1");

            expect(notificationNet.markNotificationAsRead).toHaveBeenCalledWith("1");
            expect(result).toEqual(mockResponse);
        });
    });

    describe("markAllNotificationsAsRead", () => {
        it("should call net layer", async () => {
            const mockResponse = { ok: true, message: "Success" };
            vi.spyOn(notificationNet, "markAllNotificationsAsRead").mockResolvedValue(mockResponse);

            const result = await markAllNotificationsAsRead();

            expect(notificationNet.markAllNotificationsAsRead).toHaveBeenCalled();
            expect(result).toEqual(mockResponse);
        });
    });

    describe("deleteNotification", () => {
        it("should call net layer with notification id", async () => {
            const mockResponse = { ok: true, message: "Deleted" };
            vi.spyOn(notificationNet, "deleteNotification").mockResolvedValue(mockResponse);

            const result = await deleteNotification("1");

            expect(notificationNet.deleteNotification).toHaveBeenCalledWith("1");
            expect(result).toEqual(mockResponse);
        });
    });
});
