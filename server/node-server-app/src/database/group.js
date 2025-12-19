import { GroupModel } from "../models/groupModel.js";
import { pool } from "./db.js";

/**
 * Create a new group
 * @param {object} groupData - The group data
 * @param {string} groupData.userProfileId - The user profile ID of the creator
 * @param {string} groupData.groupName - The name of the group
 * @param {string} groupData.description - The description of the group
 * @param {boolean} groupData.isPublic - Whether the group is public
 * @param {string} groupData.tags - Tags for the group
 * @param {string} groupData.categories - Categories for the group
 * @returns {Promise<GroupModel>}
 */
async function createGroup({ userProfileId, groupName, description = "", isPublic = true, tags = "", categories = "" }) {
    try {
        const query = `
            INSERT INTO public."group" 
            (user_profile_id, group_name, description, is_public, members, tags, categories)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [userProfileId, groupName, description, isPublic, "", tags, categories];
        const result = await pool.query(query, values);
        
        if (result.rowCount === 0) {
            return GroupModel.null();
        }
        
        return GroupModel.fromDatabaseRow(result.rows[0]);
    } catch (error) {
        console.error("Error creating group:", error);
        return GroupModel.null();
    }
}

/**
 * Get a group by ID
 * @param {string} groupId - The group ID
 * @returns {Promise<GroupModel>}
 */
async function getGroupById(groupId) {
    try {
        const query = "SELECT * FROM public.\"group\" WHERE id = $1 AND is_deleted = false";
        const values = [groupId];
        const result = await pool.query(query, values);
        
        if (result.rowCount === 0) {
            return GroupModel.null();
        }
        
        return GroupModel.fromDatabaseRow(result.rows[0]);
    } catch (error) {
        console.error("Error fetching group by ID:", error);
        return GroupModel.null();
    }
}

/**
 * Get groups by user profile ID
 * @param {string} userProfileId - The user profile ID
 * @returns {Promise<GroupModel[]>}
 */
async function getGroupsByUserProfileId(userProfileId) {
    try {
        const query = `
            SELECT * FROM public."group" 
            WHERE user_profile_id = $1 AND is_deleted = false
            ORDER BY created_at DESC
        `;
        const values = [userProfileId];
        const result = await pool.query(query, values);
        
        if (result.rowCount === 0) {
            return [];
        }
        
        return result.rows.map(row => GroupModel.fromDatabaseRow(row));
    } catch (error) {
        console.error("Error fetching groups by user profile ID:", error);
        return [];
    }
}

/**
 * Search groups by name
 * @param {string} searchTerm - The search term
 * @returns {Promise<GroupModel[]>}
 */
async function searchGroupsByName(searchTerm) {
    try {
        const query = `
            SELECT * FROM public."group" 
            WHERE group_name ILIKE $1 
            AND is_public = true 
            AND is_deleted = false 
            AND is_hidden = false
            ORDER BY created_at DESC
        `;
        const values = [`%${searchTerm}%`];
        const result = await pool.query(query, values);
        
        if (result.rowCount === 0) {
            return [];
        }
        
        return result.rows.map(row => GroupModel.fromDatabaseRow(row));
    } catch (error) {
        console.error("Error searching groups by name:", error);
        return [];
    }
}

/**
 * Update a group
 * @param {string} groupId - The group ID
 * @param {object} updates - The fields to update
 * @returns {Promise<GroupModel>}
 */
async function updateGroup(groupId, updates) {
    try {
        const allowedFields = ["group_name", "description", "is_public", "tags", "categories", "is_hidden", "is_archived"];
        const setClause = [];
        const values = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }
        
        if (setClause.length === 0) {
            return getGroupById(groupId);
        }
        
        setClause.push("modified_at = CURRENT_TIMESTAMP");
        values.push(groupId);
        
        const query = `
            UPDATE public."group" 
            SET ${setClause.join(", ")}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        const result = await pool.query(query, values);
        
        if (result.rowCount === 0) {
            return GroupModel.null();
        }
        
        return GroupModel.fromDatabaseRow(result.rows[0]);
    } catch (error) {
        console.error("Error updating group:", error);
        return GroupModel.null();
    }
}

