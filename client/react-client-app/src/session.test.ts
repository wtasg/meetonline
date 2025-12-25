import { describe, it, expect, beforeEach, vi } from "vitest";
import { user_session, location, resetUserSession, resetLocation, clearUserData, settings } from "./session";
import { themeStorage } from "./utils/theme";
import { settingsStorage } from "./utils/settings";

// Define simpler Storage type for testing since we just need to inspect internal structure
interface StorageLike {
    storages: Array<{
        constructor: {
            name: string;
        };
    }>;
    store(key: string, value: string): void;
    retrieve(key: string): string | null | undefined;
}

describe("Session Security", () => {
    describe("user_session storage configuration", () => {
        it("should use only sessionStorage for token storage (not localStorage)", () => {
            // This test ensures tokens are only stored in sessionStorage,
            // which clears when the browser session ends, preventing security vulnerabilities

            // Cast to inspect internal private property 'storages' for testing
            const session = user_session as unknown as StorageLike;

            // user_session should have only one storage backend (sessionStorage)
            expect(session.storages).toHaveLength(1);

            // Verify it's SessionStorage, not LocalStorage
            expect(session.storages[0].constructor.name).toBe("SessionStorage");
        });

        it("should not include localStorage in user_session storage backends", () => {
            const session = user_session as unknown as StorageLike;
            // Verify that localStorage is NOT in the storage backends
            const hasLocalStorage = session.storages.some(
                storage => storage.constructor.name === "LocalStorage"
            );
            expect(hasLocalStorage).toBe(false);
        });
    });

    describe("user_session functionality", () => {
        let mockSessionStorage: Record<string, string>;

        beforeEach(() => {
            // Mock sessionStorage
            mockSessionStorage = {};
            vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => ({
                setItem: vi.fn((key: string, value: string) => { mockSessionStorage[key] = value; }),
                getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
                removeItem: vi.fn((key: string) => { delete mockSessionStorage[key]; }),
                clear: vi.fn(),
                key: vi.fn(),
                length: 0
            }));
        });

        it("should store and retrieve username", () => {
            user_session.store("username", "testuser");
            const retrieved = user_session.retrieve("username");
            expect(retrieved).toBe("testuser");
        });

        it("should store and retrieve session token", () => {
            user_session.store("session", "test-session-token");
            const retrieved = user_session.retrieve("session");
            expect(retrieved).toBe("test-session-token");
        });

        it("should reset user session correctly", () => {
            user_session.store("username", "testuser");
            user_session.store("session", "test-session");
            user_session.store("displayName", "Test User");

            resetUserSession();

            expect(user_session.retrieve("username")).toBeNull();
            expect(user_session.retrieve("session")).toBeNull();
            expect(user_session.retrieve("displayName")).toBeNull();
        });
    });

    describe("clearUserData functionality", () => {
        let mockLocalStorage: Record<string, string>;

        beforeEach(() => {
            // Mock localStorage
            mockLocalStorage = {};
            vi.spyOn(window, "localStorage", "get").mockImplementation(() => ({
                setItem: vi.fn((key: string, value: string) => { mockLocalStorage[key] = value; }),
                getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
                removeItem: vi.fn((key: string) => { delete mockLocalStorage[key]; }),
                clear: vi.fn(),
                key: vi.fn(),
                length: 0
            }));
        });

        it("should clear all user settings from localStorage", () => {
            // Store some user data
            settings.store("userSettings", JSON.stringify({ theme: "gray" }));
            themeStorage.store("theme", "teal");
            themeStorage.store("scheme", "dark");
            themeStorage.store("filter", "vivid");
            settingsStorage.store("fontSize", "large");
            settingsStorage.store("fontContrast", "high");

            // Clear all user data
            clearUserData();

            // Verify all data is cleared
            expect(settings.retrieve("userSettings")).toBeNull();
            expect(themeStorage.retrieve("theme")).toBeNull();
            expect(themeStorage.retrieve("scheme")).toBeNull();
            expect(themeStorage.retrieve("filter")).toBeNull();
            expect(settingsStorage.retrieve("fontSize")).toBeNull();
            expect(settingsStorage.retrieve("fontContrast")).toBeNull();
        });
    });

    describe("location storage configuration", () => {
        it("should use localStorage for non-sensitive path data", () => {
            // location storage is for navigation paths, which are not sensitive
            // and should persist across sessions
            const loc = location as unknown as StorageLike;

            expect(loc.storages).toHaveLength(1);
            expect(loc.storages[0].constructor.name).toBe("LocalStorage");
        });

        it("should reset location correctly", () => {
            location.store("path", "/some/path");
            resetLocation();
            expect(location.retrieve("path")).toBe("/");
        });
    });
});
