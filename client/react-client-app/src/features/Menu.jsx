import { useState, useEffect } from "react";
import { Home, User, UserCircle, Users, Calendar, Search, Bell, Settings, LogOut, ChevronDown } from "lucide-react";
import { useSession } from "../hooks/useSession";
import { Link } from "../components/Link.jsx";
import { UserSettings } from "./UserSettings";
import { Logout } from "./Logout";
import { Notifications } from "./Notifications";
import { fetchUnreadNotificationCount } from "../actions/notificationActions";

function Menu() {
    const { hasSession, username } = useSession();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (isDropdownOpen && !event.target.closest(".user-menu-dropdown")) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isDropdownOpen]);

    return (
        <>
            <nav className="flex flex-1 sb">
                {/* Left section - Main navigation */}
                <ul className="flex">
                    <li>
                        <Link to={"/"}>
                            <span className="flex hac vac gap-1">
                                <Home size={16} />
                                <span>Home</span>
                            </span>
                        </Link>
                    </li>
                    {
                        hasSession && <>
                            <li>
                                <Link to={"/groups"}>
                                    <span className="flex hac vac gap-1">
                                        <Users size={16} />
                                        <span>Groups</span>
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link to={"/events"}>
                                    <span className="flex hac vac gap-1">
                                        <Calendar size={16} />
                                        <span>Events</span>
                                    </span>
                                </Link>
                            </li>
                        </>
                    }
                </ul>

                {/* Center section - Search */}
                {hasSession && (
                    <ul className="flex">
                        <li>
                            <Link to={"/search"}>
                                <span className="flex hac vac gap-1">
                                    <Search size={16} />
                                    <span>Search</span>
                                </span>
                            </Link>
                        </li>
                    </ul>
                )}

                {/* Right section - User actions */}
                <ul className="flex">
                    {!hasSession && <>
                        <li>
                            <Link to={"/login"}>
                                <span className="flex hac vac gap-1">
                                    <LogOut size={16} />
                                    <span>Login</span>
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link to={"/signup"}>
                                <span className="flex hac vac gap-1">
                                    <UserCircle size={16} />
                                    <span>Signup</span>
                                </span>
                            </Link>
                        </li>
                    </>
                    }
                    {
                        hasSession && (
                            <li className="user-menu-dropdown" style={{ position: "relative" }}>
                                <div
                                    className="flex hac vac clickable gap-1"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    aria-label="User menu"
                                >
                                    <UserCircle size={16} />
                                    <span>{username()}</span>
                                    {unreadCount > 0 && (
                                        <span className="notification-badge">{unreadCount}</span>
                                    )}
                                    <ChevronDown size={14} />
                                </div>

                                {isDropdownOpen && (
                                    <div className="user-dropdown-menu">
                                        <Link to={"/profile"}>
                                            <div className="user-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                                <UserCircle size={16} />
                                                <span>Profile</span>
                                            </div>
                                        </Link>
                                        <Link to={"/account"}>
                                            <div className="user-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                                <User size={16} />
                                                <span>Account</span>
                                            </div>
                                        </Link>
                                        <div className="user-dropdown-divider"></div>
                                        <div
                                            className="user-dropdown-item"
                                            onClick={() => {
                                                setIsNotificationsOpen(true);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <Bell size={16} />
                                            <span>Notifications</span>
                                            {unreadCount > 0 && (
                                                <span className="notification-badge">{unreadCount}</span>
                                            )}
                                        </div>
                                        <div
                                            className="user-dropdown-item"
                                            onClick={() => {
                                                setIsSettingsOpen(true);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <Settings size={16} />
                                            <span>Settings</span>
                                        </div>
                                        <div className="user-dropdown-divider"></div>
                                        <div
                                            className="user-dropdown-item"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <Logout />
                                        </div>
                                    </div>
                                )}
                            </li>
                        )
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
