/**
 * DevTools Integration Component
 * 
 * Dynamically loads and renders DevTools UI in development mode only.
 * This approach avoids bundling DevTools in production builds.
 */

import { lazy, Suspense } from "react";

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === "development" || 
                      import.meta.env.DEV === true ||
                      process.env.NODE_ENV === "development";

// Lazy load DevToolsPanel only if in development
let DevToolsPanel: React.ComponentType | null = null;

if (isDevelopment) {
    try {
        // Try to import devtools - this will fail gracefully if not linked
        DevToolsPanel = lazy(async () => {
            try {
                const module = await import("@meetonline/devtools-client");
                return { default: module.DevToolsPanel };
            } catch {
                console.log("[DevTools] Not available. To install:");
                console.log("  1. cd ../../devtool/client && npm install && npm run build && npm link");
                console.log("  2. cd ../../client/react-client-app && npm link @meetonline/devtools-client");
                // Return empty component if import fails
                return { default: () => null };
            }
        });
    } catch (error) {
        console.warn("[DevTools] Failed to load:", error);
    }
}

/**
 * DevTools component wrapper
 * Only renders in development mode
 */
export function DevTools() {
    if (!isDevelopment || !DevToolsPanel) {
        return null;
    }

    return (
        <Suspense fallback={null}>
            <DevToolsPanel
                config={{
                    enabled: true,
                    position: "bottom-right",
                    apiUrl: "/devtools"
                }}
            />
        </Suspense>
    );
}
