import "./App.css";
import "./features/UserSettings.css";
import "./theme.css";

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
        <div className="vflex">
            <header className="header flex sb">
                <div className="flex vac hac  clickable" onClick={() => navigateTo("/")}>MeetOnline</div>
                <div>
                    <Menu />
                </div>
            </header >
            <section className="content flex">
                <Content />
            </section>
        </div >
    );
}

export default App;
