import {
    createEventByUsername,
    getEventById,
    listEventsByOrganiserId,
    updateEvent,
    softDeleteEvent,
    hardDeleteEvent,
} from "../database/event.js";

import { getUserProfileByUsername } from "../database/user_profile.js";
import { userSession } from "../utils/session.js";

/**
 * Registers all Event API routes.
 * @param {Express} app
 */
function setupEventHandler(app) {
    app.post("/event", eventPOST);
    app.get("/event/:id", eventGetById);
    app.get("/events/by-organiser/:id", eventsByOrganiserGET);
    app.patch("/event", eventPATCH);
    app.delete("/event", eventSoftDELETE);
    app.delete("/event/hard", eventHardDELETE);
}

/**
 * Validate session using cookies.
 * Ensures username + session-1 cookie exist and match stored session.
 */
async function validateSessionFromCookies(cookies) {
    if (!cookies) {
        return {
            ok: false,
            status: 400,
            message: "Missing cookie headers."
        };
    }

    const sessionId = cookies?.["session-1"];
    const username = cookies?.username;

    if (!sessionId || !username) {
        return {
            ok: false,
            status: 400,
            message: "Missing session."
        };
    }

    const storedSession = (await userSession({ username })).session;
    if (storedSession !== sessionId) {
        return {
            ok: false,
            status: 403,
            message: "Invalid session."
        };
    }

    return { ok: true, username };
}

/**
 * Resolve organiser profile_id from username.
 * Returns null if profile does not exist.
 */
async function resolveProfileId(username) {
    const profile = await getUserProfileByUsername(username);
    if (!profile || profile.__isNull || profile.__isDefault) {
        return null;
    }
    return profile.profile_id ?? profile.id ?? profile.user_id ?? null;
}

/**
 * Create an event.
 * Uses cookie username to determine organiser.
 * Body must contain required event fields (title, start_at, end_at).
 */
async function eventPOST(req, res) {
    try {
        const { cookies } = req;
        const sessionResult = await validateSessionFromCookies(cookies);

        if (!sessionResult.ok) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");

            return res.status(sessionResult.status).json({
                ok: false,
                event: false,
                message: sessionResult.message,
            });
        }

        const username = sessionResult.username;
        const payload = req.body || {};

        if (!payload.title || !payload.start_at || !payload.end_at) {
            return res.status(400).json({
                ok: false,
                event: false,
                message: "title, start_at and end_at are required.",
            });
        }

        const created = await createEventByUsername(username, payload);
        if (!created) {
            return res.status(500).json({
                ok: false,
                event: false,
                message: "Cannot create event.",
            });
        }

        return res.status(201).json({
            ok: true,
            event: created,
            message: "Event created.",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            event: false,
            message: "Internal server error.",
        });
    }
}

/**
 * Get a single event by ID.
 * Public endpoint.
 */
async function eventGetById(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                ok: false,
                event: false,
                message: "Missing event ID.",
            });
        }

        const event = await getEventById(id);
        if (!event) {
            return res.status(404).json({
                ok: false,
                event: false,
                message: "Event not found.",
            });
        }

        return res.status(200).json({
            ok: true,
            event,
            message: "Success",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            event: false,
            message: "Caught error.",
        });
    }
}

/**
 * List all events created by an organiser.
 * Route param :id = organiser_id
 * Optional query params: limit, offset
 */
async function eventsByOrganiserGET(req, res) {
    try {
        const organiserId = req.params.id;
        if (!organiserId) {
            return res.status(400).json({
                ok: false,
                events: [],
                message: "Missing organiser ID.",
            });
        }

        const limit = Number(req.query.limit || 20);
        const offset = Number(req.query.offset || 0);

        const events = await listEventsByOrganiserId(organiserId, { limit, offset });

        return res.status(200).json({
            ok: true,
            events,
            message: "Success",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            events: [],
            message: "Caught error.",
        });
    }
}

/**
 * Update event (organiser only).
 * Body must include: id, username, updates.
 */
