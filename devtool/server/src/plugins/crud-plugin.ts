import { Router } from 'express';
import type { DevToolsPlugin, PluginDependencies } from '../types.js';
import { developmentOnly } from '../middleware/development-guard.js';
import { FEATURES, createFeatureCrudRoutes } from '../utils/crud-generator.js';

/**
 * Core CRUD plugin for DevTools
 * Provides auto-generated CRUD endpoints for features
 */
export class CrudPlugin implements DevToolsPlugin {
    name = 'crud';
    version = '1.0.0';

    async initialize(dependencies: PluginDependencies): Promise<void> {
        const { app, database, config } = dependencies;
        const router = Router();

        // Apply development-only guard to all routes
        router.use(developmentOnly);

        // List available features
        router.get('/features', (_req, res) => {
            const enabledFeatures = Object.entries(FEATURES)
                .filter(([key]) => config.features[key as keyof typeof config.features])
                .map(([, feature]) => ({
                    name: feature.name,
                    displayName: feature.displayName,
                    tableName: feature.tableName
                }));

            res.json({
                ok: true,
                features: enabledFeatures
            });
        });

        // Register CRUD routes for enabled features
        Object.entries(FEATURES).forEach(([key, feature]) => {
            if (config.features[key as keyof typeof config.features]) {
                createFeatureCrudRoutes(router, feature, database);
                console.log(`[DevTools] Registered CRUD routes for ${feature.displayName}`);
            }
        });

        // Mount router at configured prefix
        app.use(config.apiPrefix, router);
        console.log(`[DevTools] CRUD plugin initialized at ${config.apiPrefix}`);
    }
}
