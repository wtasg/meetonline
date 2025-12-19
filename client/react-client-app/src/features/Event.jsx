import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
    createEvent,
    fetchEvents,
    fetchEvent,
    updateEvent,
    deleteEvent,
} from "../actions/eventActions.js";

const MESSAGE_STATE = {
    IDLE: "idle",
    SUCCESS: "success",
    SERVER_ERROR: "serverError",
    CLIENT_ERROR: "clientError"
};

function Event() {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState({ text: "", state: MESSAGE_STATE.IDLE });

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        onlineLocation: "",
        startAt: "",
        endAt: "",
        isPaid: false,
        isBroadcast: false,
        broadcastType: "",
        tags: "",
        categories: "",
        isInteractive: true,
        isAnonymous: false,
    });

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        const result = await fetchEvents();
        if (result.ok) {
            setEvents(result.events);
            setMessage({ text: "", state: MESSAGE_STATE.IDLE });
        } else {
            setMessage({ text: result.message || "Failed to load events.", state: MESSAGE_STATE.SERVER_ERROR });
        }
    }

    async function handleCreateEvent(e) {
        e.preventDefault();
        setMessage({ text: "", state: MESSAGE_STATE.IDLE });

        const result = await createEvent({
            title: formData.title,
            description: formData.description,
            onlineLocation: formData.onlineLocation,
            startAt: formData.startAt,
            endAt: formData.endAt,
            isPaid: formData.isPaid,
            isBroadcast: formData.isBroadcast,
            broadcastType: formData.broadcastType,
            tags: formData.tags,
            categories: formData.categories,
            isInteractive: formData.isInteractive,
            isAnonymous: formData.isAnonymous,
        });

        if (result.ok) {
            setMessage({ text: "Event created successfully!", state: MESSAGE_STATE.SUCCESS });
            setIsCreating(false);
            resetForm();
            loadEvents();
        } else {
            setMessage({ text: result.message || "Failed to create event.", state: MESSAGE_STATE.SERVER_ERROR });
        }
    }

    async function handleUpdateEvent(e) {
        e.preventDefault();
        setMessage({ text: "", state: MESSAGE_STATE.IDLE });

        const result = await updateEvent(selectedEvent.id, {
            title: formData.title,
            description: formData.description,
            onlineLocation: formData.onlineLocation,
            startAt: formData.startAt,
            endAt: formData.endAt,
            isPaid: formData.isPaid,
            isBroadcast: formData.isBroadcast,
            broadcastType: formData.broadcastType,
            tags: formData.tags,
            categories: formData.categories,
            isInteractive: formData.isInteractive,
            isAnonymous: formData.isAnonymous,
        });

        if (result.ok) {
            setMessage({ text: "Event updated successfully!", state: MESSAGE_STATE.SUCCESS });
            setIsEditing(false);
            setSelectedEvent(null);
            resetForm();
            loadEvents();
        } else {
            setMessage({ text: result.message || "Failed to update event.", state: MESSAGE_STATE.SERVER_ERROR });
        }
    }

    async function handleDeleteEvent(eventId) {
        setMessage({ text: "", state: MESSAGE_STATE.IDLE });

        if (!confirm("Are you sure you want to delete this event?")) {
            return;
        }

        const result = await deleteEvent(eventId);
        if (result.ok) {
            setMessage({ text: "Event deleted successfully!", state: MESSAGE_STATE.SUCCESS });
            setSelectedEvent(null);
            loadEvents();
        } else {
            setMessage({ text: result.message || "Failed to delete event.", state: MESSAGE_STATE.SERVER_ERROR });
        }
    }

    async function handleViewEvent(eventId) {
        setMessage({ text: "", state: MESSAGE_STATE.IDLE });
        const result = await fetchEvent(eventId);
        if (result.ok) {
            setSelectedEvent(result.event);
            setIsEditing(false);
            setIsCreating(false);
        } else {
            setMessage({ text: result.message || "Failed to load event.", state: MESSAGE_STATE.SERVER_ERROR });
        }
    }

    function handleEditClick(event) {
        setSelectedEvent(event);
        setFormData({
            title: event.title || "",
            description: event.description || "",
            onlineLocation: event.onlineLocation || "",
            startAt: event.startAt ? event.startAt.slice(0, 16) : "",
            endAt: event.endAt ? event.endAt.slice(0, 16) : "",
            isPaid: event.isPaid || false,
            isBroadcast: event.isBroadcast || false,
            broadcastType: event.broadcastType || "",
            tags: event.tags || "",
            categories: event.categories || "",
            isInteractive: event.isInteractive !== false,
            isAnonymous: event.isAnonymous || false,
        });
        setIsEditing(true);
        setIsCreating(false);
    }

    function handleCreateClick() {
        resetForm();
        setIsCreating(true);
        setIsEditing(false);
        setSelectedEvent(null);
    }

    function resetForm() {
        setFormData({
            title: "",
            description: "",
            onlineLocation: "",
            startAt: "",
            endAt: "",
            isPaid: false,
            isBroadcast: false,
            broadcastType: "",
            tags: "",
            categories: "",
            isInteractive: true,
            isAnonymous: false,
        });
    }

    function handleInputChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function formatDateTime(isoString) {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleString();
    }

    return (
        <div className="event-container p1">
            <h2>Events</h2>

            {message.state !== MESSAGE_STATE.IDLE && <div className={message.state === MESSAGE_STATE.SUCCESS ? "success-message" : "error-message"} style={{ color: message.state === MESSAGE_STATE.SUCCESS ? "var(--color-green)" : "var(--color-red)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px", padding: "10px", backgroundColor: message.state === MESSAGE_STATE.SUCCESS ? "oklch(95% 0.1 150)" : "oklch(95% 0.1 29)", borderRadius: "4px", border: `1px solid ${message.state === MESSAGE_STATE.SUCCESS ? "var(--color-green)" : "var(--color-red)"}` }}>{message.state === MESSAGE_STATE.SUCCESS ? <CheckCircle size={20} /> : <XCircle size={20} />} {message.text}</div>}

            <div style={{ marginBottom: "1rem" }}>
                <button onClick={handleCreateClick} className="btn-primary">
                    Create New Event
                </button>
            </div>

            {/* Create/Edit Form */}
            {(isCreating || isEditing) && (
                <form onSubmit={isEditing ? handleUpdateEvent : handleCreateEvent} className="event-form" style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid var(--color-gray-300)", borderRadius: "8px" }}>
                    <h3>{isEditing ? "Edit Event" : "Create Event"}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "1rem" }}>Fields marked with * are required</p>

                    <div style={{ marginBottom: "1rem" }}>
                        <label htmlFor="title">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            style={{ width: "100%", padding: "0.5rem" }}
                        />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            style={{ width: "100%", padding: "0.5rem" }}
                        />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label htmlFor="onlineLocation">Online Location (URL)</label>
                        <input
                            type="text"
                            id="onlineLocation"
                            name="onlineLocation"
                            value={formData.onlineLocation}
                            onChange={handleInputChange}
                            style={{ width: "100%", padding: "0.5rem" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="startAt">Start Time *</label>
                            <input
                                type="datetime-local"
                                id="startAt"
                                name="startAt"
                                value={formData.startAt}
                                onChange={handleInputChange}
                                required
                                style={{ width: "100%", padding: "0.5rem" }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="endAt">End Time *</label>
                            <input
                                type="datetime-local"
                                id="endAt"
                                name="endAt"
                                value={formData.endAt}
                                onChange={handleInputChange}
                                required
                                style={{ width: "100%", padding: "0.5rem" }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="tags">Tags</label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="e.g., tech, webinar"
                                style={{ width: "100%", padding: "0.5rem" }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="categories">Categories</label>
                            <input
                                type="text"
                                id="categories"
                                name="categories"
                                value={formData.categories}
                                onChange={handleInputChange}
                                placeholder="e.g., education, business"
                                style={{ width: "100%", padding: "0.5rem" }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: "1rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                        <label>
                            <input
                                type="checkbox"
                                name="isPaid"
                                checked={formData.isPaid}
                                onChange={handleInputChange}
                            />
                            {" "}Paid Event
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="isBroadcast"
                                checked={formData.isBroadcast}
                                onChange={handleInputChange}
                            />
                            {" "}Broadcast
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="isInteractive"
                                checked={formData.isInteractive}
                                onChange={handleInputChange}
                            />
                            {" "}Interactive
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="isAnonymous"
                                checked={formData.isAnonymous}
                                onChange={handleInputChange}
                            />
                            {" "}Allow Anonymous
                        </label>
                    </div>

                    {formData.isBroadcast && (
                        <div style={{ marginBottom: "1rem" }}>
                            <label htmlFor="broadcastType">Broadcast Type</label>
                            <select
                                id="broadcastType"
                                name="broadcastType"
                                value={formData.broadcastType}
                                onChange={handleInputChange}
                                style={{ width: "100%", padding: "0.5rem" }}
                            >
                                <option value="">Select type...</option>
                                <option value="youtube">YouTube</option>
                                <option value="twitch">Twitch</option>
                                <option value="prerecorded">Pre-recorded</option>
                            </select>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button type="submit" className="btn-primary">
                            {isEditing ? "Update Event" : "Create Event"}
                        </button>
                        <button type="button" onClick={() => { setIsCreating(false); setIsEditing(false); resetForm(); }}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Event Detail View */}
            {selectedEvent && !isEditing && (
                <div className="event-detail" style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid var(--color-gray-300)", borderRadius: "8px" }}>
                    <h3>{selectedEvent.title}</h3>
                    <p><strong>Description:</strong> {selectedEvent.description || "No description"}</p>
                    <p><strong>Online Location:</strong> {selectedEvent.onlineLocation || "N/A"}</p>
                    <p><strong>Start:</strong> {formatDateTime(selectedEvent.startAt)}</p>
                    <p><strong>End:</strong> {formatDateTime(selectedEvent.endAt)}</p>
                    <p><strong>Tags:</strong> {selectedEvent.tags || "None"}</p>
                    <p><strong>Categories:</strong> {selectedEvent.categories || "None"}</p>
                    <p><strong>Options:</strong>
                        {selectedEvent.isPaid && " [Paid]"}
                        {selectedEvent.isBroadcast && ` [Broadcast: ${selectedEvent.broadcastType || "?"}]`}
                        {selectedEvent.isInteractive && " [Interactive]"}
                        {selectedEvent.isAnonymous && " [Allows Anonymous]"}
                    </p>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button onClick={() => handleEditClick(selectedEvent)}>Edit</button>
                        <button onClick={() => handleDeleteEvent(selectedEvent.id)} style={{ color: "var(--color-red)" }}>Delete</button>
                        <button onClick={() => setSelectedEvent(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* Events List */}
            <div className="events-list">
                <h3>Your Events ({events.length})</h3>
                {events.length === 0 ? (
                    <p>No events found. Create your first event!</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {events.map(event => (
                            <li
                                key={event.id}
                                style={{
                                    padding: "1rem",
                                    marginBottom: "0.5rem",
                                    border: "1px solid var(--color-gray-200)",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    backgroundColor: selectedEvent?.id === event.id ? "var(--color-gray-100)" : "transparent"
                                }}
                                onClick={() => handleViewEvent(event.id)}
                            >
                                <strong>{event.title}</strong>
                                <div style={{ fontSize: "0.9rem", color: "var(--color-gray-500)" }}>
                                    {formatDateTime(event.startAt)} - {formatDateTime(event.endAt)}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Event;
