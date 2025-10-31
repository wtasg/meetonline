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
    const { cookies, signedCookies } = req;
    console.log({ cookies, signedCookies });

    res.send("GET / says hello!");
}

export { setupRootHandlers };
