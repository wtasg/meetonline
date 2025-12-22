import { pool } from "./db.js";
import {
    EventRatingModel,
    GroupRatingModel,
    OrganizerRatingModel,
    MemberRatingModel,
    isValidRating,
    isValidStatus,
} from "../models/ratingsModel.js";

// ============================================================
// EVENT RATINGS
// ============================================================

/**
 * Create or update an event rating.
 * @param {number} eventId - The event ID.
 * @param {number} userProfileId - The user profile ID of the rater.
 * @param {number} rating - Rating value (-5 to +5).
 * @param {string} comment - Optional comment.
 * @returns {Promise<EventRatingModel>}
 */
async function createEventRating(eventId, userProfileId, rating, comment = "") {
    if (!isValidRating(rating)) {
        throw new Error("Invalid rating value. Must be integer between -5 and +5.");
    }
    const query = `
        INSERT INTO event_ratings (event_id, user_profile_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (event_id, user_profile_id) DO UPDATE
        SET rating = $3, comment = $4, status = 'unread', created_at = CURRENT_TIMESTAMP
        RETURNING *
    `;
    const result = await pool.query(query, [eventId, userProfileId, rating, comment]);
    return EventRatingModel.fromDatabaseRow(result.rows[0]);
}

/**
 * Get all ratings for an event.
 * @param {number} eventId - The event ID.
 * @param {string} statusFilter - Optional status filter.
 * @returns {Promise<EventRatingModel[]>}
 */
async function getEventRatings(eventId, statusFilter = null) {
    let query = "SELECT * FROM event_ratings WHERE event_id = $1";
    const params = [eventId];
    if (statusFilter && isValidStatus(statusFilter)) {
        query += " AND status = $2";
        params.push(statusFilter);
    }
    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    return result.rows.map((row) => EventRatingModel.fromDatabaseRow(row));
}

/**
 * Get average rating for an event.
 * @param {number} eventId - The event ID.
 * @returns {Promise<{average: number, count: number}>}
 */
async function getEventAverageRating(eventId) {
    const query = `
        SELECT AVG(rating) as average, COUNT(*) as count
        FROM event_ratings
        WHERE event_id = $1 AND status = 'accepted'
    `;
    const result = await pool.query(query, [eventId]);
    return {
        average: parseFloat(result.rows[0].average) || 0,
        count: parseInt(result.rows[0].count, 10) || 0,
    };
}

/**
 * Update event rating status.
 * @param {number} ratingId - The rating ID.
 * @param {string} status - The new status.
 * @returns {Promise<EventRatingModel|null>}
 */
