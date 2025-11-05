/**
 *
 * @param {Express.Application} app
 */
function setupRootHandlers(app) {
    app.get("/", rootHandler);
}

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function rootHandler(req, res) {
    res.json({ ok: true, message: "Server is running" });
}

export { setupRootHandlers };
