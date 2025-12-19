import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

/**
 * Throttle function to limit API calls
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, delay) {
    let lastCall = 0;
    let timeout = null;

    return function (...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;

        // Clear any pending timeout
        if (timeout) {
            clearTimeout(timeout);
        }

        if (timeSinceLastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        } else {
            // Schedule the call for later
            return new Promise((resolve) => {
                timeout = setTimeout(() => {
                    lastCall = Date.now();
                    resolve(func.apply(this, args));
                }, delay - timeSinceLastCall);
            });
        }
    };
}

/**
 * Search across all entity types
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @param {string[]} options.types - Entity types to search (users, events, groups)
 * @param {number} options.limit - Maximum number of results per type
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<{ok: boolean, message: string, results: {users: array, events: array, groups: array}}>}
 */
async function searchAllInternal(searchTerm, options = {}) {
    try {
        const { types = ["users", "events", "groups"], limit = 20, offset = 0 } = options;

        // Build query string
        const params = new URLSearchParams();
        params.append("q", searchTerm);
        params.append("types", types.join(","));
        params.append("limit", limit.toString());
        params.append("offset", offset.toString());

        const response = await authenticatedFetch(
            `${CONF.HTTPS_SERVER}/${CONF.URLS.SEARCH}?${params.toString()}`,
            {
                credentials: "include",
                method: "GET",
                headers: {
                    "Accept": "application/json",
                }
            }
        );
        return response.json();
    } catch (err) {
        console.error(err);
        return {
            ok: false,
            message: err.message,
            results: {
                users: [],
                events: [],
                groups: [],
            }
        };
    }
}

// Create throttled version (500ms delay)
const searchAll = throttle(searchAllInternal, 500);

/**
 * Search user profiles
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @returns {Promise<{ok: boolean, message: string, users: array}>}
 */
async function searchUsersInternal(searchTerm, options = {}) {
    const result = await searchAllInternal(searchTerm, {
        ...options,
        types: ["users"]
    });
    return {
        ok: result.ok,
        message: result.message,
        users: result.results?.users || []
    };
}

const searchUsers = throttle(searchUsersInternal, 500);

/**
 * Search events
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @returns {Promise<{ok: boolean, message: string, events: array}>}
 */
async function searchEventsInternal(searchTerm, options = {}) {
    const result = await searchAllInternal(searchTerm, {
        ...options,
        types: ["events"]
    });
    return {
        ok: result.ok,
        message: result.message,
        events: result.results?.events || []
    };
}

const searchEvents = throttle(searchEventsInternal, 500);

/**
 * Search groups
 * @param {string} searchTerm - The search term
 * @param {object} options - Search options
 * @returns {Promise<{ok: boolean, message: string, groups: array}>}
 */
async function searchGroupsInternal(searchTerm, options = {}) {
    const result = await searchAllInternal(searchTerm, {
        ...options,
        types: ["groups"]
    });
    return {
        ok: result.ok,
        message: result.message,
        groups: result.results?.groups || []
    };
}

const searchGroupsNet = throttle(searchGroupsInternal, 500);

export {
    searchAll,
    searchUsers,
    searchEvents,
    searchGroupsNet as searchGroups,
};
