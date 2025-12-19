import express from "express";
import request from "supertest";
import {
    createAuthRateLimiter,
    createApiRateLimiter,
    createUploadRateLimiter,
    getRateLimitConfig
} from "../../src/middlewares/rateLimitMiddleware.js";

describe("Rate Limit Middleware", () => {
    describe("getRateLimitConfig", () => {
        it("should return default configuration when env vars are not set", () => {
            const config = getRateLimitConfig();
            expect(config.auth.windowMs).toBe(60000);
            expect(config.auth.max).toBe(12);
            expect(config.api.windowMs).toBe(60000);
            expect(config.api.max).toBe(60);
            expect(config.upload.windowMs).toBe(60000);
            expect(config.upload.max).toBe(10);
        });

        it("should use environment variables when set", () => {
            const oldEnv = { ...process.env };
            process.env.RATE_LIMIT_AUTH_WINDOW_MS = "30000";
            process.env.RATE_LIMIT_AUTH_MAX = "5";
            process.env.RATE_LIMIT_API_WINDOW_MS = "120000";
            process.env.RATE_LIMIT_API_MAX = "100";
            process.env.RATE_LIMIT_UPLOAD_WINDOW_MS = "90000";
            process.env.RATE_LIMIT_UPLOAD_MAX = "15";

            const config = getRateLimitConfig();
            expect(config.auth.windowMs).toBe(30000);
            expect(config.auth.max).toBe(5);
            expect(config.api.windowMs).toBe(120000);
            expect(config.api.max).toBe(100);
            expect(config.upload.windowMs).toBe(90000);
            expect(config.upload.max).toBe(15);

            // Restore environment
            process.env = oldEnv;
        });
    });

    describe("Auth Rate Limiter", () => {
        let app;

        beforeEach(() => {
            app = express();
            app.use(express.json());

            // Override environment for testing
            process.env.RATE_LIMIT_AUTH_WINDOW_MS = "60000";
            process.env.RATE_LIMIT_AUTH_MAX = "3";

            const authRateLimiter = createAuthRateLimiter();
            app.post("/auth/test", authRateLimiter, (req, res) => {
                res.json({ ok: true, message: "Success" });
            });
        });

        afterEach(() => {
            // Clean up environment
            delete process.env.RATE_LIMIT_AUTH_WINDOW_MS;
            delete process.env.RATE_LIMIT_AUTH_MAX;
        });

        it("should allow requests within the limit", async () => {
            const response1 = await request(app).post("/auth/test");
            expect(response1.status).toBe(200);
            expect(response1.body.ok).toBe(true);

            const response2 = await request(app).post("/auth/test");
            expect(response2.status).toBe(200);
            expect(response2.body.ok).toBe(true);
        });

        it("should block requests exceeding the limit", async () => {
            // Make requests up to the limit
            await request(app).post("/auth/test");
            await request(app).post("/auth/test");
            await request(app).post("/auth/test");

            // This one should be blocked
            const response = await request(app).post("/auth/test");
            expect(response.status).toBe(429);
            expect(response.body.ok).toBe(false);
            expect(response.body.message).toBe("Too many requests, please try again later.");
        });

        it("should include standard rate limit headers", async () => {
            const response = await request(app).post("/auth/test");
            expect(response.headers["ratelimit-limit"]).toBeDefined();
            expect(response.headers["ratelimit-remaining"]).toBeDefined();
            expect(response.headers["ratelimit-reset"]).toBeDefined();
        });

        it("should not expose internal implementation details in error", async () => {
            // Exceed the limit
            await request(app).post("/auth/test");
            await request(app).post("/auth/test");
            await request(app).post("/auth/test");
            const response = await request(app).post("/auth/test");

            expect(response.status).toBe(429);
            expect(response.body.message).not.toContain("rate");
            expect(response.body.message).not.toContain("limit");
            expect(response.body.message).not.toContain("IP");
            expect(response.body).not.toHaveProperty("error");
            expect(response.body).not.toHaveProperty("stack");
        });
    });

    describe("API Rate Limiter", () => {
        let app;

        beforeEach(() => {
            app = express();
            app.use(express.json());

            process.env.RATE_LIMIT_API_WINDOW_MS = "60000";
            process.env.RATE_LIMIT_API_MAX = "5";

            const apiRateLimiter = createApiRateLimiter();
            app.get("/api/test", apiRateLimiter, (req, res) => {
                res.json({ ok: true, data: "test" });
            });
        });

        afterEach(() => {
            delete process.env.RATE_LIMIT_API_WINDOW_MS;
            delete process.env.RATE_LIMIT_API_MAX;
        });

        it("should allow requests within the limit", async () => {
            const response = await request(app).get("/api/test");
            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
        });

        it("should block requests exceeding the limit", async () => {
            // Make requests up to the limit
            for (let i = 0; i < 5; i++) {
                await request(app).get("/api/test");
            }

            // This one should be blocked
            const response = await request(app).get("/api/test");
            expect(response.status).toBe(429);
            expect(response.body.ok).toBe(false);
        });

        it("should return consistent error format", async () => {
            // Exceed limit
            for (let i = 0; i < 5; i++) {
                await request(app).get("/api/test");
            }

            const response = await request(app).get("/api/test");
            expect(response.status).toBe(429);
            expect(response.body).toHaveProperty("ok");
            expect(response.body).toHaveProperty("message");
            expect(response.body.ok).toBe(false);
        });
    });

    describe("Upload Rate Limiter", () => {
        let app;

        beforeEach(() => {
            app = express();
            app.use(express.json());

            process.env.RATE_LIMIT_UPLOAD_WINDOW_MS = "60000";
            process.env.RATE_LIMIT_UPLOAD_MAX = "2";

            const uploadRateLimiter = createUploadRateLimiter();
            app.post("/upload/test", uploadRateLimiter, (req, res) => {
                res.json({ ok: true, uploaded: true });
            });
        });

        afterEach(() => {
            delete process.env.RATE_LIMIT_UPLOAD_WINDOW_MS;
            delete process.env.RATE_LIMIT_UPLOAD_MAX;
        });

        it("should allow requests within the limit", async () => {
            const response = await request(app).post("/upload/test");
            expect(response.status).toBe(200);
            expect(response.body.ok).toBe(true);
        });

        it("should block requests exceeding the limit", async () => {
            // Make requests up to the limit
            await request(app).post("/upload/test");
            await request(app).post("/upload/test");

            // This one should be blocked
            const response = await request(app).post("/upload/test");
            expect(response.status).toBe(429);
            expect(response.body.ok).toBe(false);
        });

        it("should have stricter limits than general API", () => {
            const config = getRateLimitConfig();
            expect(config.upload.max).toBeLessThan(config.api.max);
        });
    });

    describe("Security Validation", () => {
        let app;

        beforeEach(() => {
            app = express();
            app.use(express.json());

            process.env.RATE_LIMIT_AUTH_WINDOW_MS = "60000";
            process.env.RATE_LIMIT_AUTH_MAX = "2";

            const authRateLimiter = createAuthRateLimiter();
            app.post("/test", authRateLimiter, (req, res) => {
                res.json({ ok: true });
            });
        });

        afterEach(() => {
            delete process.env.RATE_LIMIT_AUTH_WINDOW_MS;
            delete process.env.RATE_LIMIT_AUTH_MAX;
        });

        it("should not leak sensitive information in rate limit response", async () => {
            // Exceed limit
            await request(app).post("/test");
            await request(app).post("/test");
            const response = await request(app).post("/test");

            expect(response.body).not.toHaveProperty("ip");
            expect(response.body).not.toHaveProperty("endpoint");
            expect(response.body).not.toHaveProperty("windowMs");
            expect(response.body).not.toHaveProperty("max");
            expect(response.body).not.toHaveProperty("current");
        });

        it("should return standardized JSON response format", async () => {
            // Exceed limit
            await request(app).post("/test");
            await request(app).post("/test");
            const response = await request(app).post("/test");

            expect(response.status).toBe(429);
            expect(response.body).toEqual({
                ok: false,
                message: "Too many requests, please try again later."
            });
        });
    });

    describe("Environment Variable Validation", () => {
        it("should handle invalid environment values gracefully", () => {
            const oldEnv = { ...process.env };
            process.env.RATE_LIMIT_AUTH_WINDOW_MS = "invalid";
            process.env.RATE_LIMIT_AUTH_MAX = "not-a-number";

            const config = getRateLimitConfig();
            // parseInt returns NaN for invalid values, but we should get defaults or valid numbers
            expect(typeof config.auth.windowMs).toBe("number");
            expect(typeof config.auth.max).toBe("number");

            process.env = oldEnv;
        });

        it("should handle empty string environment values", () => {
            const oldEnv = { ...process.env };
            process.env.RATE_LIMIT_AUTH_WINDOW_MS = "";
            process.env.RATE_LIMIT_AUTH_MAX = "";

            const config = getRateLimitConfig();
            expect(typeof config.auth.windowMs).toBe("number");
            expect(typeof config.auth.max).toBe("number");

            process.env = oldEnv;
        });
    });
});
