import { jwtAuthMiddleware } from "./jwtMiddleware.js";
import { userSession } from "../utils/session.js";
import { getUserAccountByUsername } from "../database/user_account.js";

/**
 * Hybrid authentication middleware that supports both JWT and cookie-based auth
 * Tries JWT first, then falls back to cookies
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
async function hybridAuthMiddleware(req, res, next) {
    // Try JWT authentication first
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
        // Use JWT middleware
        return jwtAuthMiddleware(req, res, next);
    }
    
    // Fallback to cookie-based authentication
    try {
        const { cookies } = req;
        
        if (!cookies) {
            return res.status(401).json({
                ok: false,
                message: "Authentication required"
            });
        }
        
        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(401).json({
                ok: false,
                message: "Invalid or missing session"
            });
        }
        
        const storedSession = (await userSession({ username })).session;
        
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({
                ok: false,
                message: "Invalid session"
            });
        }
        
        // Get userId from database to maintain consistency with JWT auth
        const userAccount = await getUserAccountByUsername(username);
        
        // Attach user info to request (consistent with JWT middleware)
        req.user = {
            userId: (userAccount && userAccount.id) ? userAccount.id.toString() : null,
            username: username
        };
        
        next();
    } catch (error) {
        console.error("Hybrid auth middleware error:", error);
        return res.status(500).json({
            ok: false,
            message: "Internal server error"
        });
    }
}

export { hybridAuthMiddleware };
