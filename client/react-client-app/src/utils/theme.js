import { Storage } from "./storage.js";

const themeStorage = new Storage(["local", "cookie"]);

/**
 * Apply theme (color palette) to the document
 * @param {string} theme - Theme name: gray, teal, pink
 */
function applyTheme(theme) {
    const validThemes = ["gray", "teal", "pink"];
    if (!validThemes.includes(theme)) {
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
 */
function applyScheme(scheme) {
    const validSchemes = ["light", "dark", "high-contrast"];
    if (!validSchemes.includes(scheme)) {
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
 */
function applyFilter(filter) {
    const validFilters = ["default", "natural", "vivid", "muted"];
    if (!validFilters.includes(filter)) {
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
 * @param {Object} config - Theme configuration
 * @param {string} config.theme - Theme name
 * @param {string} config.scheme - Scheme name
 * @param {string} config.filter - Filter name
 */
function applyThemeConfig(config) {
    if (config.theme) applyTheme(config.theme);
    if (config.scheme) applyScheme(config.scheme);
    if (config.filter) applyFilter(config.filter);
}

/**
 * Get current theme configuration from storage
 * @returns {Object} Current theme configuration
 */
function getStoredThemeConfig() {
    return {
        theme: themeStorage.retrieve("theme") || "gray",
        scheme: themeStorage.retrieve("scheme") || "light",
        filter: themeStorage.retrieve("filter") || "default"
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
