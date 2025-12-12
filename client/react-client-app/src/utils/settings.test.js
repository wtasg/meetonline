import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { settingsStorage, applyTheme, applyFontSize, applyFontContrast } from "./settings.js";

describe("settings utilities", () => {
    beforeEach(() => {
        // Mock localStorage
        const mockStorage = {};
        vi.spyOn(window, "localStorage", "get").mockImplementation(() => ({
            setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
            getItem: vi.fn((key) => mockStorage[key] || null),
            removeItem: vi.fn((key) => { delete mockStorage[key]; }),
        }));

        // Mock document.documentElement
        vi.spyOn(document.documentElement, "setAttribute").mockImplementation(() => {});
        vi.spyOn(document.documentElement, "removeAttribute").mockImplementation(() => {});
        vi.spyOn(document.documentElement.style, "setProperty").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("applyTheme", () => {
        it("should remove data-theme attribute for system theme", () => {
            applyTheme("system");
            expect(document.documentElement.removeAttribute).toHaveBeenCalledWith("data-theme");
        });

        it("should set data-theme attribute for non-system theme", () => {
            applyTheme("dark");
            expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-theme", "dark");
        });

        it("should store theme in storage", () => {
            const storeSpy = vi.spyOn(settingsStorage, "store");
            applyTheme("light");
            expect(storeSpy).toHaveBeenCalledWith("theme", "light");
        });
    });

    describe("applyFontSize", () => {
        it("should set correct font size for small", () => {
            applyFontSize("small");
            expect(document.documentElement.style.fontSize).toBe("14px");
        });

        it("should set correct font size for medium", () => {
            applyFontSize("medium");
            expect(document.documentElement.style.fontSize).toBe("16px");
        });

        it("should set correct font size for large", () => {
            applyFontSize("large");
            expect(document.documentElement.style.fontSize).toBe("18px");
        });

        it("should set correct font size for x-large", () => {
            applyFontSize("x-large");
            expect(document.documentElement.style.fontSize).toBe("20px");
        });

        it("should default to 16px for unknown font size", () => {
            applyFontSize("unknown");
            expect(document.documentElement.style.fontSize).toBe("16px");
        });

        it("should store font size in storage", () => {
            const storeSpy = vi.spyOn(settingsStorage, "store");
            applyFontSize("large");
            expect(storeSpy).toHaveBeenCalledWith("fontSize", "large");
        });
    });

    describe("applyFontContrast", () => {
        it("should set correct contrast value for low", () => {
            applyFontContrast("low");
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith("--font-contrast", "0.8");
        });

        it("should set correct contrast value for normal", () => {
            applyFontContrast("normal");
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith("--font-contrast", "1");
        });

        it("should set correct contrast value for high", () => {
            applyFontContrast("high");
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith("--font-contrast", "1.2");
        });

        it("should default to 1 for unknown contrast", () => {
            applyFontContrast("unknown");
            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith("--font-contrast", "1");
        });

        it("should store font contrast in storage", () => {
            const storeSpy = vi.spyOn(settingsStorage, "store");
            applyFontContrast("high");
            expect(storeSpy).toHaveBeenCalledWith("fontContrast", "high");
        });
    });
});
