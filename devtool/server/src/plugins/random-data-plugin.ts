/**
 * Random Data Generator Plugin
 * Provides endpoints for generating random test data
 */

import type { Request, Response } from 'express';
import type { DevToolsPlugin, PluginDependencies, RandomDataConfig } from '../types.js';
import {
    generateUsers,
    generateUserProfiles,
    generateEvents,
    generateGroups,
    clearAllData
} from '../utils/random-data-generator.js';

export class RandomDataPlugin implements DevToolsPlugin {
    name = 'random-data';
    version = '1.0.0';

    async initialize(dependencies: PluginDependencies): Promise<void> {
        const { app, database, config } = dependencies;
        const randomCfg: RandomDataConfig | undefined = config.randomData;

        // Expose config for clients
        app.get('/devtools/random-data/config', (_req: Request, res: Response) => {
            if (!randomCfg) {
                return res.status(400).json({
                    ok: false,
                    data: null,
                    message: 'Random data config not provided. Add `randomData` to devtool config.'
                });
            }
            res.json({ ok: true, data: randomCfg, message: 'OK' });
        });

        // Generate random data
        app.post('/devtools/random-data/generate', async (req: Request, res: Response) => {
            try {
                if (!randomCfg) {
                    return res.status(400).json({
                        ok: false,
                        data: null,
                        message: 'Random data config not provided. Add `randomData` to devtool config.'
                    });
                }
                const defaultCounts = randomCfg.defaults || {};
                const { users = defaultCounts.users ?? 10, events = defaultCounts.events ?? 20, groups = defaultCounts.groups ?? 5 } = req.body || {};

                console.log(`[DevTools] Generating random data: ${users} users, ${events} events, ${groups} groups`);

                // Generate users first
                const userIds = await generateUsers(database, users, randomCfg);

                // Generate profiles for users and collect profile IDs
                const profileIds = await generateUserProfiles(database, userIds, randomCfg);

                // Generate events and groups using profile IDs
                let eventsCreated = 0;
                let groupsCreated = 0;

                if (profileIds.length > 0) {
                    eventsCreated = await generateEvents(database, profileIds, events, randomCfg);
                    groupsCreated = await generateGroups(database, profileIds, groups, randomCfg);
                }

                res.json({
                    ok: true,
                    data: {
                        users: userIds.length,
                        events: eventsCreated,
                        groups: groupsCreated
                    },
                    message: 'Random data generated successfully'
                });
            } catch (error) {
                console.error('[DevTools] Error generating random data:', error);
                res.status(500).json({
                    ok: false,
                    data: null,
                    message: error instanceof Error ? error.message : 'Failed to generate random data'
                });
            }
        });

        // Clear all data
        app.delete('/devtools/random-data/clear', async (_req: Request, res: Response) => {
            try {
                console.log('[DevTools] Clearing all data...');
                if (!randomCfg) {
                    return res.status(400).json({
                        ok: false,
                        data: null,
                        message: 'Random data config not provided. Add `randomData` to devtool config.'
                    });
                }
                await clearAllData(database, randomCfg);

                res.json({
                    ok: true,
                    data: null,
                    message: 'All data cleared successfully'
                });
            } catch (error) {
                console.error('[DevTools] Error clearing data:', error);
                res.status(500).json({
                    ok: false,
                    data: null,
                    message: error instanceof Error ? error.message : 'Failed to clear data'
                });
            }
        });

        console.log('[DevTools] Random data endpoints registered at /devtools/random-data/*');
    }
}
