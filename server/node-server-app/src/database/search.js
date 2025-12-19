import { pool } from "./db.js";
import { UserProfileModel } from "../models/userProfileModel.js";
import { EventModel } from "../models/eventModel.js";
import { GroupModel } from "../models/groupModel.js";

/**
 * Search user profiles by profile_name or ID
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<UserProfileModel[]>}
 */
async function searchUserProfiles(searchTerm, options = {}) {
    try {
        const { limit = 20, offset = 0 } = options;
        const safeLimit = Math.max(1, Math.min(100, Number(limit)));
        const safeOffset = Math.max(0, Number(offset));

        const query = `
            SELECT * FROM public.user_profile
            WHERE (profile_name ILIKE $1 OR CAST(id AS TEXT) = $2)
            AND profile_name IS NOT NULL
            AND profile_name != ''
            ORDER BY created_at DESC
            LIMIT $3 OFFSET $4
        `;
        const values = [`%${searchTerm}%`, searchTerm, safeLimit, safeOffset];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return [];
        }

        return result.rows.map(row => UserProfileModel.fromDatabaseRow(row));
    } catch (error) {
        console.error("Error searching user profiles:", error);
        return [];
    }
}

/**
 * Search events by title, description, ID, or timing
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<EventModel[]>}
 */
async function searchEvents(searchTerm, options = {}) {
    try {
        const { limit = 20, offset = 0 } = options;
        const safeLimit = Math.max(1, Math.min(100, Number(limit)));
        const safeOffset = Math.max(0, Number(offset));

        const query = `
            SELECT * FROM public.event
            WHERE (
                title ILIKE $1
                OR description ILIKE $1
                OR CAST(id AS TEXT) = $2
                OR tags ILIKE $1
                OR categories ILIKE $1
            )
            AND is_deleted = false
            AND is_hidden = false
            ORDER BY start_at DESC
            LIMIT $3 OFFSET $4
        `;
        const values = [`%${searchTerm}%`, searchTerm, safeLimit, safeOffset];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return [];
        }

        return result.rows.map(row => EventModel.fromDatabaseRow(row));
    } catch (error) {
        console.error("Error searching events:", error);
        return [];
    }
}

/**
 * Search groups by name, description, ID, or tags
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<GroupModel[]>}
 */
async function searchGroups(searchTerm, options = {}) {
    try {
        const { limit = 20, offset = 0 } = options;
        const safeLimit = Math.max(1, Math.min(100, Number(limit)));
        const safeOffset = Math.max(0, Number(offset));

        const query = `
            SELECT * FROM public."group"
            WHERE (
                group_name ILIKE $1
                OR description ILIKE $1
                OR CAST(id AS TEXT) = $2
                OR tags ILIKE $1
                OR categories ILIKE $1
            )
            AND is_public = true
            AND is_deleted = false
            AND is_hidden = false
            ORDER BY created_at DESC
            LIMIT $3 OFFSET $4
        `;
        const values = [`%${searchTerm}%`, searchTerm, safeLimit, safeOffset];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return [];
        }

        return result.rows.map(row => GroupModel.fromDatabaseRow(row));
    } catch (error) {
        console.error("Error searching groups:", error);
        return [];
    }
}

/**
 * Unified search across all entity types
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @param {string[]} options.types - Entity types to search (users, events, groups)
 * @param {number} options.limit - Maximum number of results per type
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<{users: UserProfileModel[], events: EventModel[], groups: GroupModel[]}>}
 */
async function searchAll(searchTerm, options = {}) {
    try {
        const { types = ["users", "events", "groups"], limit = 20, offset = 0 } = options;
        const results = {
            users: [],
            events: [],
            groups: [],
        };

        const searchOptions = { limit, offset };

        if (types.includes("users")) {
            results.users = await searchUserProfiles(searchTerm, searchOptions);
        }

        if (types.includes("events")) {
            results.events = await searchEvents(searchTerm, searchOptions);
        }

        if (types.includes("groups")) {
            results.groups = await searchGroups(searchTerm, searchOptions);
        }

        return results;
    } catch (error) {
        console.error("Error in unified search:", error);
        return {
            users: [],
            events: [],
            groups: [],
        };
    }
}

export {
    searchUserProfiles,
    searchEvents,
    searchGroups,
    searchAll,
};
