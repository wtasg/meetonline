import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

/**
 * Create a new group
 * @param {object} groupData
 * @param {string} groupData.groupName - The name of the group
 * @param {string} groupData.description - The description of the group
 * @param {boolean} groupData.isPublic - Whether the group is public
 * @param {string} groupData.tags - Tags for the group
 * @param {string} groupData.categories - Categories for the group
 * @returns {Promise<{ok: boolean, message: string, group: object}>}
 */
async function createGroup({ groupName, description, isPublic, tags, categories }) {
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
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, group: false };
    }
}

/**
 * Fetch a group by ID
 * @param {string} groupId - The group ID
 * @returns {Promise<{ok: boolean, message: string, group: object}>}
 */
async function fetchGroup(groupId) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP}/${groupId}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, group: false };
    }
}

/**
 * Fetch all groups for the current user
 * @returns {Promise<{ok: boolean, message: string, groups: array}>}
 */
async function fetchGroups() {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUPS}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, groups: [] };
    }
}

/**
 * Update a group
 * @param {string} groupId - The group ID
 * @param {object} updates - The fields to update
 * @returns {Promise<{ok: boolean, message: string, group: object}>}
 */
async function updateGroup(groupId, updates) {
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
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, group: false };
    }
}

/**
 * Delete a group
 * @param {string} groupId - The group ID
 * @returns {Promise<{ok: boolean, message: string}>}
 */
async function deleteGroup(groupId) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP}/${groupId}`, {
            credentials: "include",
            method: "DELETE",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message };
    }
}

/**
 * Join a group
 * @param {string} groupId - The group ID
 * @returns {Promise<{ok: boolean, message: string, group: object}>}
 */
async function joinGroup(groupId) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP}/${groupId}/join`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, group: false };
    }
}

/**
 * Leave a group
 * @param {string} groupId - The group ID
 * @returns {Promise<{ok: boolean, message: string, group: object}>}
 */
async function leaveGroup(groupId) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP}/${groupId}/leave`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, group: false };
    }
}

/**
 * Search groups by name
 * @param {string} searchTerm - The search term
 * @returns {Promise<{ok: boolean, message: string, groups: array}>}
 */
async function searchGroups(searchTerm) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.GROUP_SEARCH}?q=${encodeURIComponent(searchTerm)}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, groups: [] };
    }
}

/**
 * Fetch latest groups (public endpoint - minimal info)
 * @returns {Promise<{ok: boolean, message: string, new_groups: array}>}
 */
async function fetchNewGroups() {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/new_groups`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, new_groups: [] };
    }
}

/**
 * Fetch latest groups for authenticated user (full details)
 * @returns {Promise<{ok: boolean, message: string, user_new_groups: array}>}
 */
async function fetchUserNewGroups() {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/user_new_groups`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, user_new_groups: [] };
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
