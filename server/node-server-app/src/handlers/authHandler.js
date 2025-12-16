import { createUserAccount, getUserAccountByUsername } from "../database/user_account.js";
import { comparePassword, hashWithSalt, saltWithRounds } from "../utils/hash.js";
import { v4 as uuidv4 } from "uuid";
import rateLimit from "express-rate-limit";
import { authStore, tokenStore } from "../utils/store.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    getTokenExpirationDate,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_EXPIRY
} from "../utils/jwt.js";
import {
    createJwtTokenPair,
    getJwtTokenByRefreshToken,
    revokeJwtToken,
    revokeAllJwtTokensForUser
} from "../database/jwt_tokens.js";
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";
import { COOKIE_CLEAR_OPTIONS } from "../utils/cookieConfig.js";

/**
 *
 * @param {Express.Application} app
 */

// Rate limiter for sensitive auth routes (e.g., 5 requests per minute per IP)
const authRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { ok: false, message: "Too many requests, please try again later." }
});

function setupAuthHandlers(app) {
    app.get("/signup", authRateLimiter, signupHandlerGET);
    app.post("/signup", authRateLimiter, signupHandlerPOST);
    app.post("/logout", authRateLimiter, hybridAuthMiddleware, logoutHandlerPOST);
    app.post("/auth_token", authRateLimiter, authTokenHandlerPOST);
    app.post("/auth_refresh", authRateLimiter, authRefreshHandlerPOST);
}

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function signupHandlerGET(req, res) {
    const token = uuidv4();
    // Cookie removed as part of security cleanup
    await tokenStore.store(token, (new Date()).toUTCString());
    res.status(200).json({ ok: true, token });
}

async function signupHandlerPOST(req, res) {
    const { token, username, password } = req.body;
    if (!token || !username || !password) {
        return res.status(400).json({ ok: false, message: "Missing token, username or password", signup: false });
    }

    const tokenCreatedAt = new Date(await tokenStore.retrieve(token));
    if ((new Date() - tokenCreatedAt) / 1000 > 120) {
        const newToken = uuidv4();
        await tokenStore.store(newToken, (new Date()).toUTCString());
        await tokenStore.eject(token);
        return res.status(400).json({ ok: false, message: "Old token. Retry!", signup: false, token: newToken });
    }

    const salt = await saltWithRounds();
    const hashedPassword = await hashWithSalt(password, salt);
    createUserAccount(username, hashedPassword, salt)
        .then(() => {
            return res.json({ ok: true, signup: { username }, message: "Signup successful!" });
        }).catch((err) => {
            console.error("Error creating user account:", err);
            return res.status(500).json({ ok: false, signup: false, message: "Internal server error" });
        });
}

async function logoutHandlerPOST(req, res) {
    // Revoke JWT tokens if user is authenticated via JWT
    if (req.user && req.user.userId) {
        await revokeAllJwtTokensForUser(req.user.userId);
    }

    // Also destroy cookie-based session for backward compatibility
    await destroySession(req, res);

    res.status(200)
        .json({ ok: true, logout: true, message: "Logout successful!" });
}

async function destroySession(req, res) {
    // Basic cleanup of tokens from store if they exist, but no cookies
    // This is largely legacy cleanup now
    // ... we can just ignore reading cookies since we don't use them.
    // But we might want to clear any stragglers if the user has them.
    res.clearCookie("session-1", COOKIE_CLEAR_OPTIONS);
    res.clearCookie("username", COOKIE_CLEAR_OPTIONS);
    res.clearCookie("loggedin", COOKIE_CLEAR_OPTIONS);
    res.clearCookie("signup_token", COOKIE_CLEAR_OPTIONS);
    res.clearCookie("login_token", COOKIE_CLEAR_OPTIONS);
}

