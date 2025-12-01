import {
    createEvent,
    getEventById,
    listEventsByProfile,
    updateEvent,
    deleteEvent
} from "../database/event.js";
import { getUserProfileByUsername } from "../database/user_profile.js";
import { userSession } from "../utils/session.js";

/**
 * Register routes for event handling
 * @param {Express} app
 */
function setupEventHandler(app) {
    app.post("/events", eventPOST);
    app.get("/events/:id", eventGET);
    app.get("/events", eventsLIST);
    app.patch("/events/:id", eventPATCH);
    app.delete("/events/:id", eventDELETE);
}

/**
 * POST /events
 * Create a new event. Requires a valid session cookie.
 * Body should contain event fields (title required, start_at recommended).
 */
async function eventPOST(req, res) {
    try {
        const { cookies } = req;
        if (!cookies) {
            return res.status(400).json({ ok: false, event: false, message: "Missing Cookie Headers." });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({ ok: false, event: false, message: "Missing session." });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({ ok: false, event: false, message: "Invalid session." });
        }

        // fetch profile for the username
        const user_profile = await getUserProfileByUsername(username);
        if (user_profile.__isDefault || user_profile.__isNull) {
            return res.status(500).json({ ok: false, event: false, message: "Cannot fetch user profile." });
        }

        const payload = req.body || {};
        // required: title, start_at (basic check)
        if (!payload.title || !payload.start_at) {
            return res.status(400).json({ ok: false, event: false, message: "Missing required fields: title or start_at." });
        }

        // attach chief organiser
        payload.chief_organiser_profile_id = user_profile.id;

        const ev = await createEvent(payload);
        if (!ev) {
            return res.status(500).json({ ok: false, event: false, message: "Failed to create event." });
        }

        return res.status(201).json({ ok: true, event: ev, message: "Event created." });
    } catch (err) {
        console.error("eventPOST error:", err);
        return res.status(500).json({ ok: false, event: false, message: "CAUGHT ERROR." });
    }
}

/**
 * GET /events/:id
 * Fetch a single event by ID
 */
async function eventGET(req, res) {
    try {
        const { id } = req.params;
        const ev = await getEventById(Number(id));
        if (!ev) return res.status(404).json({ ok: false, event: false, message: "Event not found." });

        return res.status(200).json({ ok: true, event: ev, message: "success" });
    } catch (err) {
        console.error("eventGET error:", err);
        return res.status(500).json({ ok: false, event: false, message: "CAUGHT ERROR." });
    }
}

/**
 * GET /events
 * Query params:
 *   - mine=true  -> events for logged-in profile
 *   - profile_id=<id> -> events for specific profile id
 */
async function eventsLIST(req, res) {
    try {
        const { cookies, query } = req;
        // if asking for "mine", we need to validate session
        if (query?.mine === "true") {
            if (!cookies) return res.status(400).json({ ok: false, events: [], message: "Invalid Session." });

            const sessionId = cookies?.["session-1"];
            const username = cookies?.username;
            if (!sessionId || !username) {
                res.clearCookie("session-1");
                res.clearCookie("username");
                res.clearCookie("loggedin");
                return res.status(400).json({ ok: false, events: [], message: "Invalid Session." });
            }

            const storedSession = (await userSession({ username })).session;
            if (storedSession !== sessionId) {
                res.clearCookie("session-1");
                res.clearCookie("username");
                res.clearCookie("loggedin");
                return res.status(403).json({ ok: false, events: [], message: "Invalid session." });
            }

            const user_profile = await getUserProfileByUsername(username);
            if (user_profile.__isDefault || user_profile.__isNull) {
                return res.status(500).json({ ok: false, events: [], message: "Cannot fetch user profile." });
            }

            const list = await listEventsByProfile(user_profile.id);
            return res.status(200).json({ ok: true, events: list, message: "success" });
        }

        // else support profile_id query param (no auth required)
        if (query?.profile_id) {
            const profileId = Number(query.profile_id);
            if (Number.isNaN(profileId)) {
                return res.status(400).json({ ok: false, events: [], message: "Invalid profile_id" });
            }
            const list = await listEventsByProfile(profileId);
            return res.status(200).json({ ok: true, events: list, message: "success" });
        }

        // No listing strategy provided
        return res.status(400).json({ ok: false, events: [], message: "Specify ?mine=true or ?profile_id=<id>" });
    } catch (err) {
        console.error("eventsLIST error:", err);
        return res.status(500).json({ ok: false, events: [], message: "CAUGHT ERROR." });
    }
}

/**
 * PATCH /events/:id
 * Update an event. Only chief organiser may update.
 * Body contains key-value pairs to update.
 */
async function eventPATCH(req, res) {
    try {
        const { cookies } = req;
        if (!cookies) {
            return res.status(400).json({ ok: false, event: false, message: "Invalid Session." });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({ ok: false, event: false, message: "Invalid Session." });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({ ok: false, event: false, message: "Invalid session." });
        }

        const user_profile = await getUserProfileByUsername(username);
        if (user_profile.__isDefault || user_profile.__isNull) {
            return res.status(500).json({ ok: false, event: false, message: "Cannot fetch user profile." });
        }

        const eventId = Number(req.params.id);
        const existing = await getEventById(eventId);
        if (!existing) return res.status(404).json({ ok: false, event: false, message: "Event not found." });

        // check permission: only chief organiser can update
        if (existing.chief_organiser_profile_id !== user_profile.id) {
            return res.status(403).json({ ok: false, event: false, message: "Forbidden." });
        }

        const updates = req.body || {};
        const updated = await updateEvent(eventId, updates);
        if (!updated) {
            return res.status(500).json({ ok: false, event: false, message: "Cannot update event." });
        }

        return res.status(200).json({ ok: true, event: updated, message: "Success" });
    } catch (err) {
        console.error("eventPATCH error:", err);
        return res.status(500).json({ ok: false, event: false, message: "CAUGHT ERROR." });
    }
}

/**
 * DELETE /events/:id
 * Soft delete. Only chief organiser may delete.
 */
async function eventDELETE(req, res) {
    try {
        const { cookies } = req;
        if (!cookies) {
            return res.status(400).json({ ok: false, message: "Invalid Session." });
        }

        const sessionId = cookies?.["session-1"];
        const username = cookies?.username;
        if (!sessionId || !username) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(400).json({ ok: false, message: "Invalid Session." });
        }

        const storedSession = (await userSession({ username })).session;
        if (storedSession !== sessionId) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");
            return res.status(403).json({ ok: false, message: "Invalid session." });
        }

        const user_profile = await getUserProfileByUsername(username);
        if (user_profile.__isDefault || user_profile.__isNull) {
            return res.status(500).json({ ok: false, message: "Cannot fetch user profile." });
        }

        const eventId = Number(req.params.id);
        const existing = await getEventById(eventId);
        if (!existing) return res.status(404).json({ ok: false, message: "Event not found." });

        // permission check
        if (existing.chief_organiser_profile_id !== user_profile.id) {
            return res.status(403).json({ ok: false, message: "Forbidden." });
        }

        const ok = await deleteEvent(eventId);
        if (!ok) return res.status(500).json({ ok: false, message: "Failed to delete." });

        return res.status(200).json({ ok: true, message: "Deleted" });
    } catch (err) {
        console.error("eventDELETE error:", err);
        return res.status(500).json({ ok: false, message: "CAUGHT ERROR." });
    }
}

export { setupEventHandler };
