import { jwtAuthMiddleware } from "./jwtMiddleware.js";

/**
 * Hybrid authentication middleware that supports JWT.
 * Tries JWT first, returns 401 if no valid authentication.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {Promise<void>}
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
