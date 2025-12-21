import { useState, useEffect } from "react";
import { useSession } from "../hooks/useSession";
import { Link } from "../components/Link.jsx";
import { UserSettings } from "./UserSettings";
import { Logout } from "./Logout";
import { Notifications } from "./Notifications";
import { fetchUnreadNotificationCount } from "../actions/notificationActions";

function Menu() {
    const { hasSession } = useSession();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!hasSession) {
            setUnreadCount(0);
            return;
        }

        let isMounted = true;

        async function loadUnreadCount() {
            try {
                const result = await fetchUnreadNotificationCount();
                if (isMounted && result.ok) {
                    setUnreadCount(result.count || 0);
                }
            } catch (error) {
                console.error("Error loading unread count:", error);
            }
        }

        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000); // Poll every 30 seconds

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [hasSession]);

    return (
        <>
            <nav className="flex">
                <ul className="flex">
                    <li>
                        <Link to={"/"}>Home</Link>
                    </li>
                    {
                        hasSession && <>
                            <li>
                                <Link to={"/account"}>account</Link>
                            </li>
                            <li>
                                <Link to={"/profile"}>profile</Link>
                            </li>
                            <li>
                                <Link to={"/groups"}>groups</Link>
                            </li>
                            <li>
                                <Link to={"/events"}>events</Link>
                            </li>

                        </>

                    }
                </ul>

                <ul className="flex">
                    {!hasSession && <>
                        <li>
                            <Link to={"/login"}>login</Link>
                        </li>
                        <li>
                            <Link to={"/signup"}>signup</Link>
                        </li>
                    </>
                    }
                    {
                        hasSession && <>
                            <li>
                                <div
                                    className="flex hac vac clickable"
                                    onClick={() => setIsNotificationsOpen(true)}
                                    aria-label="Open notifications"
                                >
                                    <span className="notification-icon">🔔</span>
                                    {unreadCount > 0 && (
                                        <span className="notification-badge">{unreadCount}</span>
                                    )}
                                    <span>Notifications</span>
                                </div>
                            </li>
                            <li>
                                <Logout />
                            </li>
                            <li>
                                <div
                                    className="flex hac vac clickable"
                                    onClick={() => setIsSettingsOpen(true)}
                                    aria-label="Open settings"
                                >
                                    <span className="settings-icon">⚙</span>
                                    <span>Settings</span>
                                </div>
                            </li>
                        </>
                    }
                </ul>
            </nav>
            <UserSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <Notifications
                isOpen={isNotificationsOpen}
                onClose={() => {
                    setIsNotificationsOpen(false);
                    // Refresh unread count when closing
                    if (hasSession) {
                        fetchUnreadNotificationCount().then(result => {
                            if (result.ok) setUnreadCount(result.count || 0);
                        });
                    }
                }}
            />
        </>
    );
}

export { Menu };
