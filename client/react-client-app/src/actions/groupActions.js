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

async function createGroup({ groupName, description, isPublic, tags, categories }) {
    return netCreateGroup({ groupName, description, isPublic, tags, categories });
}

async function fetchGroup(groupId) {
    return netFetchGroup(groupId);
}

async function fetchGroups() {
    return netFetchGroups();
}

async function updateGroup(groupId, updates) {
    return netUpdateGroup(groupId, updates);
}

async function deleteGroup(groupId) {
    return netDeleteGroup(groupId);
}

async function joinGroup(groupId) {
    return netJoinGroup(groupId);
}

async function leaveGroup(groupId) {
    return netLeaveGroup(groupId);
}

async function searchGroups(searchTerm) {
    return netSearchGroups(searchTerm);
}

async function fetchNewGroups() {
    return netFetchNewGroups();
}

async function fetchUserNewGroups() {
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
