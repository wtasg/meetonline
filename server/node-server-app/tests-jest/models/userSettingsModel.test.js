import { describe, it, expect } from "@jest/globals";
import {
    UserSettingsModel,
    userSettingsKeyMap,
    VALID_THEMES,
    VALID_FONT_SIZES,
    VALID_FONT_CONTRASTS
} from "../../src/models/userSettingsModel.js";

describe("UserSettingsModel", () => {
    describe("constructor", () => {
        it("should create instance with default values", () => {
            const instance = new UserSettingsModel();
            expect(instance.id).toBeNull();
            expect(instance.userProfileId).toBeNull();
            expect(instance.theme).toBe("system");
            expect(instance.fontSize).toBe("medium");
            expect(instance.fontFamily).toBe("system-ui");
            expect(instance.fontContrast).toBe("normal");
            expect(instance.notifications).toBe(true);
            expect(instance.onlinePresence).toBe(true);
            expect(instance.sounds).toBe(true);
            expect(instance.__isNull).toBe(true);
            expect(instance.__isDefault).toBe(false);
        });
    });

    describe("null()", () => {
        it("should return a null instance", () => {
            const instance = UserSettingsModel.null();
            expect(instance.__isNull).toBe(true);
            expect(instance.__isDefault).toBe(false);
        });
    });

    describe("default()", () => {
        it("should return a default instance", () => {
            const instance = UserSettingsModel.default();
            expect(instance.__isNull).toBe(false);
            expect(instance.__isDefault).toBe(true);
            expect(instance.id).toBe(0);
            expect(instance.userProfileId).toBe(0);
            expect(instance.theme).toBe("system");
            expect(instance.fontSize).toBe("medium");
        });
    });

    describe("fromDatabaseRow()", () => {
        it("should create instance from database row", () => {
            const row = {
                id: 1,
                user_profile_id: 123,
                theme: "dark",
                font_size: "large",
                font_family: "Arial",
                font_contrast: "high",
                notifications: false,
                online_presence: true,
                sounds: false,
                created_at: "2024-01-01T00:00:00Z",
                modified_at: "2024-01-02T00:00:00Z"
            };
            const instance = UserSettingsModel.fromDatabaseRow(row);
            expect(instance.id).toBe(1);
            expect(instance.userProfileId).toBe(123);
            expect(instance.theme).toBe("dark");
            expect(instance.fontSize).toBe("large");
            expect(instance.fontFamily).toBe("Arial");
            expect(instance.fontContrast).toBe("high");
            expect(instance.notifications).toBe(false);
            expect(instance.onlinePresence).toBe(true);
            expect(instance.sounds).toBe(false);
            expect(instance.__isNull).toBe(false);
            expect(instance.__isDefault).toBe(false);
        });

        it("should throw error for invalid row", () => {
            expect(() => UserSettingsModel.fromDatabaseRow(null)).toThrow("Invalid database row.");
            expect(() => UserSettingsModel.fromDatabaseRow(undefined)).toThrow("Invalid database row.");
        });
    });

    describe("toClient()", () => {
        it("should return client-friendly object without internal fields", () => {
            const row = {
                id: 1,
                user_profile_id: 123,
                theme: "dark",
                font_size: "large",
                font_family: "Arial",
                font_contrast: "high",
                notifications: false,
                online_presence: true,
                sounds: false,
                created_at: "2024-01-01T00:00:00Z",
                modified_at: "2024-01-02T00:00:00Z"
            };
            const instance = UserSettingsModel.fromDatabaseRow(row);
            const clientObj = instance.toClient();
            expect(clientObj.__isNull).toBeUndefined();
            expect(clientObj.__isDefault).toBeUndefined();
            expect(clientObj.userProfileId).toBeUndefined();
            expect(clientObj.theme).toBe("dark");
            expect(clientObj.fontSize).toBe("large");
        });
    });
});

describe("userSettingsKeyMap", () => {
    it("should contain valid key mappings", () => {
        expect(userSettingsKeyMap["theme"]).toBe("theme");
        expect(userSettingsKeyMap["fontSize"]).toBe("font_size");
        expect(userSettingsKeyMap["font_size"]).toBe("fontSize");
        expect(userSettingsKeyMap["notifications"]).toBe("notifications");
        expect(userSettingsKeyMap["onlinePresence"]).toBe("online_presence");
        expect(userSettingsKeyMap["online_presence"]).toBe("onlinePresence");
    });
});

describe("VALID_THEMES", () => {
    it("should contain all expected themes", () => {
        expect(VALID_THEMES).toContain("system");
        expect(VALID_THEMES).toContain("light");
        expect(VALID_THEMES).toContain("dark");
        expect(VALID_THEMES).toContain("high-contrast-light");
        expect(VALID_THEMES).toContain("high-contrast-dark");
        expect(VALID_THEMES).toContain("teal");
        expect(VALID_THEMES).toContain("pink");
        expect(VALID_THEMES).toContain("red");
        expect(VALID_THEMES).toContain("sepia");
        expect(VALID_THEMES).toContain("gray");
        expect(VALID_THEMES.length).toBe(10);
    });
});

describe("VALID_FONT_SIZES", () => {
    it("should contain all expected font sizes", () => {
        expect(VALID_FONT_SIZES).toContain("small");
        expect(VALID_FONT_SIZES).toContain("medium");
        expect(VALID_FONT_SIZES).toContain("large");
        expect(VALID_FONT_SIZES).toContain("x-large");
        expect(VALID_FONT_SIZES.length).toBe(4);
    });
});

describe("VALID_FONT_CONTRASTS", () => {
    it("should contain all expected font contrasts", () => {
        expect(VALID_FONT_CONTRASTS).toContain("low");
        expect(VALID_FONT_CONTRASTS).toContain("normal");
        expect(VALID_FONT_CONTRASTS).toContain("high");
        expect(VALID_FONT_CONTRASTS.length).toBe(3);
    });
});
