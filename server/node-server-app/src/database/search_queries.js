import { pool } from "./db.js";

/**
 * Log a search query to the database
 * @param {string} userId - The user account ID
 * @param {string} searchTerm - The search term
 * @param {string[]} searchTypes - Array of search types (users, events, groups)
 * @param {number} resultsCount - Total number of results returned
 * @returns {Promise<boolean>}
 */
async function logSearchQuery(userId, searchTerm, searchTypes, resultsCount) {
    try {
        const query = `
            INSERT INTO public.search_queries
            (user_id, search_term, search_types, results_count)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        const values = [
            userId,
            searchTerm,
            searchTypes.join(","),
            resultsCount
        ];
        const result = await pool.query(query, values);
        return result.rowCount > 0;
    } catch (error) {
        console.error("Error logging search query:", error);
        return false;
    }
}

/**
 * Get search query statistics for a user
 * @param {string} userId - The user account ID
 * @param {object} options - Query options
 * @param {number} options.limit - Maximum number of results
 * @returns {Promise<Array>}
 */
async function getUserSearchHistory(userId, options = {}) {
    try {
        const { limit = 50 } = options;
        const safeLimit = Math.max(1, Math.min(100, Number(limit)));

        const query = `
            SELECT 
                id,
                search_term,
                search_types,
                results_count,
                created_at
            FROM public.search_queries
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `;
        const values = [userId, safeLimit];
        const result = await pool.query(query, values);

        return result.rows.map(row => ({
            id: String(row.id),
            searchTerm: row.search_term,
            searchTypes: row.search_types ? row.search_types.split(",") : [],
            resultsCount: row.results_count,
            createdAt: row.created_at,
        }));
    } catch (error) {
        console.error("Error fetching user search history:", error);
        return [];
    }
}

/**
 * Get popular search terms
 * @param {object} options - Query options
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.days - Number of days to look back
 * @returns {Promise<Array>}
 */
async function getPopularSearchTerms(options = {}) {
    try {
        const { limit = 10, days = 7 } = options;
        const safeLimit = Math.max(1, Math.min(50, Number(limit)));
        const safeDays = Math.max(1, Math.min(30, Number(days)));

        const query = `
            SELECT 
                search_term,
                COUNT(*) as search_count,
                SUM(results_count) as total_results
            FROM public.search_queries
            WHERE created_at >= NOW() - ($2 || ' days')::INTERVAL
            GROUP BY search_term
            ORDER BY search_count DESC
            LIMIT $1
        `;
        const values = [safeLimit, String(safeDays)];
        const result = await pool.query(query, values);

        return result.rows.map(row => ({
            searchTerm: row.search_term,
            searchCount: parseInt(row.search_count, 10),
            totalResults: parseInt(row.total_results, 10),
        }));
    } catch (error) {
        console.error("Error fetching popular search terms:", error);
        return [];
    }
}

export {
    logSearchQuery,
    getUserSearchHistory,
    getPopularSearchTerms,
};
