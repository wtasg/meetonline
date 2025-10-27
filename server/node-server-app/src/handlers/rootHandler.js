/**
 *
 * @param {Express.Application} app
 */
function setupRootHandlers(app) {
    app.get("/", rootHandler);
}

/**
 *
 * @param {Express.Request} _
 * @param {Express.Response} res
 */
function rootHandler(_, res) {
    res.send("GET / says hello!");
}

export { setupRootHandlers };
