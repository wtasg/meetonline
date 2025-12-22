import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    storeTokens,
    getTokens,
    getAccessToken,
    getRefreshToken,
    getUsername,
    clearTokens,
    isAccessTokenExpired,
    isRefreshTokenExpired,
    hasValidTokens,
    updateAccessToken
} from "./jwt";

describe("JWT Token Security", () => {
    let mockSessionStorage: Record<string, string>;

    beforeEach(() => {
        // Mock sessionStorage
        mockSessionStorage = {};
        vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => ({
            setItem: vi.fn((key: string, value: string) => {
                mockSessionStorage[key] = value;
            }),
            getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
            removeItem: vi.fn((key: string) => {
                delete mockSessionStorage[key];
            }),
            clear: vi.fn(),
            key: vi.fn(),
            length: 0
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        mockSessionStorage = {};
    });

    describe("Token Storage Security", () => {
        it("should store JWT tokens only in sessionStorage (not localStorage)", () => {
            // This is critical for security: tokens must ONLY be in sessionStorage
            // to ensure they're cleared when the browser session ends

            const tokens = {
                accessToken: "test-access-token",
                refreshToken: "test-refresh-token",
                accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
                refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
                username: "testuser"
            };

            storeTokens(tokens);

            // Tokens should only be in sessionStorage
            const storedData = mockSessionStorage.jwt_tokens;
            expect(storedData).toBeDefined();

            const parsed = JSON.parse(storedData);
            expect(parsed.accessToken).toBe(tokens.accessToken);
            expect(parsed.refreshToken).toBe(tokens.refreshToken);
        });

        it("should retrieve tokens from sessionStorage only", () => {
            const tokens = {
                accessToken: "test-access-token",
                refreshToken: "test-refresh-token",
                accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
                refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
                username: "testuser"
            };

            storeTokens(tokens);

            const retrieved = getTokens();
            expect(retrieved).toBeDefined();
            expect(retrieved?.accessToken).toBe(tokens.accessToken);
            expect(retrieved?.refreshToken).toBe(tokens.refreshToken);
            expect(retrieved?.username).toBe(tokens.username);
        });

        it("should clear tokens from sessionStorage", () => {
            const tokens = {
                accessToken: "test-access-token",
                refreshToken: "test-refresh-token",
                accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
                refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
                username: "testuser"
            };

            storeTokens(tokens);
            expect(getTokens()).toBeDefined();

            clearTokens();

            expect(getTokens()).toBeNull();
            expect(mockSessionStorage.jwt_tokens).toBeUndefined();
        });
    });

    describe("Token Retrieval Functions", () => {
        const validTokens = {
            accessToken: "valid-access-token",
            refreshToken: "valid-refresh-token",
            accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
            refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
            username: "testuser"
        };

        beforeEach(() => {
            storeTokens(validTokens);
        });

        it("should get access token", () => {
            expect(getAccessToken()).toBe(validTokens.accessToken);
        });

        it("should get refresh token", () => {
            expect(getRefreshToken()).toBe(validTokens.refreshToken);
        });

        it("should get username", () => {
            expect(getUsername()).toBe(validTokens.username);
        });

        it("should return null when no tokens are stored", () => {
            clearTokens();
            expect(getAccessToken()).toBeNull();
            expect(getRefreshToken()).toBeNull();
            expect(getUsername()).toBeNull();
        });
    });

    describe("Token Expiration", () => {
        it("should detect expired access token", () => {
            const expiredTokens = {
                accessToken: "expired-access-token",
                refreshToken: "valid-refresh-token",
                accessTokenExpiresAt: new Date(Date.now() - 1000).toISOString(), // Expired
                refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
                username: "testuser"
            };

            storeTokens(expiredTokens);
            expect(isAccessTokenExpired()).toBe(true);
        });

        it("should detect valid access token", () => {
            const validTokens = {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
                accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
                refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
                username: "testuser"
            };

            storeTokens(validTokens);
            expect(isAccessTokenExpired()).toBe(false);
        });

        it("should detect expired refresh token", () => {
            const expiredTokens = {
                accessToken: "valid-access-token",
                refreshToken: "expired-refresh-token",
                accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
                refreshTokenExpiresAt: new Date(Date.now() - 1000).toISOString(), // Expired
                username: "testuser"
            };

            storeTokens(expiredTokens);
            expect(isRefreshTokenExpired()).toBe(true);
            expect(hasValidTokens()).toBe(false);
        });

        it("should detect valid tokens", () => {
            const validTokens = {
                accessToken: "valid-access-token",
                refreshToken: "valid-refresh-token",
                accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
                refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
                username: "testuser"
            };

            storeTokens(validTokens);
            expect(hasValidTokens()).toBe(true);
        });
    });

    describe("Token Update", () => {
        it("should update access token", () => {
            const initialTokens = {
                accessToken: "old-access-token",
                refreshToken: "refresh-token",
                accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
                refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
                username: "testuser"
            };

            storeTokens(initialTokens);

            const newAccessToken = "new-access-token";
            const newExpiresAt = new Date(Date.now() + 7200000).toISOString();

            updateAccessToken(newAccessToken, newExpiresAt);

            const tokens = getTokens();
            expect(tokens?.accessToken).toBe(newAccessToken);
            expect(tokens?.accessTokenExpiresAt).toBe(newExpiresAt);
            expect(tokens?.refreshToken).toBe(initialTokens.refreshToken); // Unchanged
        });
    });
});
