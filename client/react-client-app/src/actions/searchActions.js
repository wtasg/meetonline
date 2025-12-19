import {
    searchAll as netSearchAll,
    searchUsers as netSearchUsers,
    searchEvents as netSearchEvents,
    searchGroups as netSearchGroups,
} from "../net/search.js";

/**
 * Search across all entity types
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @returns {Promise<{ok: boolean, message: string, results: {users: array, events: array, groups: array}}>}
 */
async function searchAll(searchTerm, options = {}) {
    return netSearchAll(searchTerm, options);
}

/**
 * Search user profiles
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @returns {Promise<{ok: boolean, message: string, users: array}>}
 */
async function searchUsers(searchTerm, options = {}) {
    return netSearchUsers(searchTerm, options);
}

/**
 * Search events
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @returns {Promise<{ok: boolean, message: string, events: array}>}
 */
async function searchEvents(searchTerm, options = {}) {
    return netSearchEvents(searchTerm, options);
}

/**
 * Search groups (unified search)
 * Note: This uses the unified /search endpoint. For the legacy group-specific search, use searchGroups from groupActions.
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @returns {Promise<{ok: boolean, message: string, groups: array}>}
 */
async function searchGroupsUnified(searchTerm, options = {}) {
    return netSearchGroups(searchTerm, options);
}

export {
    searchAll,
    searchUsers,
    searchEvents,
    searchGroupsUnified,
};
