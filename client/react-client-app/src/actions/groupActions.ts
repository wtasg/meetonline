import {
    createGroup as netCreateGroup,
    fetchGroup as netFetchGroup,
    fetchGroups as netFetchGroups,
    updateGroup as netUpdateGroup,
    deleteGroup as netDeleteGroup,
    joinGroup as netJoinGroup,
    leaveGroup as netLeaveGroup,
    searchGroups as netSearchGroups,
    fetchNewGroups as netFetchNewGroups,
    fetchUserNewGroups as netFetchUserNewGroups,
} from "../net/group.js";

interface GroupActionResponse {
    ok: boolean;
    message?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * Creates a new group with the provided data.
 * @param {Object} groupData - The group data to create the group with.
 * @returns {Promise<GroupActionResponse>} A promise that resolves to a GroupActionResponse containing the created group or error message.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createGroup(groupData: any): Promise<GroupActionResponse> {
    return netCreateGroup(groupData);
}

/**
 * Fetches a single group by its unique identifier.
 * @param {string} groupId - The unique identifier of the group to fetch.
 * @returns {Promise<GroupActionResponse>} A promise that resolves to a GroupActionResponse containing the group data or error message.
 */
async function fetchGroup(groupId: string): Promise<GroupActionResponse> {
    return netFetchGroup(groupId);
}

/**
 * Fetches all groups accessible to the current user.
 * @returns {Promise<GroupActionResponse>} A promise that resolves to a GroupActionResponse containing the groups list or error message.
 */
async function fetchGroups(): Promise<GroupActionResponse> {
    return netFetchGroups();
}

/**
 * Updates an existing group with the provided changes.
 * @param {string} groupId - The unique identifier of the group to update.
 * @param {Object} updates - The partial group data containing fields to update.
 * @returns {Promise<GroupActionResponse>} A promise that resolves to a GroupActionResponse indicating success or failure.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateGroup(groupId: string, updates: any): Promise<GroupActionResponse> {
    return netUpdateGroup(groupId, updates);
}

/**
 * Deletes a group by its unique identifier.
 * @param {string} groupId - The unique identifier of the group to delete.
 * @returns {Promise<GroupActionResponse>} A promise that resolves to a GroupActionResponse indicating success or failure.
 */
async function deleteGroup(groupId: string): Promise<GroupActionResponse> {
    return netDeleteGroup(groupId);
}

/**
 * Adds the current user as a member of the specified group.
 * @param {string} groupId - The unique identifier of the group to join.
 * @returns {Promise<GroupActionResponse>} A promise that resolves to a GroupActionResponse indicating success or failure.
 */
async function joinGroup(groupId: string): Promise<GroupActionResponse> {
    return netJoinGroup(groupId);
}

/**
 * Removes the current user from the specified group.
 * @param {string} groupId - The unique identifier of the group to leave.
 * @returns {Promise<GroupActionResponse>} A promise that resolves to a GroupActionResponse indicating success or failure.
 */
async function leaveGroup(groupId: string): Promise<GroupActionResponse> {
    return netLeaveGroup(groupId);
}

/**
 * Searches for groups matching the provided search term.
 * @param {string} searchTerm - The term to search for in group names/descriptions.
 * @returns {Promise<GroupActionResponse>} A promise that resolves to a GroupActionResponse containing matching groups or error message.
 */
async function searchGroups(searchTerm: string): Promise<GroupActionResponse> {
    return netSearchGroups(searchTerm);
}

/**
 * Fetches the most recently created groups across all users.
 * @returns {Promise<GroupActionResponse>} A promise that resolves to a GroupActionResponse containing the new groups list or error message.
 */
async function fetchNewGroups(): Promise<GroupActionResponse> {
    return netFetchNewGroups();
}

/**
 * Fetches the most recently created groups for the current authenticated user.
 * @returns {Promise<GroupActionResponse>} A promise that resolves to a GroupActionResponse containing the user's new groups or error message.
 */
async function fetchUserNewGroups(): Promise<GroupActionResponse> {
    return netFetchUserNewGroups();
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
