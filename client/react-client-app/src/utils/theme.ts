import { Storage } from "./storage";

type Theme = "gray" | "teal" | "pink";
type Scheme = "light" | "dark" | "high-contrast";
type Filter = "default" | "natural" | "vivid" | "muted";

interface ThemeConfig {
    theme?: Theme;
    scheme?: Scheme;
    filter?: Filter;
}

const themeStorage = new Storage(["local", "cookie"]);

const validThemes: Theme[] = ["gray", "teal", "pink"];
const validSchemes: Scheme[] = ["light", "dark", "high-contrast"];
const validFilters: Filter[] = ["default", "natural", "vivid", "muted"];

/**
 * Apply theme (color palette) to the document
 * @param {string} theme - Theme name: gray, teal, pink
 * @returns {void}
 */
function applyTheme(theme: string): void {
    if (!validThemes.includes(theme as Theme)) {
        console.warn(`Invalid theme: ${theme}`);
        return;
    }

    const root = document.documentElement;

    // Set data-theme attribute
    if (theme === "gray") {
        root.removeAttribute("data-theme");
    } else {
        root.setAttribute("data-theme", theme);
    }

    themeStorage.store("theme", theme);
}

/**
 * Apply color scheme to the document
 * @param {string} scheme - Scheme name: light, dark, high-contrast
 * @returns {void}
 */
function applyScheme(scheme: string): void {
    if (!validSchemes.includes(scheme as Scheme)) {
        console.warn(`Invalid scheme: ${scheme}`);
        return;
    }

    const root = document.documentElement;

    // Remove all scheme classes
    root.classList.remove("dark", "high-contrast");

    // Add appropriate class
    if (scheme === "dark") {
        root.classList.add("dark");
    } else if (scheme === "high-contrast") {
        root.classList.add("high-contrast");
    }
    // light scheme is the default, no class needed

    themeStorage.store("scheme", scheme);
}

/**
 * Apply color filter to the document
 * @param {string} filter - Filter name: default, natural, vivid, muted
 * @returns {void}
 */
function applyFilter(filter: string): void {
    if (!validFilters.includes(filter as Filter)) {
        console.warn(`Invalid filter: ${filter}`);
        return;
    }

    const root = document.documentElement;

    // Set data-filter attribute
    if (filter === "default") {
        root.removeAttribute("data-filter");
    } else {
        root.setAttribute("data-filter", filter);
    }

    themeStorage.store("filter", filter);
}

/**
 * Apply complete theme configuration
 * @param {ThemeConfig} config - Theme configuration object
 * @returns {void}
 */
function applyThemeConfig(config: ThemeConfig): void {
    if (config.theme) applyTheme(config.theme);
    if (config.scheme) applyScheme(config.scheme);
    if (config.filter) applyFilter(config.filter);
}

/**
 * Get current theme configuration from storage
 * @returns {ThemeConfig} Current theme configuration
 */
function getStoredThemeConfig(): ThemeConfig {
    return {
        theme: (themeStorage.retrieve("theme") as Theme) || "gray",
        scheme: (themeStorage.retrieve("scheme") as Scheme) || "light",
        filter: (themeStorage.retrieve("filter") as Filter) || "default"
    };
}

export {
    themeStorage,
    applyTheme,
    applyScheme,
    applyFilter,
    applyThemeConfig,
    getStoredThemeConfig
};

export type { Theme, Scheme, Filter, ThemeConfig };
