import "./App.css";
import "./features/UserSettings.css";

import { useEffect } from "react";
import { Menu } from "./features/Menu";
import { Content } from "./features/Content";
import { navigateTo } from "./hooks/useNavigate";
import { applyFontSize, applyFontContrast, settingsStorage } from "./utils/settings";

function App() {
    // Apply stored settings on app load
    useEffect(() => {
        const storedFontSize = settingsStorage.retrieve("fontSize");
        const storedFontContrast = settingsStorage.retrieve("fontContrast");

        if (storedFontSize) applyFontSize(storedFontSize);
        if (storedFontContrast) applyFontContrast(storedFontContrast);
    }, []);

    return (
        <div className="vflex">
            <header className="header flex sb">
                <div className="flex vac hac fs4 fwb clickable" onClick={() => navigateTo("/")}>MeetOnline</div>
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