/**
 * POST /auth_token - JWT-based authentication
 * Authenticates user and returns JWT tokens
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function authTokenHandlerPOST(req, res) {
    const { username: candidateUsername, password: candidatePassword } = req.body;

    if (!candidateUsername || !candidatePassword) {
        return res.status(400).json({
            ok: false,
            message: "Missing username or password",
            auth_token: false
        });
    }

    // Get user from database
    const dbuser = await getUserAccountByUsername(candidateUsername);
    if (dbuser.__isDefault || dbuser.__isNull || !dbuser.isActive || dbuser.isDeleted || dbuser.isBlocked) {
        return res.status(401).json({
            ok: false,
            auth_token: false,
            message: "Account not found or inactive."
        });
    }

    // Verify password
    const { salt, password } = dbuser;
    try {
        if (!(await comparePassword(candidatePassword, salt, password))) {
            return res.status(401).json({
                ok: false,
                message: "Invalid credentials.",
                auth_token: false
            });
        }
    } catch (error) {
        console.error("Error hashing input password:", error);
        return res.status(500).json({
            ok: false,
            message: "Internal Server Error",
            auth_token: false
        });
    }

    // Generate JWT tokens
    const payload = {
        userId: dbuser.id.toString(),
        username: dbuser.username
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Calculate expiration dates
    const accessTokenExpiresAt = getTokenExpirationDate(JWT_ACCESS_TOKEN_EXPIRY);
    const refreshTokenExpiresAt = getTokenExpirationDate(JWT_REFRESH_TOKEN_EXPIRY);

    // Store tokens in database
    try {
        await createJwtTokenPair(
            dbuser.id,
            accessToken,
            refreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt
        );

        // Security: Revoke all previous tokens to enforce single session
        await revokeAllJwtTokensForUser(dbuser.id);

        return res.status(200).json({
            ok: true,
            auth_token: {
                accessToken,
                refreshToken,
                accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
                refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
                username: candidateUsername
            },
            message: "Authentication successful!"
        });
    } catch (error) {
        console.error("Error storing JWT tokens:", error);
        return res.status(500).json({
            ok: false,
            message: "Internal Server Error",
            auth_token: false
        });
    }
}

/**
 * POST /auth_refresh - Refresh JWT access token
 * Uses refresh token to get new access token
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
async function authRefreshHandlerPOST(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            ok: false,
            message: "Missing refresh token",
            auth_refresh: false
        });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    if (!decoded) {
        return res.status(401).json({
            ok: false,
            message: "Invalid or expired refresh token",
            auth_refresh: false
        });
    }

    // Check if refresh token exists in database and is not revoked
    const dbToken = await getJwtTokenByRefreshToken(refreshToken);
    if (dbToken.__isNull || dbToken.isRevoked) {
        return res.status(401).json({
            ok: false,
            message: "Refresh token has been revoked",
            auth_refresh: false
        });
    }

    // Check if refresh token is expired
    if (new Date(dbToken.refreshTokenExpiresAt) < new Date()) {
        return res.status(401).json({
            ok: false,
            message: "Refresh token has expired",
            auth_refresh: false
        });
    }

    // Revoke old token pair
    await revokeJwtToken(dbToken.id);

    // Generate new tokens
    const payload = {
        userId: decoded.userId,
        username: decoded.username
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Calculate expiration dates
    const accessTokenExpiresAt = getTokenExpirationDate(JWT_ACCESS_TOKEN_EXPIRY);
    const refreshTokenExpiresAt = getTokenExpirationDate(JWT_REFRESH_TOKEN_EXPIRY);

    // Store new tokens in database
    try {
        await createJwtTokenPair(
            decoded.userId,
            newAccessToken,
            newRefreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt
        );

        return res.status(200).json({
            ok: true,
            auth_refresh: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
                refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString()
            },
            message: "Token refresh successful!"
        });
    } catch (error) {
        console.error("Error refreshing JWT tokens:", error);
        return res.status(500).json({
            ok: false,
            message: "Internal Server Error",
            auth_refresh: false
        });
    }
}

export { setupAuthHandlers, authStore };
