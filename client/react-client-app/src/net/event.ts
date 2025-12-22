import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

export interface EventData {
    title: string;
    description: string;
    onlineLocation: string;
    startAt: string;
    endAt: string;
    isPaid: boolean;
    isBroadcast: boolean;
    broadcastType: string;
    tags: string;
    categories: string;
    isInteractive: boolean;
    isAnonymous: boolean;
    groupId?: number;
}

interface EventResponse {
    ok: boolean;
    message?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event?: any | false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new_events?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user_new_events?: any[];
}

/**
 * Creates a new event on the server.
 * @param {EventData} eventData - The event data containing all required and optional fields.
 * @returns {Promise<EventResponse>} A promise resolving to an EventResponse containing the created event or error.
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
}: EventData): Promise<EventResponse> {
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
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, event: false };
    }
}

/**
 * Fetches a single event by its unique identifier.
 * @param {string} eventId - The unique identifier of the event to fetch.
 * @returns {Promise<EventResponse>} A promise resolving to an EventResponse containing the event data or error.
 */
async function fetchEvent(eventId: string): Promise<EventResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.EVENT}/${eventId}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, event: false };
    }
}

/**
 * Fetches all events for the current authenticated user with optional pagination and sorting.
 * @param {Object} [options] - Optional configuration for the fetch operation.
 * @param {number} [options.limit] - Maximum number of events to return.
 * @param {number} [options.offset] - Number of events to skip for pagination.
 * @param {string} [options.orderKey] - The field to order results by.
 * @param {string} [options.orderBy] - The sort direction ('asc' or 'desc').
 * @returns {Promise<EventResponse>} A promise resolving to an EventResponse containing the events list or error.
 */
async function fetchEvents(options: { limit?: number; offset?: number; orderKey?: string; orderBy?: string } = {}): Promise<EventResponse> {
    try {
        const params = new URLSearchParams();
        if (options.limit) params.append("limit", String(options.limit));
        if (options.offset) params.append("offset", String(options.offset));
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
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, events: [] };
    }
}

/**
 * Updates an existing event with the provided changes.
 * @param {string} eventId - The unique identifier of the event to update.
 * @param {Partial<EventData>} updates - The partial event data containing fields to update.
 * @returns {Promise<EventResponse>} A promise resolving to an EventResponse indicating success or failure.
 */
async function updateEvent(eventId: string, updates: Partial<EventData>): Promise<EventResponse> {
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
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, event: false };
    }
}

/**
 * Deletes an event by its unique identifier.
 * @param {string} eventId - The unique identifier of the event to delete.
 * @returns {Promise<EventResponse>} A promise resolving to an EventResponse indicating success or failure.
 */
async function deleteEvent(eventId: string): Promise<EventResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.EVENT}/${eventId}`, {
            credentials: "include",
            method: "DELETE",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

/**
 * Fetches the most recently created events (public endpoint).
 * Returns minimal information suitable for public display.
 * @returns {Promise<EventResponse>} A promise resolving to an EventResponse containing the new events list or error.
 */
async function fetchNewEvents(): Promise<EventResponse> {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/new_events`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, new_events: [] };
    }
}

/**
 * Fetches the most recently created events for the authenticated user.
 * Returns full event details including private information.
 * @returns {Promise<EventResponse>} A promise resolving to an EventResponse containing the user's new events or error.
 */
async function fetchUserNewEvents(): Promise<EventResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/user_new_events`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, user_new_events: [] };
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