async function eventPATCH(req, res) {
    try {
        const { id, username: bodyUsername, updates } = req.body || {};
        const { cookies } = req;

        const s = await validateSessionFromCookies(cookies);
        if (!s.ok || s.username !== bodyUsername) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");

            const status = s.status || 400;
            return res.status(status).json({
                ok: false,
                event: false,
                message: s.message || "Invalid session.",
            });
        }

        const profileId = await resolveProfileId(s.username);
        if (!profileId) {
            return res.status(403).json({
                ok: false,
                event: false,
                message: "Profile not found.",
            });
        }

        const existing = await getEventById(id);
        if (!existing) {
            return res.status(404).json({
                ok: false,
                event: false,
                message: "Event not found.",
            });
        }

        if (Number(existing.organiserId) !== Number(profileId)) {
            return res.status(403).json({
                ok: false,
                event: false,
                message: "Not the owner.",
            });
        }

        const updated = await updateEvent(id, updates || {});
        if (!updated) {
            return res.status(500).json({
                ok: false,
                event: false,
                message: "Cannot update event.",
            });
        }

        return res.status(200).json({
            ok: true,
            event: updated,
            message: "Success",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            event: false,
            message: "Caught error.",
        });
    }
}

/**
 * Soft delete event (owner only).
 * Body: { id, username }
 * Sets is_deleted = true
 */
async function eventSoftDELETE(req, res) {
    try {
        const { id, username: bodyUsername } = req.body || {};
        const { cookies } = req;

        const s = await validateSessionFromCookies(cookies);
        if (!s.ok || s.username !== bodyUsername) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");

            return res.status(400).json({
                ok: false,
                event: false,
                message: "Invalid session.",
            });
        }

        const profileId = await resolveProfileId(s.username);
        if (!profileId) {
            return res.status(403).json({
                ok: false,
                event: false,
                message: "Profile not found.",
            });
        }

        const existing = await getEventById(id);
        if (!existing) {
            return res.status(404).json({
                ok: false,
                event: false,
                message: "Event not found.",
            });
        }

        if (Number(existing.organiserId) !== Number(profileId)) {
            return res.status(403).json({
                ok: false,
                event: false,
                message: "Not the owner.",
            });
        }

        const ok = await softDeleteEvent(id);
        if (!ok) {
            return res.status(500).json({
                ok: false,
                event: false,
                message: "Cannot delete event.",
            });
        }

        return res.status(200).json({
            ok: true,
            event: true,
            message: "Deleted (soft).",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            event: false,
            message: "Caught error.",
        });
    }
}

/**
 * Hard delete event (owner only).
 * Body: { id, username }
 * Physically removes row from DB
 */
async function eventHardDELETE(req, res) {
    try {
        const { id, username: bodyUsername } = req.body || {};
        const { cookies } = req;

        const s = await validateSessionFromCookies(cookies);
        if (!s.ok || s.username !== bodyUsername) {
            res.clearCookie("session-1");
            res.clearCookie("username");
            res.clearCookie("loggedin");

            return res.status(400).json({
                ok: false,
                event: false,
                message: "Invalid session.",
            });
        }

        const profileId = await resolveProfileId(s.username);
        if (!profileId) {
            return res.status(403).json({
                ok: false,
                event: false,
                message: "Profile not found.",
            });
        }

        const existing = await getEventById(id);
        if (!existing) {
            return res.status(404).json({
                ok: false,
                event: false,
                message: "Event not found.",
            });
        }

        if (Number(existing.organiserId) !== Number(profileId)) {
            return res.status(403).json({
                ok: false,
                event: false,
                message: "Not the owner.",
            });
        }

        const ok = await hardDeleteEvent(id);
        if (!ok) {
            return res.status(500).json({
                ok: false,
                event: false,
                message: "Cannot hard delete event.",
            });
        }

        return res.status(200).json({
            ok: true,
            event: true,
            message: "Deleted (hard).",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            event: false,
            message: "Caught error.",
        });
    }
}

export {
    setupEventHandler,
    eventPOST,
    eventGetById,
    eventsByOrganiserGET,
    eventPATCH,
    eventSoftDELETE,
    eventHardDELETE,
};
