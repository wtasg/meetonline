import {
    createAttendance,
    getAttendanceByEventId,
    markPresent,
    getUserAttendanceScore,
} from "../database/attendance.js";
import { getEventById } from "../database/event.js";
import { getUserProfileByUserId } from "../database/user_profile.js";
import { apiRateLimiter } from "../middlewares/rateLimitMiddleware.js";
import { verifyToken as verifyAccessToken } from "../utils/jwt.js";

/**
 * Sets up attendance-related route handlers.
 * @param {import('express').Application} app - The Express application instance.
 * @returns {void}
 */
function setupAttendanceHandler(app) {
    app.post("/api/events/:id/attendance/init", apiRateLimiter, attendanceInit);
    app.post("/api/events/:id/attendance/mark", apiRateLimiter, attendanceMark);
    app.get("/api/events/:id/attendance", apiRateLimiter, attendanceGet);
    app.get("/api/events/:id/attendance/score", apiRateLimiter, attendanceScore);
}

/**
 * Initialize attendance tokens for an event (organizer only).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function attendanceInit(req, res) {
    try {
        const eventId = req.params.id;
        const accessToken = req.cookies?.access_token;

        if (!accessToken) {
            return res.status(401).json({ ok: false, message: "Unauthorized" });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded?.userId) {
            return res.status(401).json({ ok: false, message: "Invalid token" });
        }

        // Get user's profile
        const profile = await getUserProfileByUserId(decoded.userId);
        if (!profile) {
            return res.status(401).json({ ok: false, message: "Profile not found" });
        }

        // Get the event and verify ownership
        const event = await getEventById(eventId);
        if (!event) {
            return res.status(404).json({ ok: false, message: "Event not found" });
        }

        if (String(event.organiserId) !== String(profile.id)) {
            return res.status(403).json({ ok: false, message: "Only the organizer can initialize attendance" });
        }

        // Create or reset attendance tokens
        const attendance = await createAttendance(eventId);

        return res.status(200).json({
            ok: true,
            message: "Attendance tokens generated",
            data: attendance.toClient(true), // Include tokens for organizer
        });
    } catch (err) {
        console.error("attendanceInit error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
}

/**
 * Mark attendance for an event phase.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function attendanceMark(req, res) {
    try {
        const eventId = req.params.id;
        const { phase, token } = req.body;
        const accessToken = req.cookies?.access_token;

        if (!accessToken) {
            return res.status(401).json({ ok: false, message: "Unauthorized" });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded?.userId) {
            return res.status(401).json({ ok: false, message: "Invalid token" });
        }

        const profile = await getUserProfileByUserId(decoded.userId);
        if (!profile) {
            return res.status(401).json({ ok: false, message: "Profile not found" });
        }

        if (!phase || !token) {
            return res.status(400).json({ ok: false, message: "Phase and token are required" });
        }

        const result = await markPresent(eventId, phase, profile.id, token);

        if (!result.success) {
            return res.status(400).json({ ok: false, message: result.message });
        }

        return res.status(200).json({
            ok: true,
            message: result.message,
            data: {
                score: result.attendance.getAttendanceScore(profile.id),
            },
        });
    } catch (err) {
        console.error("attendanceMark error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
}

/**
 * Get attendance status for an event.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function attendanceGet(req, res) {
    try {
        const eventId = req.params.id;
        const accessToken = req.cookies?.access_token;

        let isOrganizer = false;
        let userProfileId = null;

        if (accessToken) {
            const decoded = verifyAccessToken(accessToken);
            if (decoded?.userId) {
                const profile = await getUserProfileByUserId(decoded.userId);
                if (profile) {
                    userProfileId = profile.id;
                    const event = await getEventById(eventId);
                    if (event && String(event.organiserId) === String(profile.id)) {
                        isOrganizer = true;
                    }
                }
            }
        }

        const attendance = await getAttendanceByEventId(eventId);
        if (!attendance) {
            return res.status(404).json({ ok: false, message: "Attendance not initialized" });
        }

        const response = {
            ok: true,
            data: attendance.toClient(isOrganizer),
        };

        if (userProfileId) {
            response.data.userScore = attendance.getAttendanceScore(userProfileId);
        }

        return res.status(200).json(response);
    } catch (err) {
        console.error("attendanceGet error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
}

/**
 * Get attendance score for current user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function attendanceScore(req, res) {
    try {
        const eventId = req.params.id;
        const accessToken = req.cookies?.access_token;

        if (!accessToken) {
            return res.status(401).json({ ok: false, message: "Unauthorized" });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded?.userId) {
            return res.status(401).json({ ok: false, message: "Invalid token" });
        }

        const profile = await getUserProfileByUserId(decoded.userId);
        if (!profile) {
            return res.status(401).json({ ok: false, message: "Profile not found" });
        }

        const score = await getUserAttendanceScore(eventId, profile.id);

        return res.status(200).json({
            ok: true,
            data: { score },
        });
    } catch (err) {
        console.error("attendanceScore error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
}

export { setupAttendanceHandler };
