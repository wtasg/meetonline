import { getOAuthConnectionsByUserId, deleteOAuthConnection } from "../database/oauth_connections.js";
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";

/**
 * @param {Express.Application} app
 */
function setupUserOAuthHandlers(app) {
    app.get("/user/oauth_connections", hybridAuthMiddleware, async (req, res) => {
        try {
            const connections = await getOAuthConnectionsByUserId(req.user.userId);
            res.json({ ok: true, connections: connections.map(c => ({ provider: c.provider, email: c.email })) });
        } catch (error) {
            console.error("Error fetching oauth connections:", error);
            res.status(500).json({ ok: false, message: "Internal server error" });
        }
    });

    app.delete("/user/oauth_connections/:provider", hybridAuthMiddleware, async (req, res) => {
        try {
            await deleteOAuthConnection(req.user.userId, req.params.provider);
            res.json({ ok: true, message: "Disconnected successfully" });
        } catch (error) {
            console.error("Error deleting oauth connection:", error);
            res.status(500).json({ ok: false, message: "Internal server error" });
        }
    });
}

export { setupUserOAuthHandlers };
