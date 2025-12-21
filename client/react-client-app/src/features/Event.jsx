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
        <div className="container p-3">
            <h2>Events</h2>

            {message.state !== MESSAGE_STATE.IDLE && (
                <div className={`message ${message.state === MESSAGE_STATE.SUCCESS ? "message--success" : "message--error"}`}>
                    {message.state === MESSAGE_STATE.SUCCESS ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    {message.text}
                </div>
            )}

            <div className="mb-3">
                <button onClick={handleCreateClick} className="btn btn-primary">
                    Create New Event
                </button>
            </div>

            {/* Create/Edit Form */}
            {(isCreating || isEditing) && (
                <form onSubmit={isEditing ? handleUpdateEvent : handleCreateEvent} className="form-container mb-4">
                    <h3>{isEditing ? "Edit Event" : "Create Event"}</h3>
                    <p className="form-hint mb-3">Fields marked with * are required</p>

                    <div className="form-group">
                        <label htmlFor="title" className="form-label">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="onlineLocation" className="form-label">Online Location (URL)</label>
                        <input
                            type="text"
                            id="onlineLocation"
                            name="onlineLocation"
                            value={formData.onlineLocation}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="startAt" className="form-label">Start Time *</label>
                            <input
                                type="datetime-local"
                                id="startAt"
                                name="startAt"
                                value={formData.startAt}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endAt" className="form-label">End Time *</label>
                            <input
                                type="datetime-local"
                                id="endAt"
                                name="endAt"
                                value={formData.endAt}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="tags" className="form-label">Tags</label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="e.g., tech, webinar"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="categories" className="form-label">Categories</label>
                            <input
                                type="text"
                                id="categories"
                                name="categories"
                                value={formData.categories}
                                onChange={handleInputChange}
                                placeholder="e.g., education, business"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-checkbox-group mb-3">
                        <label className="form-checkbox-label">
                            <input
                                type="checkbox"
                                name="isPaid"
                                checked={formData.isPaid}
                                onChange={handleInputChange}
                            />
                            Paid Event
                        </label>
                        <label className="form-checkbox-label">
                            <input
                                type="checkbox"
                                name="isBroadcast"
                                checked={formData.isBroadcast}
                                onChange={handleInputChange}
                            />
                            Broadcast
                        </label>
                        <label className="form-checkbox-label">
                            <input
                                type="checkbox"
                                name="isInteractive"
                                checked={formData.isInteractive}
                                onChange={handleInputChange}
                            />
                            Interactive
                        </label>
                        <label className="form-checkbox-label">
                            <input
                                type="checkbox"
                                name="isAnonymous"
                                checked={formData.isAnonymous}
                                onChange={handleInputChange}
                            />
                            Allow Anonymous
                        </label>
                    </div>

                    {formData.isBroadcast && (
                        <div className="form-group">
                            <label htmlFor="broadcastType" className="form-label">Broadcast Type</label>
                            <select
                                id="broadcastType"
                                name="broadcastType"
                                value={formData.broadcastType}
                                onChange={handleInputChange}
                                className="form-input"
                            >
                                <option value="">Select type...</option>
                                <option value="youtube">YouTube</option>
                                <option value="twitch">Twitch</option>
                                <option value="prerecorded">Pre-recorded</option>
                            </select>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? "Update Event" : "Create Event"}
                        </button>
                        <button type="button" className="btn" onClick={() => { setIsCreating(false); setIsEditing(false); resetForm(); }}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Event Detail View */}
            {selectedEvent && !isEditing && (
                <div className="detail-card">
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
                    <div className="form-actions">
                        <button className="btn" onClick={() => handleEditClick(selectedEvent)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => handleDeleteEvent(selectedEvent.id)}>Delete</button>
                        <button className="btn" onClick={() => setSelectedEvent(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* Events List */}
            <div className="vflex">
                <h3>Your Events ({events.length})</h3>
                {events.length === 0 ? (
                    <p>No events found. Create your first event!</p>
                ) : (
                    <div className="vflex gap-2">
                        {events.map(event => (
                            <div
                                key={event.id}
                                className={`list-item ${selectedEvent?.id === event.id ? "list-item--selected" : ""}`}
                                onClick={() => handleViewEvent(event.id)}
                            >
                                <div className="list-item__title">{event.title}</div>
                                <div className="list-item__meta">
                                    {formatDateTime(event.startAt)} - {formatDateTime(event.endAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Event;
