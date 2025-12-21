import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

/**
 * Create a new event
 * @param {object} eventData
 * @param {string} eventData.title - The title of the event
 * @param {string} eventData.description - The description of the event
 * @param {string} eventData.onlineLocation - Meeting URL or ID
 * @param {string} eventData.startAt - Event start timestamp (ISO string)
 * @param {string} eventData.endAt - Event end timestamp (ISO string)
 * @param {boolean} eventData.isPaid - Whether the event requires payment
 * @param {boolean} eventData.isBroadcast - Whether the event is a broadcast
 * @param {string} eventData.broadcastType - Type of broadcast
 * @param {string} eventData.tags - Tags for the event
 * @param {string} eventData.categories - Categories for the event
 * @param {boolean} eventData.isInteractive - Whether organiser interacts with attendees
 * @param {boolean} eventData.isAnonymous - Whether attendees can join anonymously
 * @param {number} eventData.groupId - Optional group ID
 * @returns {Promise<{ok: boolean, message: string, event: object}>}
 */
async function createEvent({
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
}) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.EVENT}`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
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
            }),
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, event: false };
    }
}

/**
 * Fetch an event by ID
 * @param {string} eventId - The event ID
 * @returns {Promise<{ok: boolean, message: string, event: object}>}
 */
async function fetchEvent(eventId) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.EVENT}/${eventId}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, event: false };
    }
}

/**
 * Fetch all events for the current user
 * @param {{limit?: number, offset?: number, orderKey?: string, orderBy?: string}} options
 * @returns {Promise<{ok: boolean, message: string, events: array}>}
 */
async function fetchEvents(options = {}) {
    try {
        const params = new URLSearchParams();
        if (options.limit) params.append("limit", options.limit);
        if (options.offset) params.append("offset", options.offset);
        if (options.orderKey) params.append("orderKey", options.orderKey);
        if (options.orderBy) params.append("orderBy", options.orderBy);

        const queryString = params.toString();
        const url = `${CONF.HTTPS_SERVER}/${CONF.URLS.EVENTS}${queryString ? `?${queryString}` : ""}`;

        const response = await authenticatedFetch(url, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, events: [] };
    }
}

/**
 * Update an event
 * @param {string} eventId - The event ID
 * @param {object} updates - The fields to update
 * @returns {Promise<{ok: boolean, message: string, event: object}>}
 */
async function updateEvent(eventId, updates) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.EVENT}/${eventId}`, {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
        });
        const json = await response.json();
        if (!json.ok) {
            console.error(json);
        }
        return json;
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, event: false };
    }
}

/**
 * Delete an event
 * @param {string} eventId - The event ID
 * @returns {Promise<{ok: boolean, message: string}>}
 */
async function deleteEvent(eventId) {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.EVENT}/${eventId}`, {
            credentials: "include",
            method: "DELETE",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message };
    }
}

/**
 * Fetch latest events (public endpoint - minimal info)
 * @returns {Promise<{ok: boolean, message: string, new_events: array}>}
 */
async function fetchNewEvents() {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/new_events`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, new_events: [] };
    }
}

/**
 * Fetch latest events for authenticated user (full details)
 * @returns {Promise<{ok: boolean, message: string, user_new_events: array}>}
 */
async function fetchUserNewEvents() {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/user_new_events`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, user_new_events: [] };
    }
}

export {
    createEvent,
    fetchEvent,
    fetchEvents,
    updateEvent,
    deleteEvent,
    fetchNewEvents,
    fetchUserNewEvents,
};
