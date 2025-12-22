import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    hasUserSession,
    destroySession,
    username,
    getStoredDisplayName,
    setStoredDisplayName,
    displayName
} from "./session";
import * as jwt from "./jwt";
import * as sessionModule from "../session";

describe("session utilities", () => {
    beforeEach(() => {
        // Mock sessionStorage for jwt module
        const mockSessionStorage: Record<string, string> = {};
        vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => ({
            setItem: vi.fn((key: string, value: string) => { mockSessionStorage[key] = value; }),
            getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
            removeItem: vi.fn((key: string) => { delete mockSessionStorage[key]; }),
            clear: vi.fn(),
            key: vi.fn(),
            length: 0
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("hasUserSession", () => {
        it("should return true when JWT tokens are valid", () => {
            vi.spyOn(jwt, "hasValidTokens").mockReturnValue(true);
            expect(hasUserSession()).toBe(true);
        });

        it("should return false when no JWT tokens and no cookie session", () => {
            vi.spyOn(jwt, "hasValidTokens").mockReturnValue(false);
            vi.spyOn(sessionModule.user_session, "retrieve").mockReturnValue(null);
            expect(hasUserSession()).toBe(false);
        });

        it("should return true when no JWT but valid cookie session exists", () => {
            vi.spyOn(jwt, "hasValidTokens").mockReturnValue(false);
            vi.spyOn(sessionModule.user_session, "retrieve").mockImplementation((key: string) => {
                if (key === "username") return "testuser";
                if (key === "session") return "session-token";
                return null;
            });
            expect(hasUserSession()).toBe(true);
        });
    });

    describe("destroySession", () => {
        it("should call reset functions and clear tokens", () => {
            const resetUserSessionSpy = vi.spyOn(sessionModule, "resetUserSession").mockImplementation(() => { });
            const resetLocationSpy = vi.spyOn(sessionModule, "resetLocation").mockImplementation(() => { });
            const clearTokensSpy = vi.spyOn(jwt, "clearTokens").mockImplementation(() => { });

            destroySession();

            expect(resetUserSessionSpy).toHaveBeenCalled();
            expect(resetLocationSpy).toHaveBeenCalled();
            expect(clearTokensSpy).toHaveBeenCalled();
        });
    });

    describe("username", () => {
        it("should return username from session storage", () => {
            vi.spyOn(sessionModule.user_session, "retrieve").mockReturnValue("testuser");
            expect(username()).toBe("testuser");
        });

        it("should return null when no username stored", () => {
            vi.spyOn(sessionModule.user_session, "retrieve").mockReturnValue(null);
            expect(username()).toBeNull();
        });
    });

    describe("displayName", () => {
        it("should return stored display name when available", () => {
            vi.spyOn(sessionModule.user_session, "retrieve").mockReturnValue("Test User");
            expect(displayName()).toBe("Test User");
        });

        it("should return 'User' as fallback when no display name stored", () => {
            vi.spyOn(sessionModule.user_session, "retrieve").mockReturnValue(null);
            expect(displayName()).toBe("User");
        });

        it("should return 'User' as fallback for empty display name", () => {
            vi.spyOn(sessionModule.user_session, "retrieve").mockReturnValue("");
            expect(displayName()).toBe("User");
        });

        it("should return 'User' as fallback for whitespace-only display name", () => {
            vi.spyOn(sessionModule.user_session, "retrieve").mockReturnValue("   ");
            expect(displayName()).toBe("User");
        });
    });

    describe("getStoredDisplayName", () => {
        it("should return stored display name", () => {
            vi.spyOn(sessionModule.user_session, "retrieve").mockReturnValue("Test User");
            expect(getStoredDisplayName()).toBe("Test User");
        });
    });

    describe("setStoredDisplayName", () => {
        it("should store display name", () => {
            const storeSpy = vi.spyOn(sessionModule.user_session, "store").mockImplementation(() => { });
            setStoredDisplayName("New Name");
            expect(storeSpy).toHaveBeenCalledWith("displayName", "New Name");
        });
    });
});
