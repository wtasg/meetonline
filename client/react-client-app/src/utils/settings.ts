import { Storage } from "./storage";

type FontSize = "small" | "medium" | "large" | "x-large";
type FontContrast = "low" | "normal" | "high";

const settingsStorage = new Storage(["local", "cookie"]);

const fontSizeMap: Record<FontSize, string> = {
    "small": "14px",
    "medium": "16px",
    "large": "18px",
    "x-large": "20px"
};

const contrastMap: Record<FontContrast, string> = {
    "low": "0.8",
    "normal": "1",
    "high": "1.2"
};

/**
 * Apply font size to the document
 * @param {string} fontSize - Font size setting
 * @returns {void}
 */
function applyFontSize(fontSize: string): void {
    document.documentElement.style.fontSize = fontSizeMap[fontSize as FontSize] || "16px";
    settingsStorage.store("fontSize", fontSize);
}

/**
 * Apply font contrast to the document
 * @param {string} fontContrast - Font contrast setting
 * @returns {void}
 */
function applyFontContrast(fontContrast: string): void {
    document.documentElement.style.setProperty("--font-contrast", contrastMap[fontContrast as FontContrast] || "1");
    settingsStorage.store("fontContrast", fontContrast);
}

export { settingsStorage, applyFontSize, applyFontContrast };
export type { FontSize, FontContrast };
