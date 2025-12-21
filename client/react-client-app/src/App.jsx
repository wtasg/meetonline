import "./styles/index.css";

import { useEffect } from "react";
import { Menu } from "./features/Menu";
import { Content } from "./features/Content";
import { navigateTo } from "./hooks/useNavigate";
import { applyFontSize, applyFontContrast, settingsStorage } from "./utils/settings";
import { applyThemeConfig, getStoredThemeConfig } from "./utils/theme";

function App() {
    // Apply stored settings on app load
    useEffect(() => {
        const storedFontSize = settingsStorage.retrieve("fontSize");
        const storedFontContrast = settingsStorage.retrieve("fontContrast");
        const storedThemeConfig = getStoredThemeConfig();

        if (storedFontSize) applyFontSize(storedFontSize);
        if (storedFontContrast) applyFontContrast(storedFontContrast);

        // Apply stored theme configuration
        applyThemeConfig(storedThemeConfig);
    }, []);

    return (
        <div className="vflex min-h-screen">
            <header className="header flex sb vac px-3">
                <div className="flex vac hac clickable" onClick={() => navigateTo("/")}>MeetOnline</div>
                <Menu />
            </header>
            <main className="flex-1">
                <Content />
            </main>
        </div>
    );
}

export default App;
