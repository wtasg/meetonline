import { createContext, useState, useCallback } from "react";
import { hasUserSession as checkSession } from "../utils/session";

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

    return (
        <SessionContext.Provider value={{ hasSession, setSession, refreshSession, login, logout }}>
            {children}
        </SessionContext.Provider>
    );
}

export { SessionContext, SessionProvider };
