import type { DevToolsClientConfig } from '../types';

/**
 * Default configuration
 */
const defaultConfig: DevToolsClientConfig = {
    enabled: true,
    position: 'bottom-right',
    features: {
        users: true,
        events: true,
        groups: true,
        profiles: true
    },
    apiUrl: '/devtools'
};

/**
 * Load configuration (can be extended to load from file)
 */
export function loadClientConfig(userConfig?: Partial<DevToolsClientConfig>): DevToolsClientConfig {
    return {
        ...defaultConfig,
        ...userConfig,
        features: {
            ...defaultConfig.features,
            ...userConfig?.features
        }
    };
}
