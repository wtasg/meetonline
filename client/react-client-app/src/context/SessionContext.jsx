import { createContext, useState, useCallback } from "react";
import { hasUserSession as checkSession, username as getUsername, displayName as getDisplayName } from "../utils/session";
import { fetchUserSettings } from "../net/userSettings.js";
import { applyThemeConfig } from "../utils/theme.ts";

const SessionContext = createContext(null);

/**
 * Provider component that manages session state globally
 */
function SessionProvider({ children }) {
    const [hasSession, setHasSession] = useState(checkSession());
    const [loading, setLoading] = useState(false);

    const setSession = useCallback((hasSession) => {
        setHasSession(hasSession);
    }, []);

    const refreshSession = useCallback(() => {
        setHasSession(checkSession());
    }, []);

    const login = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchUserSettings();
            if (response.user_settings) {
                applyThemeConfig(response.user_settings);
            }
            setHasSession(true);
        } catch (error) {
            console.error("Failed to load user settings:", error);
            // Still set session as true so user isn't stuck efficiently, 
            // though without settings applied
            setHasSession(true);
        } finally {
            setLoading(false);
        }
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
        <SessionContext.Provider value={{ hasSession, setSession, refreshSession, login, logout, username, displayName, loading }}>
            {children}
        </SessionContext.Provider>
    );
}

export { SessionContext, SessionProvider };
