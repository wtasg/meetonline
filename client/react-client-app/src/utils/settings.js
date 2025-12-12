import { Storage } from "./storage.js";

const settingsStorage = new Storage(["local", "cookie"]);

function applyTheme(theme) {
    if (theme === "system") {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }
    settingsStorage.store("theme", theme);
}

function applyFontSize(fontSize) {
    const fontSizeMap = {
        "small": "14px",
        "medium": "16px",
        "large": "18px",
        "x-large": "20px"
    };
    document.documentElement.style.fontSize = fontSizeMap[fontSize] || "16px";
    settingsStorage.store("fontSize", fontSize);
}

function applyFontContrast(fontContrast) {
    const contrastMap = {
        "low": "0.8",
        "normal": "1",
        "high": "1.2"
    };
    document.documentElement.style.setProperty("--font-contrast", contrastMap[fontContrast] || "1");
    settingsStorage.store("fontContrast", fontContrast);
}

export { settingsStorage, applyTheme, applyFontSize, applyFontContrast };