/**
 * Delete a group (soft delete)
 * @param {string} groupId - The group ID
 * @returns {Promise<boolean>}
 */
async function deleteGroup(groupId) {
    try {
        const query = `
            UPDATE public."group" 
            SET is_deleted = true, 
                deleted_at = CURRENT_TIMESTAMP, 
                modified_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `;
        const values = [groupId];
        const result = await pool.query(query, values);
        
        return result.rowCount > 0;
    } catch (error) {
        console.error("Error deleting group:", error);
        return false;
    }
}

/**
 * Hard delete a group (permanent deletion)
 * @param {string} groupId - The group ID
 * @returns {Promise<boolean>}
 */
async function hardDeleteGroup(groupId) {
    try {
        const query = `DELETE FROM public."group" WHERE id = $1`;
        const values = [groupId];
        const result = await pool.query(query, values);
        
        return result.rowCount > 0;
    } catch (error) {
        console.error("Error hard deleting group:", error);
        return false;
    }
}

/**
 * Add a member to a group
 * @param {string} groupId - The group ID
 * @param {string} userProfileId - The user profile ID to add
 * @returns {Promise<GroupModel>}
 */
async function addGroupMember(groupId, userProfileId) {
    try {
        const group = await getGroupById(groupId);
        if (group.__isNull) {
            return GroupModel.null();
        }
        
        let members = [];
        if (group.members) {
            try {
                members = JSON.parse(group.members);
            } catch {
                members = [];
            }
        }
        
        if (!members.includes(userProfileId)) {
            members.push(userProfileId);
        }
        
        const query = `
            UPDATE public."group" 
            SET members = $1, modified_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const values = [JSON.stringify(members), groupId];
        const result = await pool.query(query, values);
        
        if (result.rowCount === 0) {
            return GroupModel.null();
        }
        
        return GroupModel.fromDatabaseRow(result.rows[0]);
    } catch (error) {
        console.error("Error adding group member:", error);
        return GroupModel.null();
    }
}

/**
 * Remove a member from a group
 * @param {string} groupId - The group ID
 * @param {string} userProfileId - The user profile ID to remove
 * @returns {Promise<GroupModel>}
 */
async function removeGroupMember(groupId, userProfileId) {
    try {
        const group = await getGroupById(groupId);
        if (group.__isNull) {
            return GroupModel.null();
        }
        
        let members = [];
        if (group.members) {
            try {
                members = JSON.parse(group.members);
            } catch {
                members = [];
            }
        }
        
        members = members.filter(id => id !== userProfileId);
        
        const query = `
            UPDATE public."group" 
            SET members = $1, modified_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const values = [JSON.stringify(members), groupId];
        const result = await pool.query(query, values);
        
        if (result.rowCount === 0) {
            return GroupModel.null();
        }
        
        return GroupModel.fromDatabaseRow(result.rows[0]);
    } catch (error) {
        console.error("Error removing group member:", error);
        return GroupModel.null();
    }
}

/**
 * Get members of a group
 * @param {string} groupId - The group ID
 * @returns {Promise<string[]>}
 */
async function getGroupMembers(groupId) {
    try {
        const group = await getGroupById(groupId);
        if (group.__isNull) {
            return [];
        }
        
        if (!group.members) {
            return [];
        }
        
        try {
            return JSON.parse(group.members);
        } catch {
            return [];
        }
    } catch (error) {
        console.error("Error getting group members:", error);
        return [];
    }
}

export {
    createGroup,
    getGroupById,
    getGroupsByUserProfileId,
    searchGroupsByName,
    updateGroup,
    deleteGroup,
    hardDeleteGroup,
    addGroupMember,
    removeGroupMember,
    getGroupMembers,
};