async function updateEventRatingStatus(ratingId, status) {
    if (!isValidStatus(status)) {
        throw new Error("Invalid status value.");
    }
    const query = `
        UPDATE event_ratings SET status = $2 WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(query, [ratingId, status]);
    if (result.rows.length === 0) return null;
    return EventRatingModel.fromDatabaseRow(result.rows[0]);
}

// ============================================================
// GROUP RATINGS
// ============================================================

/**
 * Create or update a group rating.
 * @param {number} groupId - The group ID.
 * @param {number} userProfileId - The user profile ID of the rater.
 * @param {number} rating - Rating value (-5 to +5).
 * @param {string} comment - Optional comment.
 * @returns {Promise<GroupRatingModel>}
 */
async function createGroupRating(groupId, userProfileId, rating, comment = "") {
    if (!isValidRating(rating)) {
        throw new Error("Invalid rating value. Must be integer between -5 and +5.");
    }
    const query = `
        INSERT INTO group_ratings (group_id, user_profile_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (group_id, user_profile_id) DO UPDATE
        SET rating = $3, comment = $4, status = 'unread', created_at = CURRENT_TIMESTAMP
        RETURNING *
    `;
    const result = await pool.query(query, [groupId, userProfileId, rating, comment]);
    return GroupRatingModel.fromDatabaseRow(result.rows[0]);
}

/**
 * Get all ratings for a group.
 * @param {number} groupId - The group ID.
 * @param {string} statusFilter - Optional status filter.
 * @returns {Promise<GroupRatingModel[]>}
 */
async function getGroupRatings(groupId, statusFilter = null) {
    let query = "SELECT * FROM group_ratings WHERE group_id = $1";
    const params = [groupId];
    if (statusFilter && isValidStatus(statusFilter)) {
        query += " AND status = $2";
        params.push(statusFilter);
    }
    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    return result.rows.map((row) => GroupRatingModel.fromDatabaseRow(row));
}

/**
 * Get average rating for a group.
 * @param {number} groupId - The group ID.
 * @returns {Promise<{average: number, count: number}>}
 */
async function getGroupAverageRating(groupId) {
    const query = `
        SELECT AVG(rating) as average, COUNT(*) as count
        FROM group_ratings
        WHERE group_id = $1 AND status = 'accepted'
    `;
    const result = await pool.query(query, [groupId]);
    return {
        average: parseFloat(result.rows[0].average) || 0,
        count: parseInt(result.rows[0].count, 10) || 0,
    };
}

/**
 * Update group rating status.
 * @param {number} ratingId - The rating ID.
 * @param {string} status - The new status.
 * @returns {Promise<GroupRatingModel|null>}
 */
async function updateGroupRatingStatus(ratingId, status) {
    if (!isValidStatus(status)) {
        throw new Error("Invalid status value.");
    }
    const query = `
        UPDATE group_ratings SET status = $2 WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(query, [ratingId, status]);
    if (result.rows.length === 0) return null;
    return GroupRatingModel.fromDatabaseRow(result.rows[0]);
}

// ============================================================
// ORGANIZER RATINGS
// ============================================================

/**
 * Create or update an organizer rating.
 * @param {number} organizerId - The organizer's user profile ID.
 * @param {number} raterId - The rater's user profile ID.
 * @param {string} contextType - 'event' or 'group'.
 * @param {number} contextId - The event or group ID.
 * @param {number} rating - Rating value (-5 to +5).
 * @param {string} comment - Optional comment.
 * @returns {Promise<OrganizerRatingModel>}
 */
async function createOrganizerRating(organizerId, raterId, contextType, contextId, rating, comment = "") {
    if (!isValidRating(rating)) {
        throw new Error("Invalid rating value. Must be integer between -5 and +5.");
    }
    if (!["event", "group"].includes(contextType)) {
        throw new Error("Invalid context type. Must be 'event' or 'group'.");
    }
    const query = `
        INSERT INTO organizer_ratings (organizer_id, rater_id, context_type, context_id, rating, comment)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (organizer_id, rater_id, context_type, context_id) DO UPDATE
        SET rating = $5, comment = $6, status = 'unread', created_at = CURRENT_TIMESTAMP
        RETURNING *
    `;
    const result = await pool.query(query, [organizerId, raterId, contextType, contextId, rating, comment]);
    return OrganizerRatingModel.fromDatabaseRow(result.rows[0]);
}

/**
 * Get all ratings for an organizer.
 * @param {number} organizerId - The organizer's user profile ID.
 * @param {string} statusFilter - Optional status filter.
 * @returns {Promise<OrganizerRatingModel[]>}
 */
async function getOrganizerRatings(organizerId, statusFilter = null) {
    let query = "SELECT * FROM organizer_ratings WHERE organizer_id = $1";
    const params = [organizerId];
    if (statusFilter && isValidStatus(statusFilter)) {
        query += " AND status = $2";
        params.push(statusFilter);
    }
    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    return result.rows.map((row) => OrganizerRatingModel.fromDatabaseRow(row));
}

/**
 * Get average rating for an organizer.
 * @param {number} organizerId - The organizer's user profile ID.
 * @returns {Promise<{average: number, count: number}>}
 */
async function getOrganizerAverageRating(organizerId) {
    const query = `
        SELECT AVG(rating) as average, COUNT(*) as count
        FROM organizer_ratings
        WHERE organizer_id = $1 AND status = 'accepted'
    `;
    const result = await pool.query(query, [organizerId]);
    return {
        average: parseFloat(result.rows[0].average) || 0,
        count: parseInt(result.rows[0].count, 10) || 0,
    };
}

/**
 * Update organizer rating status.
 * @param {number} ratingId - The rating ID.
 * @param {string} status - The new status.
 * @returns {Promise<OrganizerRatingModel|null>}
 */
async function updateOrganizerRatingStatus(ratingId, status) {
    if (!isValidStatus(status)) {
        throw new Error("Invalid status value.");
    }
    const query = `
        UPDATE organizer_ratings SET status = $2 WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(query, [ratingId, status]);
    if (result.rows.length === 0) return null;
    return OrganizerRatingModel.fromDatabaseRow(result.rows[0]);
}

// ============================================================
// MEMBER RATINGS
// ============================================================

/**
 * Create or update a member rating.
 * @param {number} memberId - The member's user profile ID.
 * @param {number} raterId - The rater's (organizer's) user profile ID.
 * @param {string} contextType - 'event' or 'group'.
 * @param {number} contextId - The event or group ID.
 * @param {number} rating - Rating value (-5 to +5).
 * @param {string} comment - Optional comment.
 * @returns {Promise<MemberRatingModel>}
 */
async function createMemberRating(memberId, raterId, contextType, contextId, rating, comment = "") {
    if (!isValidRating(rating)) {
        throw new Error("Invalid rating value. Must be integer between -5 and +5.");
    }
    if (!["event", "group"].includes(contextType)) {
        throw new Error("Invalid context type. Must be 'event' or 'group'.");
    }
    const query = `
        INSERT INTO member_ratings (member_id, rater_id, context_type, context_id, rating, comment)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (member_id, rater_id, context_type, context_id) DO UPDATE
        SET rating = $5, comment = $6, status = 'unread', created_at = CURRENT_TIMESTAMP
        RETURNING *
    `;
    const result = await pool.query(query, [memberId, raterId, contextType, contextId, rating, comment]);
    return MemberRatingModel.fromDatabaseRow(result.rows[0]);
}

/**
 * Get all ratings for a member.
 * @param {number} memberId - The member's user profile ID.
 * @param {string} statusFilter - Optional status filter.
 * @returns {Promise<MemberRatingModel[]>}
 */
async function getMemberRatings(memberId, statusFilter = null) {
    let query = "SELECT * FROM member_ratings WHERE member_id = $1";
    const params = [memberId];
    if (statusFilter && isValidStatus(statusFilter)) {
        query += " AND status = $2";
        params.push(statusFilter);
    }
    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    return result.rows.map((row) => MemberRatingModel.fromDatabaseRow(row));
}

/**
 * Get average rating for a member.
 * @param {number} memberId - The member's user profile ID.
 * @returns {Promise<{average: number, count: number}>}
 */
async function getMemberAverageRating(memberId) {
    const query = `
        SELECT AVG(rating) as average, COUNT(*) as count
        FROM member_ratings
        WHERE member_id = $1 AND status = 'accepted'
    `;
    const result = await pool.query(query, [memberId]);
    return {
        average: parseFloat(result.rows[0].average) || 0,
        count: parseInt(result.rows[0].count, 10) || 0,
    };
}

/**
 * Update member rating status.
 * @param {number} ratingId - The rating ID.
 * @param {string} status - The new status.
 * @returns {Promise<MemberRatingModel|null>}
 */
async function updateMemberRatingStatus(ratingId, status) {
    if (!isValidStatus(status)) {
        throw new Error("Invalid status value.");
    }
    const query = `
        UPDATE member_ratings SET status = $2 WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(query, [ratingId, status]);
    if (result.rows.length === 0) return null;
    return MemberRatingModel.fromDatabaseRow(result.rows[0]);
}

export {
    // Event ratings
    createEventRating,
    getEventRatings,
    getEventAverageRating,
    updateEventRatingStatus,
    // Group ratings
    createGroupRating,
    getGroupRatings,
    getGroupAverageRating,
    updateGroupRatingStatus,
    // Organizer ratings
    createOrganizerRating,
    getOrganizerRatings,
    getOrganizerAverageRating,
    updateOrganizerRatingStatus,
    // Member ratings
    createMemberRating,
    getMemberRatings,
    getMemberAverageRating,
    updateMemberRatingStatus,
};
