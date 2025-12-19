import { useState } from "react";
import { useSession } from "../hooks/useSession";
import { Link } from "../components/Link.jsx";
import { UserSettings } from "./UserSettings";
import { Logout } from "./Logout";

function Menu() {
    const { hasSession } = useSession();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
        </>
    );
}

export { Menu };
