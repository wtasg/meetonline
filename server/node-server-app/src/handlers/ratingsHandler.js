import {
    createEventRating,
    getEventRatings,
    getEventAverageRating,
    updateEventRatingStatus,
    createGroupRating,
    getGroupRatings,
    getGroupAverageRating,
    updateGroupRatingStatus,
    createOrganizerRating,
    getOrganizerRatings,
    getOrganizerAverageRating,
    updateOrganizerRatingStatus,
    createMemberRating,
    getMemberRatings,
    getMemberAverageRating,
    updateMemberRatingStatus,
} from "../database/ratings.js";
import { getUserAttendanceScore } from "../database/attendance.js";
import { getEventById } from "../database/event.js";
import { getGroupById } from "../database/group.js";
import { getUserProfileByUserId, getUserProfileById } from "../database/user_profile.js";
import { apiRateLimiter } from "../middlewares/rateLimitMiddleware.js";
import { verifyToken as verifyAccessToken } from "../utils/jwt.js";
import { isValidRating, isValidStatus } from "../models/ratingsModel.js";

// 24 hours in milliseconds
const RATING_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Sets up ratings-related route handlers.
 * @param {import('express').Application} app - The Express application instance.
 * @returns {void}
 */
function setupRatingsHandler(app) {
    // Event ratings
    app.post("/api/events/:id/rate", apiRateLimiter, eventRate);
    app.get("/api/events/:id/ratings", apiRateLimiter, eventRatingsGet);

    // Group ratings
    app.post("/api/groups/:id/rate", apiRateLimiter, groupRate);
    app.get("/api/groups/:id/ratings", apiRateLimiter, groupRatingsGet);

    // Profile ratings (organizer/member)
    app.post("/api/profiles/:id/rate", apiRateLimiter, profileRate);
    app.get("/api/profiles/:id/ratings", apiRateLimiter, profileRatingsGet);

    // Rating status management
    app.patch("/api/ratings/:type/:id/status", apiRateLimiter, updateRatingStatus);
}

/**
 * Extract user profile from access token.
 * @param {import('express').Request} req
 * @returns {Promise<{userId: number, profileId: number}|null>}
 */
async function getAuthenticatedUser(req) {
    const accessToken = req.cookies?.access_token;
    if (!accessToken) return null;

    const decoded = verifyAccessToken(accessToken);
    if (!decoded?.userId) return null;

    const profile = await getUserProfileByUserId(decoded.userId);
    if (!profile) return null;

    return { userId: decoded.userId, profileId: profile.id };
}

/**
 * Rate an event.
 */
