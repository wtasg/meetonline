import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

/**
 * Creates a throttled version of a function to limit API call frequency.
 * @param {Function} func - The function to throttle.
 * @param {number} delay - Minimum time in milliseconds between function executions.
 * @returns {Function} A throttled version of the input function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttle(func: (...args: any[]) => any, delay: number): (...args: any[]) => any {
    let lastCall = 0;
    let timeout: NodeJS.Timeout | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (this: any, ...args: any[]) {
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

interface SearchResults {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    users: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groups: any[];
}

interface SearchResponse {
    ok: boolean;
    message?: string;
    results?: SearchResults;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    users?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groups?: any[];
}

interface SearchOptions {
    types?: string[];
    limit?: number;
    offset?: number;
}

/**
 * Searches across all entity types (users, events, groups).
 * @param {string} searchTerm - The term to search for.
 * @param {SearchOptions} [options] - Optional search configuration including types, limit, and offset.
 * @returns {Promise<SearchResponse>} A promise resolving to a SearchResponse containing search results or error.
 */
async function searchAllInternal(searchTerm: string, options: SearchOptions = {}): Promise<SearchResponse> {
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
    } catch (err: unknown) {
        console.error(err);
        return {
            ok: false,
            message: (err as Error).message,
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
 * Searches for user profiles matching the provided term.
 * @param {string} searchTerm - The term to search for in user profiles.
 * @param {SearchOptions} [options] - Optional search configuration.
 * @returns {Promise<SearchResponse>} A promise resolving to a SearchResponse containing matching users or error.
 */
async function searchUsersInternal(searchTerm: string, options: SearchOptions = {}): Promise<SearchResponse> {
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
 * Searches for events matching the provided term.
 * @param {string} searchTerm - The term to search for in events.
 * @param {SearchOptions} [options] - Optional search configuration.
 * @returns {Promise<SearchResponse>} A promise resolving to a SearchResponse containing matching events or error.
 */
async function searchEventsInternal(searchTerm: string, options: SearchOptions = {}): Promise<SearchResponse> {
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
 * Searches for groups matching the provided term.
 * @param {string} searchTerm - The term to search for in groups.
 * @param {SearchOptions} [options] - Optional search configuration.
 * @returns {Promise<SearchResponse>} A promise resolving to a SearchResponse containing matching groups or error.
 */
async function searchGroupsInternal(searchTerm: string, options: SearchOptions = {}): Promise<SearchResponse> {
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
