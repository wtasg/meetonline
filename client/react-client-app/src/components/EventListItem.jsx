import { useState } from "react";

/**
 * EventListItem - Display a single event in a list
 * @param {object} props
 * @param {object} props.event - Event data (minimal or full)
 * @param {boolean} props.isAuthenticated - Whether user is authenticated
 * @param {boolean} props.isMinimal - Whether displaying minimal info only
 */
function EventListItem({ event, isAuthenticated, isMinimal }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    if (isMinimal || !isAuthenticated) {
        // Show minimal info (title + created date)
        return (
            <div className="event-list-item" style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>
                <div style={{ fontWeight: "bold" }}>{event.title}</div>
                <div style={{ fontSize: "0.9em", color: "#666" }}>
                    Created: {formatDate(event.createdAt)}
                </div>
            </div>
        );
    }

    // Authenticated user can see full details
    return (
        <div className="event-list-item">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="clickable flex"
            >
                <div>{isExpanded ? "[-]" : "[+]"}</div> <div>{event.title}</div>
            </div>
            <div className="text muted">
                Created: {formatDate(event.createdAt)}
            </div>
            {isExpanded && (
                <div style={{ marginTop: "8px", paddingLeft: "16px" }}>
                    {event.description && (
                        <div><strong>Description:</strong> {event.description}</div>
                    )}
                    {event.startAt && (
                        <div><strong>Start:</strong> {formatDate(event.startAt)}</div>
                    )}
                    {event.endAt && (
                        <div><strong>End:</strong> {formatDate(event.endAt)}</div>
                    )}
                    {event.onlineLocation && (
                        <div><strong>Location:</strong> {event.onlineLocation}</div>
                    )}
                    {event.tags && (
                        <div><strong>Tags:</strong> {event.tags}</div>
                    )}
                    {event.categories && (
                        <div><strong>Categories:</strong> {event.categories}</div>
                    )}
                </div>
            )}
        </div>
    );
}

export { EventListItem };
