import { pool } from "./db.js";
import { GroupMemberModel } from "../models/groupMemberModel.js";
import { randomUUID } from "crypto";

/**
 * Add a member to a group.
 * @param {number} groupId - The group ID.
 * @param {number} userProfileId - The user profile ID.
 * @param {string} role - Member role: 'admin', 'moderator', 'member'.
 * @returns {Promise<GroupMemberModel>}
 */
async function addMember(groupId, userProfileId, role = "member") {
    const query = `
        INSERT INTO group_members (group_id, user_profile_id, role, joined_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (group_id, user_profile_id) DO UPDATE
        SET is_active = TRUE, role = $3
        RETURNING *
    `;
    const result = await pool.query(query, [groupId, userProfileId, role]);
    return GroupMemberModel.fromDatabaseRow(result.rows[0]);
}

/**
 * Remove a member from a group (soft delete by setting is_active = false).
 * @param {number} groupId - The group ID.
 * @param {number} userProfileId - The user profile ID.
 * @returns {Promise<boolean>}
 */
async function removeMember(groupId, userProfileId) {
    const query = `
        UPDATE group_members
        SET is_active = FALSE
        WHERE group_id = $1 AND user_profile_id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [groupId, userProfileId]);
    return result.rowCount > 0;
}

/**
 * Get all active members of a group.
 * @param {number} groupId - The group ID.
 * @returns {Promise<GroupMemberModel[]>}
 */
async function getMembersByGroupId(groupId) {
    const query = `
        SELECT * FROM group_members
        WHERE group_id = $1 AND is_active = TRUE
        ORDER BY joined_at ASC
    `;
    const result = await pool.query(query, [groupId]);
    return result.rows.map((row) => GroupMemberModel.fromDatabaseRow(row));
}

/**
 * Get groups a user belongs to.
 * @param {number} userProfileId - The user profile ID.
 * @returns {Promise<GroupMemberModel[]>}
 */
async function getGroupsByMemberId(userProfileId) {
    const query = `
        SELECT * FROM group_members
        WHERE user_profile_id = $1 AND is_active = TRUE
        ORDER BY joined_at DESC
    `;
    const result = await pool.query(query, [userProfileId]);
    return result.rows.map((row) => GroupMemberModel.fromDatabaseRow(row));
}

/**
 * Get a specific member record.
 * @param {number} groupId - The group ID.
 * @param {number} userProfileId - The user profile ID.
 * @returns {Promise<GroupMemberModel|null>}
 */
async function getMember(groupId, userProfileId) {
    const query = `
        SELECT * FROM group_members
        WHERE group_id = $1 AND user_profile_id = $2 AND is_active = TRUE
    `;
    const result = await pool.query(query, [groupId, userProfileId]);
    if (result.rows.length === 0) {
        return null;
    }
    return GroupMemberModel.fromDatabaseRow(result.rows[0]);
}

/**
 * Update a member's role.
 * @param {number} groupId - The group ID.
 * @param {number} userProfileId - The user profile ID.
 * @param {string} newRole - The new role.
 * @returns {Promise<GroupMemberModel|null>}
 */
async function updateMemberRole(groupId, userProfileId, newRole) {
    const query = `
        UPDATE group_members
        SET role = $3
        WHERE group_id = $1 AND user_profile_id = $2 AND is_active = TRUE
        RETURNING *
    `;
    const result = await pool.query(query, [groupId, userProfileId, newRole]);
    if (result.rows.length === 0) {
        return null;
    }
    return GroupMemberModel.fromDatabaseRow(result.rows[0]);
}

/**
 * Increment consecutive attendance for a member.
 * Awards regularity token at 5 consecutive.
 * @param {number} groupId - The group ID.
 * @param {number} userProfileId - The user profile ID.
 * @returns {Promise<GroupMemberModel|null>}
 */
async function incrementConsecutiveAttendance(groupId, userProfileId) {
    // First increment the counter
    const incrementQuery = `
        UPDATE group_members
        SET consecutive_attendance = consecutive_attendance + 1
        WHERE group_id = $1 AND user_profile_id = $2 AND is_active = TRUE
        RETURNING *
    `;
    const result = await pool.query(incrementQuery, [groupId, userProfileId]);
    if (result.rows.length === 0) {
        return null;
    }

    const member = GroupMemberModel.fromDatabaseRow(result.rows[0]);

    // Award regularity token at 5 consecutive attendances
    if (member.consecutiveAttendance >= 5 && !member.regularityToken) {
        const token = randomUUID();
        const tokenQuery = `
            UPDATE group_members
            SET regularity_token = $3
            WHERE group_id = $1 AND user_profile_id = $2 AND is_active = TRUE
            RETURNING *
        `;
        const tokenResult = await pool.query(tokenQuery, [groupId, userProfileId, token]);
        return GroupMemberModel.fromDatabaseRow(tokenResult.rows[0]);
    }

    return member;
}

/**
 * Reset consecutive attendance to 0.
 * @param {number} groupId - The group ID.
 * @param {number} userProfileId - The user profile ID.
 * @returns {Promise<GroupMemberModel|null>}
 */
async function resetConsecutiveAttendance(groupId, userProfileId) {
    const query = `
        UPDATE group_members
        SET consecutive_attendance = 0
        WHERE group_id = $1 AND user_profile_id = $2 AND is_active = TRUE
        RETURNING *
    `;
    const result = await pool.query(query, [groupId, userProfileId]);
    if (result.rows.length === 0) {
        return null;
    }
    return GroupMemberModel.fromDatabaseRow(result.rows[0]);
}

/**
 * Set regularity token for a member.
 * @param {number} groupId - The group ID.
 * @param {number} userProfileId - The user profile ID.
 * @param {string} token - The UUID token.
 * @returns {Promise<GroupMemberModel|null>}
 */
async function setRegularityToken(groupId, userProfileId, token) {
    const query = `
        UPDATE group_members
        SET regularity_token = $3
        WHERE group_id = $1 AND user_profile_id = $2 AND is_active = TRUE
        RETURNING *
    `;
    const result = await pool.query(query, [groupId, userProfileId, token]);
    if (result.rows.length === 0) {
        return null;
    }
    return GroupMemberModel.fromDatabaseRow(result.rows[0]);
}

/**
 * Check if user is a member of a group.
 * @param {number} groupId - The group ID.
 * @param {number} userProfileId - The user profile ID.
 * @returns {Promise<boolean>}
 */
async function isMember(groupId, userProfileId) {
    const query = `
        SELECT COUNT(*) as count FROM group_members
        WHERE group_id = $1 AND user_profile_id = $2 AND is_active = TRUE
    `;
    const result = await pool.query(query, [groupId, userProfileId]);
    return parseInt(result.rows[0].count, 10) > 0;
}

export {
    addMember,
    removeMember,
    getMembersByGroupId,
    getGroupsByMemberId,
    getMember,
    updateMemberRole,
    incrementConsecutiveAttendance,
    resetConsecutiveAttendance,
    setRegularityToken,
    isMember,
};
