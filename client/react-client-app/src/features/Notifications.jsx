import { useState, useEffect } from "react";
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../actions/notificationActions.js";
import { ServiceError } from "../components/Error.jsx";
import { resetLocation, resetUserSession } from "../session.js";

function Notifications({ isOpen, onClose }) {
    const [serviceError, setServiceError] = useState({ hasError: false, message: "" });
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("unread"); // "unread", "read", "all"
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const LIMIT = 20;

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;

        (async function () {
            try {
                setIsLoading(true);
                setNotifications([]);
                setOffset(0);
                setHasMore(true);

                const options = {
                    limit: LIMIT,
                    offset: 0,
                    days: 3,
                };

                if (filter === "unread") {
                    options.isRead = false;
                } else if (filter === "read") {
                    options.isRead = true;
                }

                const result = await fetchNotifications(options);
                if (!isMounted) return;

                if (!result.ok) {
                    const sessionErrorMessages = [
                        "Missing Cookie Headers.",
                        "Missing Session.",
                        "Invalid Session.",
                        "Authentication required."
                    ];

                    if (sessionErrorMessages.includes(result.message)) {
                        resetUserSession();
                        resetLocation();
                    }
                    setServiceError({ hasError: true, message: result.message });
                    return;
                }

                setNotifications(result.notifications || []);
                setHasMore(result.notifications?.length === LIMIT);

            } catch (error) {
                console.log({ error });
                if (isMounted) {
                    setServiceError({ hasError: true, message: "Unexpected Error" });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        })();

        return () => { isMounted = false; };
    }, [isOpen, filter]);

    async function loadMore() {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const newOffset = offset + LIMIT;

            const options = {
                limit: LIMIT,
                offset: newOffset,
                days: 3,
            };

            if (filter === "unread") {
                options.isRead = false;
            } else if (filter === "read") {
                options.isRead = true;
            }

            const result = await fetchNotifications(options);

            if (result.ok) {
                setNotifications([...notifications, ...(result.notifications || [])]);
                setOffset(newOffset);
                setHasMore(result.notifications?.length === LIMIT);
            } else {
                setServiceError({ hasError: true, message: result.message });
            }
        } catch (error) {
            console.log({ error });
            setServiceError({ hasError: true, message: "Error loading more notifications" });
        } finally {
            setLoadingMore(false);
        }
    }

    async function handleMarkAsRead(notificationId) {
        try {
            const result = await markNotificationAsRead(notificationId);
            if (result.ok) {
                setNotifications(notifications.map(n =>
                    n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
                ));
            } else {
                setServiceError({ hasError: true, message: result.message });
            }
        } catch (error) {
            console.log({ error });
            setServiceError({ hasError: true, message: "Error marking notification as read" });
        }
    }

    async function handleMarkAllAsRead() {
        try {
            const result = await markAllNotificationsAsRead();
            if (result.ok) {
                setNotifications(notifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
            } else {
                setServiceError({ hasError: true, message: result.message });
            }
        } catch (error) {
            console.log({ error });
            setServiceError({ hasError: true, message: "Error marking all as read" });
        }
    }

    async function handleDelete(notificationId) {
        try {
            const result = await deleteNotification(notificationId);
            if (result.ok) {
                setNotifications(notifications.filter(n => n.id !== notificationId));
            } else {
                setServiceError({ hasError: true, message: result.message });
            }
        } catch (error) {
            console.log({ error });
            setServiceError({ hasError: true, message: "Error deleting notification" });
        }
    }

    if (!isOpen) return null;

    return (
        <div className="overlay" onClick={onClose}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <div className="overlay-header">
                    <h2>Notifications</h2>
                    <button onClick={onClose} className="close-button" aria-label="Close">×</button>
                </div>

                {serviceError.hasError && <ServiceError message={serviceError.message} />}

                <div className="notification-filters">
                    <button
                        className={filter === "unread" ? "active" : ""}
                        onClick={() => setFilter("unread")}
                    >
                        Unread
                    </button>
                    <button
                        className={filter === "read" ? "active" : ""}
                        onClick={() => setFilter("read")}
                    >
                        Read
                    </button>
                    <button
                        className={filter === "all" ? "active" : ""}
                        onClick={() => setFilter("all")}
                    >
                        All
                    </button>
                </div>

                {filter === "unread" && notifications.some(n => !n.isRead) && (
                    <div className="notification-actions">
                        <button onClick={handleMarkAllAsRead}>Mark All as Read</button>
                    </div>
                )}

                <div className="notification-list">
                    {isLoading ? (
                        <p>Loading notifications...</p>
                    ) : notifications.length === 0 ? (
                        <p>No notifications to display.</p>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                            >
                                <div className="notification-content">
                                    <span className="notification-type">{notification.type.replace(/_/g, " ")}</span>
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-time">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="notification-actions">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="btn-small"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        className="btn-small btn-danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {hasMore && !isLoading && (
                    <div className="notification-load-more">
                        <button onClick={loadMore} disabled={loadingMore}>
                            {loadingMore ? "Loading..." : "Load More"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export { Notifications };
