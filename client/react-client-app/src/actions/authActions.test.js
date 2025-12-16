import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loginAction } from "./authActions.js";
import * as authNet from "../net/auth.js";
import { user_session } from "../session.js";

// Mock the network layer
vi.mock("../net/auth.js", () => ({
    login: vi.fn(),
    prelogin: vi.fn(),
}));

// Mock the session
vi.mock("../session.js", () => ({
    user_session: {
        store: vi.fn(),
        retrieve: vi.fn(),
        eject: vi.fn(),
    },
    resetLocation: vi.fn(),
    resetUserSession: vi.fn(),
}));

describe("authActions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock console.error to avoid polluting test output
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("loginAction", () => {
        const credentials = { username: "testuser", password: "testpass" };

        beforeEach(() => {
            user_session.retrieve.mockReturnValue("mock-login-token");
        });

        it("should reject if username is missing", async () => {
            await expect(loginAction({ username: "", password: "testpass" }))
                .rejects.toBe("Username and password are required");
        });

        it("should reject if password is missing", async () => {
            await expect(loginAction({ username: "testuser", password: "" }))
                .rejects.toBe("Username and password are required");
        });

        it("should return true on successful login with valid response", async () => {
            const mockResponse = {
                ok: true,
                login: {
                    username: "testuser",
                    session: "mock-session-id",
                },
            };

            authNet.login.mockResolvedValue(mockResponse);

            const result = await loginAction(credentials);

            expect(result).toBe(true);
            expect(user_session.store).toHaveBeenCalledWith("username", "testuser");
            expect(user_session.store).toHaveBeenCalledWith("session", "mock-session-id");
            expect(user_session.eject).toHaveBeenCalledWith("login_token");
        });

        it("should return false when response is ok but login data is missing", async () => {
            const mockResponse = {
                ok: true,
                // login property is missing
            };

            authNet.login.mockResolvedValue(mockResponse);

            const result = await loginAction(credentials);

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith("Unexpected response: missing login data");
            expect(user_session.store).not.toHaveBeenCalled();
        });

        it("should return false when response is ok but login is null", async () => {
            const mockResponse = {
                ok: true,
                login: null,
            };

            authNet.login.mockResolvedValue(mockResponse);

            const result = await loginAction(credentials);

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith("Unexpected response: missing login data");
            expect(user_session.store).not.toHaveBeenCalled();
        });

        it("should return false when response is ok but login is undefined", async () => {
            const mockResponse = {
                ok: true,
                login: undefined,
            };

            authNet.login.mockResolvedValue(mockResponse);

            const result = await loginAction(credentials);

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith("Unexpected response: missing login data");
            expect(user_session.store).not.toHaveBeenCalled();
        });

        it("should return false on failed login", async () => {
            const mockResponse = {
                ok: false,
                error: "Invalid credentials",
            };

            authNet.login.mockResolvedValue(mockResponse);
            authNet.prelogin.mockResolvedValue({ ok: true, token: "new-token" });

            const result = await loginAction(credentials);

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith("Invalid credentials");
            expect(user_session.eject).toHaveBeenCalledWith("username");
            expect(authNet.prelogin).toHaveBeenCalled();
        });
    });
});
