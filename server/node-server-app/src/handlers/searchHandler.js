import {
    searchAll,
} from "../database/search.js";
import { logSearchQuery } from "../database/search_queries.js";
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";
import rateLimit from "express-rate-limit";

/**
 * Rate limiter for search endpoints
 * Prevents abuse of search functionality
 */
const searchRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 30, // Limit each IP to 30 requests per minute
    message: { ok: false, message: "Too many search requests, please try again later." }
});

/**
 * Sets up search-related route handlers.
 * @param {import('express').Application} app - The Express application instance.
 * @returns {void}
 */
function setupSearchHandler(app) {
    app.get("/search", searchRateLimiter, hybridAuthMiddleware, searchGET);
}

/**
 * GET /search - Unified search endpoint.
 * Searches across users, events, and groups.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
async function searchGET(req, res) {
    try {
        const { q, types, limit, offset } = req.query;

        // Validate search term
        if (!q || !q.trim()) {
            return res.status(400).json({
                ok: false,
                results: {
                    users: [],
                    events: [],
                    groups: [],
                },
                message: "Search term is required."
            });
        }

        // Parse types parameter
        let typesArray = ["users", "events", "groups"];
        if (types) {
            typesArray = types.split(",").map(t => t.trim().toLowerCase());
            // Validate types
            const validTypes = ["users", "events", "groups"];
            typesArray = typesArray.filter(t => validTypes.includes(t));
            if (typesArray.length === 0) {
                typesArray = validTypes;
            }
        }

        // Perform search
        const results = await searchAll(q.trim(), {
            types: typesArray,
            limit: limit ? parseInt(limit, 10) : 20,
            offset: offset ? parseInt(offset, 10) : 0,
        });

        // Convert to client format
        const clientResults = {
            users: results.users.map(u => u.toClient()),
            events: results.events.map(e => e.toClient()),
            groups: results.groups.map(g => g.toClient()),
        };

        // Calculate total results count
        const totalResults = clientResults.users.length +
            clientResults.events.length +
            clientResults.groups.length;

        // Log search query (async, don't wait for completion)
        if (req.user?.userId) {
            logSearchQuery(
                req.user.userId,
                q.trim(),
                typesArray,
                totalResults
            ).catch(err => console.error("Failed to log search query:", err));
        }

        return res.status(200).json({
            ok: true,
            results: clientResults,
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            results: {
                users: [],
                events: [],
                groups: [],
            },
            message: "CAUGHT ERROR."
        });
    }
}

export { setupSearchHandler };
