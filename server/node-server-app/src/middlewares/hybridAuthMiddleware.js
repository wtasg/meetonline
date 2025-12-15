import { jwtAuthMiddleware } from "./jwtMiddleware.js";

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

    // Fallback to cookie-based authentication - REMOVED
    // We now strictly require JWT headers for authenticated routes outside of public ones
    return res.status(401).json({
        ok: false,
        message: "Authentication required"
    });

    // Legacy cookie code removed
}

export { hybridAuthMiddleware };
