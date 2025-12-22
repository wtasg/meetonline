import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    themeStorage,
    applyTheme,
    applyScheme,
    applyFilter,
    applyThemeConfig,
    getStoredThemeConfig
} from "./theme";

describe("theme utilities", () => {
    beforeEach(() => {
        // Mock localStorage
        const mockStorage: Record<string, string> = {};
        vi.spyOn(window, "localStorage", "get").mockImplementation(() => ({
            setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
            getItem: vi.fn((key: string) => mockStorage[key] || null),
            removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
            clear: vi.fn(),
            key: vi.fn(),
            length: 0
        }));

        // Mock document.documentElement methods
        vi.spyOn(document.documentElement, "setAttribute").mockImplementation(() => { });
        vi.spyOn(document.documentElement, "removeAttribute").mockImplementation(() => { });
        vi.spyOn(document.documentElement.classList, "add").mockImplementation(() => { });
        vi.spyOn(document.documentElement.classList, "remove").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("applyTheme", () => {
        it("should set data-theme attribute for teal", () => {
            applyTheme("teal");
            expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-theme", "teal");
        });

        it("should set data-theme attribute for pink", () => {
            applyTheme("pink");
            expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-theme", "pink");
        });

        it("should remove data-theme attribute for gray (default)", () => {
            applyTheme("gray");
            expect(document.documentElement.removeAttribute).toHaveBeenCalledWith("data-theme");
        });

        it("should warn and not apply invalid theme", () => {
            const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
            applyTheme("invalid");
            expect(warnSpy).toHaveBeenCalledWith("Invalid theme: invalid");
            expect(document.documentElement.setAttribute).not.toHaveBeenCalled();
        });

        it("should store theme in storage", () => {
            const storeSpy = vi.spyOn(themeStorage, "store");
            applyTheme("teal");
            expect(storeSpy).toHaveBeenCalledWith("theme", "teal");
        });
    });

    describe("applyScheme", () => {
        it("should add dark class for dark scheme", () => {
            applyScheme("dark");
            expect(document.documentElement.classList.remove).toHaveBeenCalledWith("dark", "high-contrast");
            expect(document.documentElement.classList.add).toHaveBeenCalledWith("dark");
        });

        it("should add high-contrast class for high-contrast scheme", () => {
            applyScheme("high-contrast");
            expect(document.documentElement.classList.remove).toHaveBeenCalledWith("dark", "high-contrast");
            expect(document.documentElement.classList.add).toHaveBeenCalledWith("high-contrast");
        });

        it("should only remove classes for light scheme (default)", () => {
            applyScheme("light");
            expect(document.documentElement.classList.remove).toHaveBeenCalledWith("dark", "high-contrast");
            expect(document.documentElement.classList.add).not.toHaveBeenCalled();
        });

        it("should warn and not apply invalid scheme", () => {
            const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
            applyScheme("invalid");
            expect(warnSpy).toHaveBeenCalledWith("Invalid scheme: invalid");
        });

        it("should store scheme in storage", () => {
            const storeSpy = vi.spyOn(themeStorage, "store");
            applyScheme("dark");
            expect(storeSpy).toHaveBeenCalledWith("scheme", "dark");
        });
    });

    describe("applyFilter", () => {
        it("should set data-filter attribute for natural", () => {
            applyFilter("natural");
            expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-filter", "natural");
        });

        it("should set data-filter attribute for vivid", () => {
            applyFilter("vivid");
            expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-filter", "vivid");
        });

        it("should set data-filter attribute for muted", () => {
            applyFilter("muted");
            expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-filter", "muted");
        });

        it("should remove data-filter attribute for default", () => {
            applyFilter("default");
            expect(document.documentElement.removeAttribute).toHaveBeenCalledWith("data-filter");
        });

        it("should warn and not apply invalid filter", () => {
            const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
            applyFilter("invalid");
            expect(warnSpy).toHaveBeenCalledWith("Invalid filter: invalid");
            expect(document.documentElement.setAttribute).not.toHaveBeenCalled();
        });

        it("should store filter in storage", () => {
            const storeSpy = vi.spyOn(themeStorage, "store");
            applyFilter("vivid");
            expect(storeSpy).toHaveBeenCalledWith("filter", "vivid");
        });
    });

    describe("applyThemeConfig", () => {
        it("should apply full theme config", () => {
            const themeSpy = vi.spyOn(themeStorage, "store");
            applyThemeConfig({ theme: "teal", scheme: "dark", filter: "vivid" });
            expect(themeSpy).toHaveBeenCalledWith("theme", "teal");
            expect(themeSpy).toHaveBeenCalledWith("scheme", "dark");
            expect(themeSpy).toHaveBeenCalledWith("filter", "vivid");
        });

        it("should apply partial theme config", () => {
            const themeSpy = vi.spyOn(themeStorage, "store");
            applyThemeConfig({ scheme: "dark" });
            expect(themeSpy).toHaveBeenCalledWith("scheme", "dark");
        });
    });

    describe("getStoredThemeConfig", () => {
        it("should return default values when storage is empty", () => {
            const retrieveSpy = vi.spyOn(themeStorage, "retrieve");
            retrieveSpy.mockReturnValue(null);

            const config = getStoredThemeConfig();
            expect(config.theme).toBe("gray");
            expect(config.scheme).toBe("light");
            expect(config.filter).toBe("default");
        });

        it("should return stored values", () => {
            const retrieveSpy = vi.spyOn(themeStorage, "retrieve");
            retrieveSpy.mockReturnValueOnce("teal");
            retrieveSpy.mockReturnValueOnce("dark");
            retrieveSpy.mockReturnValueOnce("vivid");

            const config = getStoredThemeConfig();
            expect(config.theme).toBe("teal");
            expect(config.scheme).toBe("dark");
            expect(config.filter).toBe("vivid");
        });
    });
});
