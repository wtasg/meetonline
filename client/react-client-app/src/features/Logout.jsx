import { useState } from "react";
import { useSession } from "../hooks/useSession";
import { navigateTo } from "../hooks/useNavigate";
import { logoutAction } from "../actions/authActions";
import { LogoutIcon } from "../icons/AuthIcons";

function Logout() {
    const { username, logout } = useSession();
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await logoutAction();
            logout(); // Update global session state
            navigateTo("/");
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    return (
        <div
            className="flex hac vac clickable"
            onClick={handleLogout} disabled={loggingOut} aria-label="Logout">
            <span className="icon"><LogoutIcon height={"13px"} /></span>
            <span>{loggingOut ? "Logging out..." : `Logout ${username()}`}</span>
        </div>
    );
}

export { Logout };
