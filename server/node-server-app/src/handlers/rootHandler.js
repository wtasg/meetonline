import { apiRateLimiter } from "../middlewares/rateLimitMiddleware.js";

/**
 * Sets up root/health check route handlers.
 * @param {import('express').Application} app - The Express application instance.
 * @returns {void}
 */
function setupRootHandlers(app) {
    app.get("/", apiRateLimiter, rootHandler);
}

/**
 * GET / - Root endpoint health check.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {import('express').Response}
 */
function rootHandler(req, res) {
    return res.json({ ok: true, message: "Server is running" });
}

export { setupRootHandlers };
