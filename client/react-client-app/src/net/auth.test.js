import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { signup, logout, presignup, authToken, authRefresh, logoutJwt } from "./auth.js";

// Mock the CONF module
vi.mock("./net-conf.js", () => ({
    CONF: {
        HTTPS_SERVER: "https://localhost:3000",
        URLS: {

            SIGNUP: "signup",
            LOGOUT: "logout",
        }
    }
}));

// Mock the csrf module to avoid CSRF fetch interfering with auth tests
vi.mock("./csrf.js", () => ({
    ensureCsrfToken: vi.fn().mockResolvedValue(undefined),
    getCsrfHeaders: vi.fn().mockReturnValue({ "x-csrf-token": "mock-csrf-token" })
}));

describe("Auth Network Functions", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
        // Suppress console.error during tests
        vi.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("presignup", () => {
        it("should return token on successful response", async () => {
            const mockResponse = { ok: true, token: "test-signup-token" };
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            });

            const result = await presignup();

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                "https://localhost:3000/signup",
                expect.objectContaining({
                    method: "GET",
                    credentials: "include"
                })
            );
        });

        it("should handle HTTP error responses", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404
            });

            const result = await presignup();

            expect(result).toEqual({ ok: false, message: "HTTP error! status: 404" });
        });

        it("should handle network errors", async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

            const result = await presignup();

            expect(result).toEqual({ ok: false, message: "Connection refused" });
            expect(console.error).toHaveBeenCalledWith("presignup error:", expect.any(Error));
        });
    });

    describe("signup", () => {
        it("should signup successfully with valid credentials", async () => {
            const mockResponse = {
                ok: true,
                signup: { username: "newuser" },
                message: "Signup successful"
            };
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            });

            const result = await signup({ username: "newuser", password: "password123", token: "token" });

            expect(result).toEqual(mockResponse);
        });

        it("should handle HTTP error responses", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 409
            });

            const result = await signup({ username: "existinguser", password: "password123", token: "token" });

            expect(result).toEqual({ ok: false, message: "HTTP error! status: 409" });
        });

        it("should handle network errors", async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

            const result = await signup({ username: "newuser", password: "password123", token: "token" });

            expect(result).toEqual({ ok: false, message: "Network error" });
            expect(console.error).toHaveBeenCalledWith("signup error:", expect.any(Error));
        });
    });

    describe("logout", () => {
        it("should logout successfully", async () => {
            const mockResponse = {
                ok: true,
                logout: true,
                message: "Logout successful"
            };
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            });

            const result = await logout({ username: "testuser" });

            expect(result).toEqual(mockResponse);
        });

        it("should handle HTTP error responses", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400
            });

            const result = await logout({ username: "testuser" });

            expect(result).toEqual({ ok: false, message: "HTTP error! status: 400" });
        });

        it("should handle network errors", async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error("Fetch failed"));

            const result = await logout({ username: "testuser" });

            expect(result).toEqual({ ok: false, message: "Fetch failed" });
            expect(console.error).toHaveBeenCalledWith("logout error:", expect.any(Error));
        });
    });

    describe("authToken", () => {
        it("should authenticate and return JWT tokens", async () => {
            const now = new Date();
            const accessExpiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
            const refreshExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

            const mockResponse = {
                ok: true,
                auth_token: {
                    accessToken: "access-token",
                    refreshToken: "refresh-token",
                    accessTokenExpiresAt: accessExpiry.toISOString(),
                    refreshTokenExpiresAt: refreshExpiry.toISOString(),
                    username: "testuser"
                },
                message: "Authentication successful"
            };
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            });

            const result = await authToken({ username: "testuser", password: "password123" });

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                "https://localhost:3000/auth_token",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({ username: "testuser", password: "password123" })
                })
            );
        });

        it("should handle HTTP error responses", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 403
            });

            const result = await authToken({ username: "testuser", password: "wrong" });

            expect(result).toEqual({ ok: false, message: "HTTP error! status: 403" });
        });

        it("should handle network errors", async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error("Server unavailable"));

            const result = await authToken({ username: "testuser", password: "password123" });

            expect(result).toEqual({ ok: false, message: "Server unavailable" });
            expect(console.error).toHaveBeenCalledWith("authToken error:", expect.any(Error));
        });
    });

    describe("authRefresh", () => {
        it("should refresh JWT tokens successfully", async () => {
            const now = new Date();
            const accessExpiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
            const refreshExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

            const mockResponse = {
                ok: true,
                auth_refresh: {
                    accessToken: "new-access-token",
                    refreshToken: "new-refresh-token",
                    accessTokenExpiresAt: accessExpiry.toISOString(),
                    refreshTokenExpiresAt: refreshExpiry.toISOString()
                },
                message: "Token refresh successful"
            };
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            });

            const result = await authRefresh({ refreshToken: "old-refresh-token" });

            expect(result).toEqual(mockResponse);
        });

        it("should handle HTTP error responses", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401
            });

            const result = await authRefresh({ refreshToken: "invalid-token" });

            expect(result).toEqual({ ok: false, message: "HTTP error! status: 401" });
        });

        it("should handle network errors", async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error("Connection timeout"));

            const result = await authRefresh({ refreshToken: "refresh-token" });

            expect(result).toEqual({ ok: false, message: "Connection timeout" });
            expect(console.error).toHaveBeenCalledWith("authRefresh error:", expect.any(Error));
        });
    });

    describe("logoutJwt", () => {
        it("should logout successfully with JWT", async () => {
            const mockResponse = {
                ok: true,
                logout: true,
                message: "Logout successful"
            };
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            });

            const result = await logoutJwt("access-token");

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                "https://localhost:3000/logout",
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Authorization": "Bearer access-token"
                    })
                })
            );
        });

        it("should handle HTTP error responses", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401
            });

            const result = await logoutJwt("invalid-token");

            expect(result).toEqual({ ok: false, message: "HTTP error! status: 401" });
        });

        it("should handle network errors", async () => {
            globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

            const result = await logoutJwt("access-token");

            expect(result).toEqual({ ok: false, message: "Network failure" });
            expect(console.error).toHaveBeenCalledWith("logoutJwt error:", expect.any(Error));
        });
    });
});
