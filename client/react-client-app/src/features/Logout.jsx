import { useState } from "react";
import { LogOut } from "lucide-react";
import { useSession } from "../hooks/useSession";
import { navigateTo } from "../hooks/useNavigate";
import { logoutAction } from "../actions/authActions";

function Logout() {
    const { logout } = useSession();
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await logoutAction();
            logout();
            navigateTo("/");
        } catch (err) {
            console.error(err);
            setLoggingOut(false);
        }
    }

    return (
        <>
            <LogOut size={16} />
            <span
                onClick={handleLogout}
                className={`logout-text ${loggingOut ? "" : "clickable"}`}
            >
                {loggingOut ? "Logging out..." : "Logout"}
            </span>
        </>
    );
}

export { Logout };
