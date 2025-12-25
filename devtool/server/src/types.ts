import type { Application } from 'express';
import type { Pool } from 'pg';

/**
 * Configuration for DevTools
 */
export interface DevToolsConfig {
    enabled: boolean;
    features: {
        users?: boolean;
        events?: boolean;
        groups?: boolean;
        profiles?: boolean;
    };
    apiPrefix: string;
}

/**
 * Dependencies provided to plugins during initialization
 */
export interface PluginDependencies {
    app: Application;
    database: Pool;
    config: DevToolsConfig;
}

/**
 * Base interface for DevTools plugins
 */
export interface DevToolsPlugin {
    name: string;
    version: string;
    initialize(dependencies: PluginDependencies): void | Promise<void>;
}

/**
 * Feature metadata for CRUD operations
 */
export interface FeatureMetadata {
    name: string;
    tableName: string;
    idColumn: string;
    columns: string[];
    displayName: string;
}
