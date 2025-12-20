import {
    getEventById,
    listEventsByOrganiserId,
    createEvent,
    updateEvent,
    deleteEvent,
    getLatestEvents,
    getLatestEventsForUser,
} from "../database/event.js";
import { EventModel } from "../models/eventModel.js";
import { getUserProfileByUsername } from "../database/user_profile.js";
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";
import { createPendingDeletion } from "../database/pending_deletions.js";
import { createNotification } from "../database/notification.js";

/**
 * Setup event handlers
 * @param {Express} app
 */
function setupEventHandler(app) {
    app.post("/event", hybridAuthMiddleware, eventPOST);
    app.get("/event/:id", hybridAuthMiddleware, eventGET);
    app.get("/events", hybridAuthMiddleware, eventsGET);
    app.patch("/event/:id", hybridAuthMiddleware, eventPATCH);
    app.delete("/event/:id", hybridAuthMiddleware, eventDELETE);
    app.get("/new_events", newEventsGET);
    app.get("/user_new_events", hybridAuthMiddleware, userNewEventsGET);
}

/**
 * Create a new event
 */
async function eventPOST(req, res) {
    try {
        const {
            title,
            description,
            onlineLocation,
            startAt,
            endAt,
            isPaid,
            isBroadcast,
            broadcastType,
            tags,
            categories,
            isInteractive,
            isAnonymous,
            groupId,
        } = req.body;

        // User is authenticated via JWT middleware, req.user contains userId and username
        const username = req.user?.username;
        if (!username) {
            return res.status(401).json({
                ok: false,
                event: EventModel.null().toClient(),
                message: "Authentication required."
            });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({
                ok: false,
                event: EventModel.null().toClient(),
                message: "Event title is required and cannot be empty."
            });
        }

        if (!startAt || !endAt) {
            return res.status(400).json({
                ok: false,
                event: EventModel.null().toClient(),
                message: "Event start and end times are required."
            });
        }

        const userProfile = await getUserProfileByUsername(username);
        if (!userProfile || userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                event: EventModel.null().toClient(),
                message: "Cannot fetch user profile."
            });
        }

        const event = await createEvent(userProfile.id, {
            title,
            description: description || "",
            onlineLocation: onlineLocation || "",
            startAt,
            endAt,
            isPaid: isPaid || false,
            isBroadcast: isBroadcast || false,
            broadcastType: broadcastType || null,
            tags: tags || "",
            categories: categories || "",
            isInteractive: isInteractive !== false,
            isAnonymous: isAnonymous || false,
            groupId: groupId || null,
        });

        if (!event) {
            return res.status(500).json({
                ok: false,
                event: EventModel.null().toClient(),
                message: "Failed to create event."
            });
        }

        return res.status(201).json({
            ok: true,
            event: event.toClient(),
            message: "Event created successfully."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            event: EventModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Get an event by ID
 */
async function eventGET(req, res) {
    try {
        const { id } = req.params;

        const event = await getEventById(id);
        if (!event) {
            return res.status(404).json({
                ok: false,
                event: EventModel.null().toClient(),
                message: "Event not found."
            });
        }

        return res.status(200).json({
            ok: true,
            event: event.toClient(),
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            event: EventModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Get events by user (organiser)
 */
async function eventsGET(req, res) {
    try {
        const { limit, offset, orderKey, orderBy } = req.query;

        // User is authenticated via JWT middleware
        const username = req.user?.username;
        if (!username) {
            return res.status(401).json({
                ok: false,
                events: [],
                message: "Authentication required."
            });
        }

        const userProfile = await getUserProfileByUsername(username);
        if (!userProfile || userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                events: [],
                message: "Cannot fetch user profile."
            });
        }

        const events = await listEventsByOrganiserId(userProfile.id, {
            limit,
            offset,
            orderKey,
            orderBy,
        });

        return res.status(200).json({
            ok: true,
            events: events.map(e => e.toClient()),
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            events: [],
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Update an event
 */
async function eventPATCH(req, res) {
    try {
        const { id } = req.params;
        const clientUpdates = req.body;

        // User is authenticated via JWT middleware
        const username = req.user?.username;
        if (!username) {
            return res.status(401).json({
                ok: false,
                event: EventModel.null().toClient(),
                message: "Authentication required."
            });
        }

        const userProfile = await getUserProfileByUsername(username);
        if (!userProfile || userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                event: EventModel.null().toClient(),
                message: "Cannot fetch user profile."
            });
        }

        const existingEvent = await getEventById(id);
        if (!existingEvent) {
            return res.status(404).json({
                ok: false,
                event: EventModel.null().toClient(),
                message: "Event not found."
            });
        }

        if (String(existingEvent.organiserId) !== String(userProfile.id)) {
            return res.status(403).json({
                ok: false,
                event: EventModel.null().toClient(),
                message: "Not authorized to update this event."
            });
        }

        // Convert camelCase to snake_case for database
        const dbUpdates = {};
        if (clientUpdates.title !== undefined) dbUpdates.title = clientUpdates.title;
        if (clientUpdates.description !== undefined) dbUpdates.description = clientUpdates.description;
        if (clientUpdates.onlineLocation !== undefined) dbUpdates.online_location = clientUpdates.onlineLocation;
        if (clientUpdates.startAt !== undefined) dbUpdates.start_at = clientUpdates.startAt;
        if (clientUpdates.endAt !== undefined) dbUpdates.end_at = clientUpdates.endAt;
        if (clientUpdates.isPaid !== undefined) dbUpdates.is_paid = clientUpdates.isPaid;
        if (clientUpdates.isBroadcast !== undefined) dbUpdates.is_broadcast = clientUpdates.isBroadcast;
        if (clientUpdates.broadcastType !== undefined) dbUpdates.broadcast_type = clientUpdates.broadcastType;
        if (clientUpdates.tags !== undefined) dbUpdates.tags = clientUpdates.tags;
        if (clientUpdates.categories !== undefined) dbUpdates.categories = clientUpdates.categories;
        if (clientUpdates.isInteractive !== undefined) dbUpdates.is_interactive = clientUpdates.isInteractive;
        if (clientUpdates.isAnonymous !== undefined) dbUpdates.is_anonymous = clientUpdates.isAnonymous;
        if (clientUpdates.groupId !== undefined) dbUpdates.group_id = clientUpdates.groupId;
        if (clientUpdates.isHidden !== undefined) dbUpdates.is_hidden = clientUpdates.isHidden;
        if (clientUpdates.isArchived !== undefined) dbUpdates.is_archived = clientUpdates.isArchived;

        const event = await updateEvent(id, dbUpdates);
        if (!event) {
            return res.status(500).json({
                ok: false,
                event: EventModel.null().toClient(),
                message: "Failed to update event."
            });
        }

        return res.status(200).json({
            ok: true,
            event: event.toClient(),
            message: "Event updated successfully."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            event: EventModel.null().toClient(),
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Delete an event
 */
async function eventDELETE(req, res) {
    try {
        const { id } = req.params;

        // User is authenticated via JWT middleware
        const username = req.user?.username;
        if (!username) {
            return res.status(401).json({
                ok: false,
                message: "Authentication required."
            });
        }

        const userProfile = await getUserProfileByUsername(username);
        if (!userProfile || userProfile.__isNull || userProfile.__isDefault) {
            return res.status(500).json({
                ok: false,
                message: "Cannot fetch user profile."
            });
        }

        const existingEvent = await getEventById(id);
        if (!existingEvent) {
            return res.status(404).json({
                ok: false,
                message: "Event not found."
            });
        }

        if (String(existingEvent.organiserId) !== String(userProfile.id)) {
            return res.status(403).json({
                ok: false,
                message: "Not authorized to delete this event."
            });
        }

        const success = await deleteEvent(id);
        if (!success) {
            return res.status(500).json({
                ok: false,
                message: "Failed to delete event."
            });
        }

        // Create pending deletion record (scheduled for 90 days from now)
        const pendingDeletion = await createPendingDeletion({
            entityType: "event",
            entityId: id,
            userProfileId: userProfile.id,
            daysUntilDeletion: 90
        });

        if (!pendingDeletion) {
            console.error("Failed to create pending deletion record for event:", id);
            return res.status(500).json({
                ok: false,
                message: "Event deleted but failed to schedule permanent deletion."
            });
        }

        // Create notification for user
        await createNotification({
            userProfileId: userProfile.id,
            type: "event_delete",
            source: id,
            message: `Your event "${existingEvent.title}" has been moved to trash. It will be permanently deleted in 90 days.`
        });

        return res.status(200).json({
            ok: true,
            message: "Event deleted successfully. It will be permanently removed in 90 days."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Get latest events (public endpoint)
 * Returns minimal info: id, title, createdAt
 */
async function newEventsGET(req, res) {
    try {
        const events = await getLatestEvents();
        
        return res.status(200).json({
            ok: true,
            new_events: events,
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            new_events: [],
            message: "CAUGHT ERROR."
        });
    }
}

/**
 * Get latest events for authenticated user
 * Returns full event details
 */
async function userNewEventsGET(req, res) {
    try {
        const events = await getLatestEventsForUser();
        
        return res.status(200).json({
            ok: true,
            user_new_events: events.map(e => e.toClient()),
            message: "Success."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            user_new_events: [],
            message: "CAUGHT ERROR."
        });
    }
}

export { setupEventHandler };
