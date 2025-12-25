import type { Application } from 'express';
import type { Pool } from 'pg';
import type { DevToolsPlugin, DevToolsConfig } from './types.js';
import { loadConfig } from './utils/config-loader.js';
import { CrudPlugin } from './plugins/crud-plugin.js';
import { RandomDataPlugin } from './plugins/random-data-plugin.js';

/**
 * Registry of available plugins
 */
const plugins: DevToolsPlugin[] = [
    new CrudPlugin(),
    new RandomDataPlugin()
];

/**
 * Options for registering DevTools
 */
export interface RegisterOptions {
    database: Pool;
    config?: string | DevToolsConfig;
}

/**
 * Register DevTools plugins with the Express application
 *
 * @param app - Express application instance
 * @param options - Configuration options
 *
 * @example
 * ```typescript
 * import { registerDevToolsPlugins } from '@meetonline/devtools-server';
 *
 * if (process.env.NODE_ENV === 'development') {
 *     registerDevToolsPlugins(app, {
 *         database: pool,
 *         config: './devtool.config.json'
 *     });
 * }
 * ```
 */
export async function registerDevToolsPlugins(
    app: Application,
    options: RegisterOptions
): Promise<void> {
    // Only register in development mode
    if (process.env.NODE_ENV !== 'development') {
        console.log('[DevTools] Skipping registration (not in development mode)');
        return;
    }

    // Load configuration
    const config = typeof options.config === 'string'
        ? loadConfig(options.config)
        : options.config || loadConfig();

    if (!config.enabled) {
        console.log('[DevTools] Disabled via configuration');
        return;
    }

    console.log('[DevTools] Registering plugins...');

    // Initialize all plugins
    for (const plugin of plugins) {
        try {
            await plugin.initialize({
                app,
                database: options.database,
                config
            });
            console.log(`[DevTools] Plugin "${plugin.name}" v${plugin.version} registered`);
        } catch (error) {
            console.error(`[DevTools] Failed to register plugin "${plugin.name}":`, error);
        }
    }

    console.log('[DevTools] All plugins registered');
}

/**
 * Register a custom plugin
 *
 * @param plugin - Custom plugin to register
 *
 * @example
 * ```typescript
 * import { registerCustomPlugin } from '@meetonline/devtools-server';
 *
 * registerCustomPlugin({
 *     name: 'my-plugin',
 *     version: '1.0.0',
 *     initialize: async ({ app, database, config }) => {
 *         // Plugin initialization logic
 *     }
 * });
 * ```
 */
export function registerCustomPlugin(plugin: DevToolsPlugin): void {
    plugins.push(plugin);
    console.log(`[DevTools] Custom plugin "${plugin.name}" added to registry`);
}

// Re-export types for consumers
export type { DevToolsPlugin, PluginDependencies, DevToolsConfig, FeatureMetadata } from './types.js';
