import {
    searchAll as netSearchAll,
    searchUsers as netSearchUsers,
    searchEvents as netSearchEvents,
    searchGroups as netSearchGroups,
} from "../net/search.js";

interface SearchActionResponse {
    ok: boolean;
    message?: string;
    [key: string]: unknown;
}

/**
 * Searches across all entity types (users, events, groups).
 * @param {string} searchTerm - The term to search for.
 * @param {Object} [options] - Optional search configuration parameters.
 * @returns {Promise<SearchActionResponse>} A promise that resolves to a SearchActionResponse containing search results or error message.
 */
async function searchAll(searchTerm: string, options: { [key: string]: unknown } = {}): Promise<SearchActionResponse> {
    return netSearchAll(searchTerm, options);
}

/**
 * Searches for user profiles matching the provided term.
 * @param {string} searchTerm - The term to search for in user profiles.
 * @param {Object} [options] - Optional search configuration parameters.
 * @returns {Promise<SearchActionResponse>} A promise that resolves to a SearchActionResponse containing matching users or error message.
 */
async function searchUsers(searchTerm: string, options: { [key: string]: unknown } = {}): Promise<SearchActionResponse> {
    return netSearchUsers(searchTerm, options);
}

/**
 * Searches for events matching the provided term.
 * @param {string} searchTerm - The term to search for in events.
 * @param {Object} [options] - Optional search configuration parameters.
 * @returns {Promise<SearchActionResponse>} A promise that resolves to a SearchActionResponse containing matching events or error message.
 */
async function searchEvents(searchTerm: string, options: { [key: string]: unknown } = {}): Promise<SearchActionResponse> {
    return netSearchEvents(searchTerm, options);
}

/**
 * Searches for groups using the unified search endpoint.
 * Note: For the legacy group-specific search, use searchGroups from groupActions.
 * @param {string} searchTerm - The term to search for in groups.
 * @param {Object} [options] - Optional search configuration parameters.
 * @returns {Promise<SearchActionResponse>} A promise that resolves to a SearchActionResponse containing matching groups or error message.
 */
async function searchGroupsUnified(searchTerm: string, options: { [key: string]: unknown } = {}): Promise<SearchActionResponse> {
    return netSearchGroups(searchTerm, options);
}

export {
    searchAll,
    searchUsers,
    searchEvents,
    searchGroupsUnified,
};
