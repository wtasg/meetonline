import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

export interface RatingData {
    id: number;
    rating: number;
    status: "unread" | "accepted" | "rejected" | "disputed" | "invalid";
    comment: string;
    createdAt: string;
    eventId?: number;
    groupId?: number;
    userProfileId?: number;
    organizerId?: number;
    raterId?: number;
    memberId?: number;
    contextType?: "event" | "group";
    contextId?: number;
}

export interface RatingsResponse {
    ok: boolean;
    message?: string;
    data?: RatingData | {
        ratings: RatingData[];
        average: number;
        count: number;
    } | {
        organizer: { ratings: RatingData[]; average: number; count: number };
        member: { ratings: RatingData[]; average: number; count: number };
    };
}

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
    try {
        const response = await authenticatedFetch(
            `${CONF.HTTPS_SERVER}/api/events/${eventId}/rate`,
            {
                credentials: "include",
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ rating, comment: comment || "" }),
            }
        );
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
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
    try {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        const queryString = params.toString();
        const url = `${CONF.HTTPS_SERVER}/api/events/${eventId}/ratings${queryString ? `?${queryString}` : ""}`;

        const response = await authenticatedFetch(url, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
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
    try {
        const response = await authenticatedFetch(
            `${CONF.HTTPS_SERVER}/api/groups/${groupId}/rate`,
            {
                credentials: "include",
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ rating, comment: comment || "" }),
            }
        );
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
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
    try {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        const queryString = params.toString();
        const url = `${CONF.HTTPS_SERVER}/api/groups/${groupId}/ratings${queryString ? `?${queryString}` : ""}`;

        const response = await authenticatedFetch(url, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

/**
 * Rate a profile (organizer or member).
 * @param profileId - The profile ID.
 * @param rating - Rating value (-5 to +5).
 * @param contextType - 'event' or 'group'.
 * @param contextId - The event or group ID.
 * @param ratingType - 'organizer' or 'member'.
 * @param comment - Optional comment.
 */
async function rateProfile(
    profileId: string,
    rating: number,
    contextType: "event" | "group",
    contextId: number,
    ratingType: "organizer" | "member",
    comment?: string
): Promise<RatingsResponse> {
    try {
        const response = await authenticatedFetch(
            `${CONF.HTTPS_SERVER}/api/profiles/${profileId}/rate`,
            {
                credentials: "include",
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rating,
                    contextType,
                    contextId,
                    ratingType,
                    comment: comment || "",
                }),
            }
        );
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
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
    try {
        const params = new URLSearchParams();
        if (type) params.append("type", type);
        if (status) params.append("status", status);
        const queryString = params.toString();
        const url = `${CONF.HTTPS_SERVER}/api/profiles/${profileId}/ratings${queryString ? `?${queryString}` : ""}`;

        const response = await authenticatedFetch(url, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
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
    try {
        const response = await authenticatedFetch(
            `${CONF.HTTPS_SERVER}/api/ratings/${ratingType}/${ratingId}/status`,
            {
                credentials: "include",
                method: "PATCH",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            }
        );
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

export {
    rateEvent,
    getEventRatings,
    rateGroup,
    getGroupRatings,
    rateProfile,
    getProfileRatings,
    updateRatingStatus,
};
