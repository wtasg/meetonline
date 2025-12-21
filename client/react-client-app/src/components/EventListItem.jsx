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
            <div className="card p-2">
                <div className="list-item__title">{event.title}</div>
                <div className="list-item__meta">
                    Created: {formatDate(event.createdAt)}
                </div>
            </div>
        );
    }

    // Authenticated user can see full details
    return (
        <div className="card">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="clickable flex gap-2"
            >
                <div>{isExpanded ? "[-]" : "[+]"}</div> <div className="list-item__title">{event.title}</div>
            </div>
            <div className="text-muted text-sm">
                Created: {formatDate(event.createdAt)}
            </div>
            {isExpanded && (
                <div className="vflex gap-1 mt-2 px-3">
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
