import {
    createEvent as netCreateEvent,
    fetchEvent as netFetchEvent,
    fetchEvents as netFetchEvents,
    updateEvent as netUpdateEvent,
    deleteEvent as netDeleteEvent,
    fetchNewEvents as netFetchNewEvents,
    fetchUserNewEvents as netFetchUserNewEvents,
    EventData
} from "../net/event.js";

interface EventActionResponse {
    ok: boolean;
    message?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * Creates a new event with the provided data.
 * @param {EventData} eventData - The event data to create the event with.
 * @returns {Promise<EventActionResponse>} A promise that resolves to an EventActionResponse containing the created event or error message.
 */
async function createEvent(eventData: EventData): Promise<EventActionResponse> {
    return netCreateEvent(eventData);
}

/**
 * Fetches a single event by its unique identifier.
 * @param {string} eventId - The unique identifier of the event to fetch.
 * @returns {Promise<EventActionResponse>} A promise that resolves to an EventActionResponse containing the event data or error message.
 */
async function fetchEvent(eventId: string): Promise<EventActionResponse> {
    return netFetchEvent(eventId);
}

/**
 * Fetches a list of events with optional pagination and sorting.
 * @param {Object} [options] - Optional configuration for the fetch operation.
 * @param {number} [options.limit] - Maximum number of events to return.
 * @param {number} [options.offset] - Number of events to skip for pagination.
 * @param {string} [options.orderKey] - The field to order results by.
 * @param {string} [options.orderBy] - The sort direction ('asc' or 'desc').
 * @returns {Promise<EventActionResponse>} A promise that resolves to an EventActionResponse containing the events list or error message.
 */
async function fetchEvents(options: { limit?: number; offset?: number; orderKey?: string; orderBy?: string } = {}): Promise<EventActionResponse> {
    return netFetchEvents(options);
}

/**
 * Updates an existing event with the provided changes.
 * @param {string} eventId - The unique identifier of the event to update.
 * @param {Partial<EventData>} updates - The partial event data containing fields to update.
 * @returns {Promise<EventActionResponse>} A promise that resolves to an EventActionResponse indicating success or failure.
 */
async function updateEvent(eventId: string, updates: Partial<EventData>): Promise<EventActionResponse> {
    return netUpdateEvent(eventId, updates);
}

/**
 * Deletes an event by its unique identifier.
 * @param {string} eventId - The unique identifier of the event to delete.
 * @returns {Promise<EventActionResponse>} A promise that resolves to an EventActionResponse indicating success or failure.
 */
async function deleteEvent(eventId: string): Promise<EventActionResponse> {
    return netDeleteEvent(eventId);
}

/**
 * Fetches the most recently created events across all users.
 * @returns {Promise<EventActionResponse>} A promise that resolves to an EventActionResponse containing the new events list or error message.
 */
async function fetchNewEvents(): Promise<EventActionResponse> {
    return netFetchNewEvents();
}

/**
 * Fetches the most recently created events for the current authenticated user.
 * @returns {Promise<EventActionResponse>} A promise that resolves to an EventActionResponse containing the user's new events or error message.
 */
async function fetchUserNewEvents(): Promise<EventActionResponse> {
    return netFetchUserNewEvents();
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
