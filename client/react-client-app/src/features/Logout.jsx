import { useState } from "react";

function Logout({ username, onLogout }) {
    const [loggingOut, setLoggingOut] = useState(false);
    const [loggedOut, setLoggedOut] = useState(false);

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await onLogout();
            setLoggedOut(true);
        } catch (err) {
            setLoggingOut(false);
            console.error("Logout failed:", err);
        }
    }

    if (loggedOut) {
        return (
            <div className="flex hac vac">
                <p style={{ color: "green", fontSize: "1.2em" }}>✓ Logged out successfully!</p>
            </div>
        );
    }

    return (
        <div>
            <button type="button" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? "Logging out..." : `Logout ${username()}`}
            </button>
        </div>
    );
}

export { Logout };
