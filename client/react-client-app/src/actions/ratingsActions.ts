import {
    rateEvent as netRateEvent,
    getEventRatings as netGetEventRatings,
    rateGroup as netRateGroup,
    getGroupRatings as netGetGroupRatings,
    rateProfile as netRateProfile,
    getProfileRatings as netGetProfileRatings,
    updateRatingStatus as netUpdateRatingStatus,
    RatingsResponse,
} from "../net/ratings.js";

/**
 * Rate an event.
 * @param eventId - The event ID.
 * @param rating - Rating value (-5 to +5).
 * @param comment - Optional comment.
 */
async function rateEvent(
    eventId: string,
    rating: number,
    comment?: string
): Promise<RatingsResponse> {
    return netRateEvent(eventId, rating, comment);
}

/**
 * Get ratings for an event.
 * @param eventId - The event ID.
 * @param status - Optional status filter.
 */
async function getEventRatings(
    eventId: string,
    status?: string
): Promise<RatingsResponse> {
    return netGetEventRatings(eventId, status);
}

/**
 * Rate a group.
 * @param groupId - The group ID.
 * @param rating - Rating value (-5 to +5).
 * @param comment - Optional comment.
 */
async function rateGroup(
    groupId: string,
    rating: number,
    comment?: string
): Promise<RatingsResponse> {
    return netRateGroup(groupId, rating, comment);
}

/**
 * Get ratings for a group.
 * @param groupId - The group ID.
 * @param status - Optional status filter.
 */
async function getGroupRatings(
    groupId: string,
    status?: string
): Promise<RatingsResponse> {
    return netGetGroupRatings(groupId, status);
}

/**
 * Rate an organizer (as a member).
 * @param organizerId - The organizer's profile ID.
 * @param rating - Rating value (-5 to +5).
 * @param contextType - 'event' or 'group'.
 * @param contextId - The event or group ID.
 * @param comment - Optional comment.
 */
async function rateOrganizer(
    organizerId: string,
    rating: number,
    contextType: "event" | "group",
    contextId: number,
    comment?: string
): Promise<RatingsResponse> {
    return netRateProfile(organizerId, rating, contextType, contextId, "organizer", comment);
}

/**
 * Rate a member (as an organizer).
 * @param memberId - The member's profile ID.
 * @param rating - Rating value (-5 to +5).
 * @param contextType - 'event' or 'group'.
 * @param contextId - The event or group ID.
 * @param comment - Optional comment.
 */
async function rateMember(
    memberId: string,
    rating: number,
    contextType: "event" | "group",
    contextId: number,
    comment?: string
): Promise<RatingsResponse> {
    return netRateProfile(memberId, rating, contextType, contextId, "member", comment);
}

/**
 * Get ratings for a profile.
 * @param profileId - The profile ID.
 * @param type - Optional: 'organizer' or 'member' to filter.
 * @param status - Optional status filter.
 */
async function getProfileRatings(
    profileId: string,
    type?: "organizer" | "member",
    status?: string
): Promise<RatingsResponse> {
    return netGetProfileRatings(profileId, type, status);
}

/**
 * Update a rating's status.
 * @param ratingType - 'event', 'group', 'organizer', or 'member'.
 * @param ratingId - The rating ID.
 * @param status - The new status.
 */
async function updateRatingStatus(
    ratingType: "event" | "group" | "organizer" | "member",
    ratingId: number,
    status: "unread" | "accepted" | "rejected" | "disputed" | "invalid"
): Promise<RatingsResponse> {
    return netUpdateRatingStatus(ratingType, ratingId, status);
}

export {
    rateEvent,
    getEventRatings,
    rateGroup,
    getGroupRatings,
    rateOrganizer,
    rateMember,
    getProfileRatings,
    updateRatingStatus,
};
