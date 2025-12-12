import "./App.css";
import "./features/UserSettings.css";
import "./themes/index.css";
import { useState, useEffect } from "react";
import { Menu } from "./features/Menu";
import { Content } from "./features/Content";
import { navigateTo } from "./hooks/useNavigate";
import { UserSettings } from "./features/UserSettings";
import { applyTheme, applyFontSize, applyFontContrast, settingsStorage } from "./utils/settings";
import { hasUserSession } from "./utils/session";

function App() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const hasSession = hasUserSession();

    // Apply stored settings on app load
    useEffect(() => {
        const storedTheme = settingsStorage.retrieve("theme");
        const storedFontSize = settingsStorage.retrieve("fontSize");
        const storedFontContrast = settingsStorage.retrieve("fontContrast");

        if (storedTheme) applyTheme(storedTheme);
        if (storedFontSize) applyFontSize(storedFontSize);
        if (storedFontContrast) applyFontContrast(storedFontContrast);
    }, []);

    return (
        <div className="vflex">
            <header className="header flex sb">
                <div className="flex vac hac m0_2 fs4 fwb clickable" onClick={() => navigateTo("/")}>MeetOnline</div>
                <div>
                    <Menu />
                </div>
            </header >
            <section className="content flex">
                <Content />
            </section>
            <footer className="footer flex vac hac">
                {hasSession && (
                    <button
                        className="footer-settings-btn"
                        onClick={() => setIsSettingsOpen(true)}
                        aria-label="Open settings"
                    >
                        <span className="settings-icon">⚙</span>
                        <span>Settings</span>
                    </button>
                )}
            </footer>
            <UserSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div >
    );
}

export default App;
