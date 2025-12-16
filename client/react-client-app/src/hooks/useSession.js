import { useContext } from "react";
import { SessionContext } from "../context/SessionContext.jsx";

/**
 * Hook to access session state and update functions
 * @returns {{ hasSession: boolean, setSession: function, refreshSession: function, login: function, logout: function }}
 */
function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}

export { useSession };
