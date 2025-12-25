/**
 * DevTools Integration for Server
 * 
 * This file handles the integration of DevTools with the main server application.
 * It's designed to be imported and called only in development mode.
 */

import { resolve } from "path";
import { projectRoot } from "./projectRoot.js";

/**
 * Register DevTools plugins with the application
 * Only works in development mode
 * 
 * @param {import('express').Application} app - Express application
 * @param {import('pg').Pool} database - Database connection pool
 */
export async function setupDevTools(app, database) {
    // Only register in development mode
    if (process.env.NODE_ENV !== "development") {
        console.log("[DevTools] Not in development mode, skipping registration");
        return;
    }

    try {
        // Try to dynamically import devtools
        // This will use Node's module resolution to find the package
        const { registerDevToolsPlugins } = await import("@meetonline/devtools-server");
        
        const configPath = resolve(projectRoot, "devtool.config.json");
        
        await registerDevToolsPlugins(app, {
            database,
            config: configPath
        });
        
        console.log("[DevTools] Successfully registered");
    } catch (error) {
        // Graceful failure if devtools not installed
        if (error.code === "ERR_MODULE_NOT_FOUND" || error.code === "MODULE_NOT_FOUND") {
            console.log("[DevTools] Package not found. To use DevTools:");
            console.log("  1. cd devtool && ./install.sh");
            console.log("  Or manually:");
            console.log("  2. cd devtool/server && npm install && npm run build && npm link");
            console.log("  3. cd server/node-server-app && npm link @meetonline/devtools-server");
        } else {
            console.warn("[DevTools] Failed to register:", error.message);
        }
    }
}
