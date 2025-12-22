import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

interface GroupData {
    groupName: string;
    description: string;
    isPublic: boolean;
    tags: string;
    categories: string;
}

interface GroupResponse {
    ok: boolean;
    message?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    group?: any | false; // Define Group interface eventually
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groups?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new_groups?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user_new_groups?: any[];
}

/**
 * Creates a new group on the server.
 * @param {GroupData} groupData - The group data containing name, description, and settings.
 * @returns {Promise<GroupResponse>} A promise resolving to a GroupResponse containing the created group or error.
 */
async function createGroup({ groupName, description, isPublic, tags, categories }: GroupData): Promise<GroupResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP}`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ groupName, description, isPublic, tags, categories }),
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, group: false };
    }
}

/**
 * Fetches a single group by its unique identifier.
 * @param {string} groupId - The unique identifier of the group to fetch.
 * @returns {Promise<GroupResponse>} A promise resolving to a GroupResponse containing the group data or error.
 */
async function fetchGroup(groupId: string): Promise<GroupResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP}/${groupId}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, group: false };
    }
}

/**
 * Fetches all groups accessible to the current authenticated user.
 * @returns {Promise<GroupResponse>} A promise resolving to a GroupResponse containing the groups list or error.
 */
async function fetchGroups(): Promise<GroupResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUPS}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, groups: [] };
    }
}

/**
 * Updates an existing group with the provided changes.
 * @param {string} groupId - The unique identifier of the group to update.
 * @param {Partial<GroupData>} updates - The partial group data containing fields to update.
 * @returns {Promise<GroupResponse>} A promise resolving to a GroupResponse indicating success or failure.
 */
async function updateGroup(groupId: string, updates: Partial<GroupData>): Promise<GroupResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP}/${groupId}`, {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
        });
        const json = await response.json();
        if (!json.ok) {
            console.error(json);
        }
        return json;
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, group: false };
    }
}

/**
 * Deletes a group by its unique identifier.
 * @param {string} groupId - The unique identifier of the group to delete.
 * @returns {Promise<GroupResponse>} A promise resolving to a GroupResponse indicating success or failure.
 */
async function deleteGroup(groupId: string): Promise<GroupResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP}/${groupId}`, {
            credentials: "include",
            method: "DELETE",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

/**
 * Adds the current user as a member of the specified group.
 * @param {string} groupId - The unique identifier of the group to join.
 * @returns {Promise<GroupResponse>} A promise resolving to a GroupResponse indicating success or failure.
 */
async function joinGroup(groupId: string): Promise<GroupResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP}/${groupId}/join`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, group: false };
    }
}

/**
 * Removes the current user from the specified group.
 * @param {string} groupId - The unique identifier of the group to leave.
 * @returns {Promise<GroupResponse>} A promise resolving to a GroupResponse indicating success or failure.
 */
async function leaveGroup(groupId: string): Promise<GroupResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP}/${groupId}/leave`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, group: false };
    }
}

/**
 * Searches for groups matching the provided search term.
 * @param {string} searchTerm - The term to search for in group names/descriptions.
 * @returns {Promise<GroupResponse>} A promise resolving to a GroupResponse containing matching groups or error.
 */
async function searchGroups(searchTerm: string): Promise<GroupResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP_SEARCH}?q=${encodeURIComponent(searchTerm)}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, groups: [] };
    }
}

/**
 * Fetches the most recently created groups (public endpoint).
 * Returns minimal information suitable for public display.
 * @returns {Promise<GroupResponse>} A promise resolving to a GroupResponse containing the new groups list or error.
 */
async function fetchNewGroups(): Promise<GroupResponse> {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/new_groups`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, new_groups: [] };
    }
}

/**
 * Fetches the most recently created groups for the authenticated user.
 * Returns full group details including private information.
 * @returns {Promise<GroupResponse>} A promise resolving to a GroupResponse containing the user's new groups or error.
 */
async function fetchUserNewGroups(): Promise<GroupResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/user_new_groups`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, user_new_groups: [] };
    }
}

export {
    createGroup,
    fetchGroup,
    fetchGroups,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    searchGroups,
    fetchNewGroups,
    fetchUserNewGroups,
};
