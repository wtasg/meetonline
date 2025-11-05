/**
 *
 * @param {Express.Application} app
 */
function setupRootHandlers(app) {
    app.get("/", rootHandler);
}

/**
 * Responds to root requests with a JSON health/status message.
 *
 * Sends a JSON payload { ok: true, message: "Server is running" } to the client.
 * @param {Express.Request} req - Incoming HTTP request for the root path.
 * @param {Express.Response} res - HTTP response used to send the JSON payload.
 */
function rootHandler(req, res) {
    res.json({ ok: true, message: "Server is running" });
}

export { setupRootHandlers };