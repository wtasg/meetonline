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
    randomData?: RandomDataConfig;
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

/**
 * Configuration for random data generation
 * Defines tables, columns, and default counts to avoid hard-coding schema.
 */
export interface RandomDataConfig {
    defaults?: {
        users?: number;
        profiles?: number; // typically tied to users
        events?: number;
        groups?: number;
    };
    tables: {
        userAccount: {
            table: string;
            id: string;
            username: string;
            salt: string;
            password: string;
        };
        userProfile: {
            table: string;
            id: string;
            userId: string;
            profileName: string;
            displayName: string;
            phoneNumber?: string;
            email?: string;
            address?: string;
            websiteUrl?: string;
        };
        event: {
            table: string;
            id?: string;
            organiserProfileId: string; // FK to userProfile.id
            title: string;
            description?: string;
            onlineLocation?: string;
            startAt: string;
            endAt: string;
            isPaid?: string;
            isBroadcast?: string;
            tags?: string;
            categories?: string;
            isInteractive?: string;
            isAnonymous?: string;
        };
        group: {
            table: string;
            id?: string;
            userProfileId: string; // FK to userProfile.id
            groupName: string;
            description?: string;
            isPublic?: string;
        };
    };
}
