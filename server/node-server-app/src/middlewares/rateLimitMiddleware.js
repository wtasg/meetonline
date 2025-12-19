import rateLimit from "express-rate-limit";

/**
 * Rate limiting middleware factory for different endpoint types
 * Configurable via environment variables for containerization
 */

// Default configuration
const DEFAULT_AUTH_WINDOW_MS = 1 * 60 * 1000; // 1 minute
const DEFAULT_AUTH_MAX_REQUESTS = 12; // requests per window
const DEFAULT_API_WINDOW_MS = 1 * 60 * 1000; // 1 minute
const DEFAULT_API_MAX_REQUESTS = 60; // requests per window
const DEFAULT_UPLOAD_WINDOW_MS = 1 * 60 * 1000; // 1 minute
const DEFAULT_UPLOAD_MAX_REQUESTS = 10; // requests per window

/**
 * Get rate limit configuration from environment or use defaults
 */
function getRateLimitConfig() {
    const parseEnvInt = (envValue, defaultValue) => {
        const parsed = parseInt(envValue, 10);
        return !isNaN(parsed) && parsed > 0 ? parsed : defaultValue;
    };

    return {
        auth: {
            windowMs: parseEnvInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, DEFAULT_AUTH_WINDOW_MS),
            max: parseEnvInt(process.env.RATE_LIMIT_AUTH_MAX, DEFAULT_AUTH_MAX_REQUESTS)
        },
        api: {
            windowMs: parseEnvInt(process.env.RATE_LIMIT_API_WINDOW_MS, DEFAULT_API_WINDOW_MS),
            max: parseEnvInt(process.env.RATE_LIMIT_API_MAX, DEFAULT_API_MAX_REQUESTS)
        },
        upload: {
            windowMs: parseEnvInt(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS, DEFAULT_UPLOAD_WINDOW_MS),
            max: parseEnvInt(process.env.RATE_LIMIT_UPLOAD_MAX, DEFAULT_UPLOAD_MAX_REQUESTS)
        }
    };
}

/**
 * Standard error handler for rate limit exceeded
 * Returns JSON with retry-after header
 * Does not expose internal implementation details
 */
function rateLimitHandler(req, res) {
    res.status(429).json({
        ok: false,
        message: "Too many requests, please try again later."
    });
}

/**
 * Rate limiter for authentication endpoints (login, signup, token refresh)
 * Higher security with lower limits to prevent brute-force attacks
 */
function createAuthRateLimiter() {
    const config = getRateLimitConfig();
    return rateLimit({
        windowMs: config.auth.windowMs,
        max: config.auth.max,
        standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
        legacyHeaders: false, // Disable `X-RateLimit-*` headers
        handler: rateLimitHandler,
        skipSuccessfulRequests: false,
        skipFailedRequests: false
    });
}

/**
 * Rate limiter for general API endpoints
 * More permissive for normal API usage
 */
function createApiRateLimiter() {
    const config = getRateLimitConfig();
    return rateLimit({
        windowMs: config.api.windowMs,
        max: config.api.max,
        standardHeaders: true,
        legacyHeaders: false,
        handler: rateLimitHandler,
        skipSuccessfulRequests: false,
        skipFailedRequests: false
    });
}

/**
 * Rate limiter for upload endpoints
 * Stricter limits to prevent abuse of file upload
 */
function createUploadRateLimiter() {
    const config = getRateLimitConfig();
    return rateLimit({
        windowMs: config.upload.windowMs,
        max: config.upload.max,
        standardHeaders: true,
        legacyHeaders: false,
        handler: rateLimitHandler,
        skipSuccessfulRequests: false,
        skipFailedRequests: false
    });
}

// Export pre-configured rate limiters
const authRateLimiter = createAuthRateLimiter();
const apiRateLimiter = createApiRateLimiter();
const uploadRateLimiter = createUploadRateLimiter();

export {
    authRateLimiter,
    apiRateLimiter,
    uploadRateLimiter,
    createAuthRateLimiter,
    createApiRateLimiter,
    createUploadRateLimiter,
    getRateLimitConfig
};
