import { verifyToken } from "../utils/jwt.js";
import { getJwtTokenByAccessToken } from "../database/jwt_tokens.js";

/**
 * JWT Authentication Middleware
 * Verifies the JWT token from the Authorization header
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
async function jwtAuthMiddleware(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                ok: false,
                message: "No token provided"
            });
        }
        
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        
        // Verify token
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({
                ok: false,
                message: "Invalid or expired token"
            });
        }
        
        // Check if token exists in database and is not revoked
        const dbToken = await getJwtTokenByAccessToken(token);
        
        if (dbToken.__isNull || dbToken.isRevoked) {
            return res.status(401).json({
                ok: false,
                message: "Token has been revoked"
            });
        }
        
        // Check if token is expired
        if (new Date(dbToken.accessTokenExpiresAt) < new Date()) {
            return res.status(401).json({
                ok: false,
                message: "Token has expired"
            });
        }
        
        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            username: decoded.username
        };
        
        next();
    } catch (error) {
        console.error("JWT middleware error:", error);
        return res.status(500).json({
            ok: false,
            message: "Internal server error"
        });
    }
}

/**
 * Optional JWT Authentication Middleware
 * Tries to authenticate but doesn't fail if no token is provided
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
async function optionalJwtAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // No token provided, continue without authentication
            next();
            return;
        }
        
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (decoded) {
            const dbToken = await getJwtTokenByAccessToken(token);
            
            if (!dbToken.__isNull && !dbToken.isRevoked && new Date(dbToken.accessTokenExpiresAt) >= new Date()) {
                req.user = {
                    userId: decoded.userId,
                    username: decoded.username
                };
            }
        }
        
        next();
    } catch (error) {
        console.error("Optional JWT middleware error:", error);
        next();
    }
}

export { jwtAuthMiddleware, optionalJwtAuthMiddleware };
