
import express from "express";
import request from "supertest";
import cookieParser from "cookie-parser";
import { doubleCsrfProtection, generateCsrfToken } from "../../src/middlewares/csrfMiddleware.js";

describe("CSRF Middleware", () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use(cookieParser());

        // Setup CSRF endpoint
        app.get("/csrf-token", (req, res) => {
            const token = generateCsrfToken(req, res);
            res.json({ token });
        });

        // Protected route
        app.post("/protected", doubleCsrfProtection, (req, res) => {
            res.json({ ok: true });
        });

        // Error handler (next is required for Express error middleware signature)
        // eslint-disable-next-line no-unused-vars
        app.use((err, req, res, next) => {
            if (err.code === "EBADCSRFTOKEN") {
                return res.status(403).json({
                    ok: false,
                    message: "Invalid CSRF token"
                });
            }
            res.status(500).json({ error: err.message, stack: err.stack });
        });
    });

    it("should allow GET /csrf-token and set cookie", async () => {
        const response = await request(app).get("/csrf-token");
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.headers["set-cookie"]).toBeDefined();
        expect(response.headers["set-cookie"][0]).toContain("x-csrf-token");
    });

    it("should block POST /protected without token", async () => {
        const response = await request(app).post("/protected");
        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Invalid CSRF token");
    });

    it("should allow POST /protected with valid token and cookie", async () => {
        // 1. Get token and cookie
        const tokenRes = await request(app).get("/csrf-token");
        const token = tokenRes.body.token;
        const cookie = tokenRes.headers["set-cookie"];

        // 2. Make protected request
        const response = await request(app)
            .post("/protected")
            .set("Cookie", cookie)
            .set("x-csrf-token", token);

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
    });

    it("should block POST /protected with valid token but missing cookie", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const token = tokenRes.body.token;

        const response = await request(app)
            .post("/protected")
            .set("x-csrf-token", token);

        expect(response.status).toBe(403);
    });

    it("should block POST /protected with valid cookie but invalid token", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const cookie = tokenRes.headers["set-cookie"];

        const response = await request(app)
            .post("/protected")
            .set("Cookie", cookie)
            .set("x-csrf-token", "invalid-token");

        expect(response.status).toBe(403);
    });
});
