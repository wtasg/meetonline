import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || randomBytes(64).toString("hex");
const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m"; // 15 minutes
const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d"; // 7 days

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (e.g., { userId, username })
 * @returns {string} JWT access token
 */
function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
        issuer: "meetonline",
        audience: "meetonline-client"
    });
}

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload (e.g., { userId, username })
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_TOKEN_EXPIRY,
        issuer: "meetonline",
        audience: "meetonline-client"
    });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET, {
            issuer: "meetonline",
            audience: "meetonline-client"
        });
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return null;
    }
}

/**
 * Decode JWT token without verification (for inspection)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token or null if invalid
 */
function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error("Token decoding failed:", error.message);
        return null;
    }
}

/**
 * Get token expiration date
 * @param {string} expiresIn - Expiry string (e.g., "15m", "7d")
 * @returns {Date} Expiration date
 */
function getTokenExpirationDate(expiresIn) {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    
    if (!match) {
        throw new Error("Invalid expiry format");
    }
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
        case "s":
            return new Date(now.getTime() + value * 1000);
        case "m":
            return new Date(now.getTime() + value * 60 * 1000);
        case "h":
            return new Date(now.getTime() + value * 60 * 60 * 1000);
        case "d":
            return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
        default:
            throw new Error("Invalid expiry unit");
    }
}

export {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    getTokenExpirationDate,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_EXPIRY
};
