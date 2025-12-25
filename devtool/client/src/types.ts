/**
 * Configuration for client DevTools
 */
export interface DevToolsClientConfig {
    enabled: boolean;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    features: {
        users?: boolean;
        events?: boolean;
        groups?: boolean;
        profiles?: boolean;
    };
    apiUrl?: string;
}

/**
 * Dependencies for client plugins
 */
export interface ClientPluginDependencies {
    store?: any;
    router?: any;
    config: DevToolsClientConfig;
}

/**
 * Base interface for client plugins
 */
export interface ClientPlugin {
    name: string;
    version: string;
    component?: React.ComponentType<any>;
    initialize?(dependencies: ClientPluginDependencies): void | Promise<void>;
}

/**
 * Feature definition for CRUD UI
 */
export interface FeatureDefinition {
    name: string;
    displayName: string;
    icon?: string;
    fields: FieldDefinition[];
}

/**
 * Field definition for CRUD forms
 */
export interface FieldDefinition {
    name: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'textarea' | 'date' | 'datetime-local';
    required?: boolean;
    readonly?: boolean;
}