async function eventRate(req, res) {
    try {
        const eventId = req.params.id;
        const { rating, comment } = req.body;

        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ ok: false, message: "Unauthorized" });
        }

        if (!isValidRating(rating)) {
            return res.status(400).json({ ok: false, message: "Rating must be an integer between -5 and +5" });
        }

        // Get the event
        const event = await getEventById(eventId);
        if (!event) {
            return res.status(404).json({ ok: false, message: "Event not found" });
        }

        // Check if event has ended
        const eventEnd = new Date(event.endAt);
        const now = new Date();
        if (now < eventEnd) {
            return res.status(400).json({ ok: false, message: "Cannot rate event before it ends" });
        }

        // Check if within 24-hour window
        if (now - eventEnd > RATING_WINDOW_MS) {
            return res.status(400).json({ ok: false, message: "Rating window has expired (24 hours after event end)" });
        }

        // Check if user attended (at least one phase)
        const score = await getUserAttendanceScore(eventId, user.profileId);
        if (score === 0) {
            return res.status(400).json({ ok: false, message: "You must mark attendance to rate this event" });
        }

        const ratingRecord = await createEventRating(eventId, user.profileId, rating, comment || "");

        return res.status(201).json({
            ok: true,
            message: "Event rated successfully",
            data: ratingRecord.toClient(),
        });
    } catch (err) {
        console.error("eventRate error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
}

/**
 * Get event ratings.
 */
async function eventRatingsGet(req, res) {
    try {
        const eventId = req.params.id;
        const { status } = req.query;

        const ratings = await getEventRatings(eventId, status || null);
        const average = await getEventAverageRating(eventId);

        return res.status(200).json({
            ok: true,
            data: {
                ratings: ratings.map((r) => r.toClient()),
                average: average.average,
                count: average.count,
            },
        });
    } catch (err) {
        console.error("eventRatingsGet error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
}

/**
 * Rate a group.
 */
async function groupRate(req, res) {
    try {
        const groupId = req.params.id;
        const { rating, comment } = req.body;

        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ ok: false, message: "Unauthorized" });
        }

        if (!isValidRating(rating)) {
            return res.status(400).json({ ok: false, message: "Rating must be an integer between -5 and +5" });
        }

        const group = await getGroupById(groupId);
        if (!group) {
            return res.status(404).json({ ok: false, message: "Group not found" });
        }

        const ratingRecord = await createGroupRating(groupId, user.profileId, rating, comment || "");

        return res.status(201).json({
            ok: true,
            message: "Group rated successfully",
            data: ratingRecord.toClient(),
        });
    } catch (err) {
        console.error("groupRate error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
}

/**
 * Get group ratings.
 */
async function groupRatingsGet(req, res) {
    try {
        const groupId = req.params.id;
        const { status } = req.query;

        const ratings = await getGroupRatings(groupId, status || null);
        const average = await getGroupAverageRating(groupId);

        return res.status(200).json({
            ok: true,
            data: {
                ratings: ratings.map((r) => r.toClient()),
                average: average.average,
                count: average.count,
            },
        });
    } catch (err) {
        console.error("groupRatingsGet error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
}

/**
 * Rate a profile (organizer or member).
 */
async function profileRate(req, res) {
    try {
        const profileId = req.params.id;
        const { rating, comment, contextType, contextId, ratingType } = req.body;

        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ ok: false, message: "Unauthorized" });
        }

        if (!isValidRating(rating)) {
            return res.status(400).json({ ok: false, message: "Rating must be an integer between -5 and +5" });
        }

        if (!["event", "group"].includes(contextType)) {
            return res.status(400).json({ ok: false, message: "Context type must be 'event' or 'group'" });
        }

        if (!["organizer", "member"].includes(ratingType)) {
            return res.status(400).json({ ok: false, message: "Rating type must be 'organizer' or 'member'" });
        }

        // Verify the profile exists
        const targetProfile = await getUserProfileById(profileId);
        if (!targetProfile) {
            return res.status(404).json({ ok: false, message: "Profile not found" });
        }

        // Cannot rate yourself
        if (String(user.profileId) === String(profileId)) {
            return res.status(400).json({ ok: false, message: "Cannot rate yourself" });
        }

        let ratingRecord;
        if (ratingType === "organizer") {
            ratingRecord = await createOrganizerRating(
                profileId,
                user.profileId,
                contextType,
                contextId,
                rating,
                comment || "",
            );
        } else {
            ratingRecord = await createMemberRating(
                profileId,
                user.profileId,
                contextType,
                contextId,
                rating,
                comment || "",
            );
        }

        return res.status(201).json({
            ok: true,
            message: `${ratingType.charAt(0).toUpperCase() + ratingType.slice(1)} rated successfully`,
            data: ratingRecord.toClient(),
        });
    } catch (err) {
        console.error("profileRate error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
}

/**
 * Get profile ratings.
 */
async function profileRatingsGet(req, res) {
    try {
        const profileId = req.params.id;
        const { type, status } = req.query;

        let ratings = [];
        let average = { average: 0, count: 0 };

        if (type === "organizer") {
            ratings = await getOrganizerRatings(profileId, status || null);
            average = await getOrganizerAverageRating(profileId);
        } else if (type === "member") {
            ratings = await getMemberRatings(profileId, status || null);
            average = await getMemberAverageRating(profileId);
        } else {
            // Return both
            const organizerRatings = await getOrganizerRatings(profileId, status || null);
            const memberRatings = await getMemberRatings(profileId, status || null);
            const organizerAvg = await getOrganizerAverageRating(profileId);
            const memberAvg = await getMemberAverageRating(profileId);

            return res.status(200).json({
                ok: true,
                data: {
                    organizer: {
                        ratings: organizerRatings.map((r) => r.toClient()),
                        average: organizerAvg.average,
                        count: organizerAvg.count,
                    },
                    member: {
                        ratings: memberRatings.map((r) => r.toClient()),
                        average: memberAvg.average,
                        count: memberAvg.count,
                    },
                },
            });
        }

        return res.status(200).json({
            ok: true,
            data: {
                ratings: ratings.map((r) => r.toClient()),
                average: average.average,
                count: average.count,
            },
        });
    } catch (err) {
        console.error("profileRatingsGet error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
}

/**
 * Update rating status.
 */
async function updateRatingStatus(req, res) {
    try {
        const { type, id } = req.params;
        const { status } = req.body;

        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ ok: false, message: "Unauthorized" });
        }

        if (!isValidStatus(status)) {
            return res.status(400).json({
                ok: false,
                message: "Status must be one of: unread, accepted, rejected, disputed, invalid",
            });
        }

        let updatedRating = null;
        switch (type) {
            case "event":
                updatedRating = await updateEventRatingStatus(id, status);
                break;
            case "group":
                updatedRating = await updateGroupRatingStatus(id, status);
                break;
            case "organizer":
                updatedRating = await updateOrganizerRatingStatus(id, status);
                break;
            case "member":
                updatedRating = await updateMemberRatingStatus(id, status);
                break;
            default:
                return res.status(400).json({ ok: false, message: "Invalid rating type" });
        }

        if (!updatedRating) {
            return res.status(404).json({ ok: false, message: "Rating not found" });
        }

        return res.status(200).json({
            ok: true,
            message: "Rating status updated",
            data: updatedRating.toClient(),
        });
    } catch (err) {
        console.error("updateRatingStatus error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
}

export { setupRatingsHandler };
