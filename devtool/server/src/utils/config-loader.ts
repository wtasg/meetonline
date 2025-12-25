import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { DevToolsConfig } from '../types.js';

/**
 * Default configuration
 */
const defaultConfig: DevToolsConfig = {
    enabled: true,
    features: {
        users: true,
        events: true,
        groups: true,
        profiles: true
    },
    apiPrefix: '/devtools'
};

/**
 * Load DevTools configuration from file or use defaults
 */
export function loadConfig(configPath?: string): DevToolsConfig {
    if (!configPath) {
        return defaultConfig;
    }

    const resolvedPath = resolve(configPath);
    
    if (!existsSync(resolvedPath)) {
        console.warn(`DevTools config file not found at ${resolvedPath}, using defaults`);
        return defaultConfig;
    }

    try {
        const fileContent = readFileSync(resolvedPath, 'utf-8');
        const userConfig = JSON.parse(fileContent) as Partial<DevToolsConfig>;
        
        return {
            ...defaultConfig,
            ...userConfig,
            features: {
                ...defaultConfig.features,
                ...userConfig.features
            }
        };
    } catch (error) {
        console.error(`Error loading DevTools config from ${resolvedPath}:`, error);
        return defaultConfig;
    }
}
