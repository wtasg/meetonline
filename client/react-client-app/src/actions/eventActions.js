import {
    createEvent as netCreateEvent,
    fetchEvent as netFetchEvent,
    fetchEvents as netFetchEvents,
    updateEvent as netUpdateEvent,
    deleteEvent as netDeleteEvent,
    fetchNewEvents as netFetchNewEvents,
    fetchUserNewEvents as netFetchUserNewEvents,
} from "../net/event.js";

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
    return netCreateEvent({
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
    });
}

async function fetchEvent(eventId) {
    return netFetchEvent(eventId);
}

async function fetchEvents(options = {}) {
    return netFetchEvents(options);
}

async function updateEvent(eventId, updates) {
    return netUpdateEvent(eventId, updates);
}

async function deleteEvent(eventId) {
    return netDeleteEvent(eventId);
}

async function fetchNewEvents() {
    return netFetchNewEvents();
}

async function fetchUserNewEvents() {
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
