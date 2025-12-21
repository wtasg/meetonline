import { createContext, useState, useCallback } from "react";
import { hasUserSession as checkSession, username as getUsername, displayName as getDisplayName } from "../utils/session";

const SessionContext = createContext(null);

/**
 * Provider component that manages session state globally
 */
function SessionProvider({ children }) {
    const [hasSession, setHasSession] = useState(checkSession());

    const setSession = useCallback((hasSession) => {
        setHasSession(hasSession);
    }, []);

    const refreshSession = useCallback(() => {
        setHasSession(checkSession());
    }, []);

    const login = useCallback(() => {
        setHasSession(true);
    }, []);

    const logout = useCallback(() => {
        setHasSession(false);
    }, []);

    const username = useCallback(() => {
        return checkSession() ? getUsername() : null;
    }, []);

    const displayName = useCallback(() => {
        return checkSession() ? getDisplayName() : null;
    }, []);

    return (
        <SessionContext.Provider value={{ hasSession, setSession, refreshSession, login, logout, username, displayName }}>
            {children}
        </SessionContext.Provider>
    );
}

export { SessionContext, SessionProvider };
