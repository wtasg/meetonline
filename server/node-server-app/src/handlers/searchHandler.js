import {
    searchAll,
} from "../database/search.js";
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
 * Setup search handlers
 * @param {Express} app
 */
function setupSearchHandler(app) {
    app.get("/search", searchRateLimiter, hybridAuthMiddleware, searchGET);
}

/**
 * Unified search endpoint
 * Query parameters:
 * - q: search term (required)
 * - types: comma-separated list of types to search (users, events, groups) - optional
 * - limit: max results per type (optional, default 20)
 * - offset: pagination offset (optional, default 0)
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
