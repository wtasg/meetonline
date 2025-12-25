import type { Router } from 'express';
import type { Pool } from 'pg';
import type { FeatureMetadata } from '../types.js';

/**
 * Feature definitions for CRUD operations
 */
export const FEATURES: Record<string, FeatureMetadata> = {
    users: {
        name: 'users',
        tableName: 'user_account',
        idColumn: 'id',
        columns: ['id', 'username', 'email', 'created_at', 'updated_at'],
        displayName: 'Users'
    },
    events: {
        name: 'events',
        tableName: 'event',
        idColumn: 'id',
        columns: ['id', 'title', 'description', 'creator_id', 'start_time', 'end_time', 'location', 'created_at', 'updated_at'],
        displayName: 'Events'
    },
    groups: {
        name: 'groups',
        tableName: '"group"',
        idColumn: 'id',
        columns: ['id', 'group_name', 'description', 'creator_id', 'created_at', 'updated_at'],
        displayName: 'Groups'
    },
    profiles: {
        name: 'profiles',
        tableName: 'user_profile',
        idColumn: 'id',
        columns: ['id', 'user_id', 'display_name', 'bio', 'avatar_url', 'created_at', 'updated_at'],
        displayName: 'User Profiles'
    }
};

/**
 * Create CRUD routes for a feature
 */
export function createFeatureCrudRoutes(
    router: Router,
    feature: FeatureMetadata,
    database: Pool
): void {
    const { name, tableName, idColumn, columns } = feature;

    // List all items
    router.get(`/${name}`, async (req, res) => {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            
            const query = `SELECT * FROM ${tableName} ORDER BY ${idColumn} DESC LIMIT $1 OFFSET $2`;
            const result = await database.query(query, [limit, offset]);
            
            res.json({
                ok: true,
                [name]: result.rows,
                count: result.rows.length,
                limit,
                offset
            });
        } catch (error) {
            console.error(`Error listing ${name}:`, error);
            res.status(500).json({
                ok: false,
                message: `Failed to list ${name}`,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Get single item
    router.get(`/${name}/:id`, async (req, res) => {
        try {
            const { id } = req.params;
            const query = `SELECT * FROM ${tableName} WHERE ${idColumn} = $1`;
            const result = await database.query(query, [id]);
            
            if (result.rows.length === 0) {
                res.status(404).json({
                    ok: false,
                    message: `${feature.displayName} not found`
                });
                return;
            }
            
            res.json({
                ok: true,
                [name.slice(0, -1)]: result.rows[0]
            });
        } catch (error) {
            console.error(`Error getting ${name}:`, error);
            res.status(500).json({
                ok: false,
                message: `Failed to get ${name}`,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Create item
    router.post(`/${name}`, async (req, res) => {
        try {
            const data = req.body;
            const dataColumns = Object.keys(data).filter(col => 
                columns.includes(col) && col !== idColumn
            );
            
            if (dataColumns.length === 0) {
                res.status(400).json({
                    ok: false,
                    message: 'No valid columns provided'
                });
                return;
            }
            
            const placeholders = dataColumns.map((_, i) => `$${i + 1}`).join(', ');
            const columnList = dataColumns.join(', ');
            const values = dataColumns.map(col => data[col]);
            
            const query = `INSERT INTO ${tableName} (${columnList}) VALUES (${placeholders}) RETURNING *`;
            const result = await database.query(query, values);
            
            res.status(201).json({
                ok: true,
                [name.slice(0, -1)]: result.rows[0],
                message: `${feature.displayName} created successfully`
            });
        } catch (error) {
            console.error(`Error creating ${name}:`, error);
            res.status(500).json({
                ok: false,
                message: `Failed to create ${name}`,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Update item
    router.put(`/${name}/:id`, async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const dataColumns = Object.keys(data).filter(col => 
                columns.includes(col) && col !== idColumn
            );
            
            if (dataColumns.length === 0) {
                res.status(400).json({
                    ok: false,
                    message: 'No valid columns to update'
                });
                return;
            }
            
            const setClause = dataColumns.map((col, i) => `${col} = $${i + 1}`).join(', ');
            const values = [...dataColumns.map(col => data[col]), id];
            
            const query = `UPDATE ${tableName} SET ${setClause}, updated_at = NOW() WHERE ${idColumn} = $${values.length} RETURNING *`;
            const result = await database.query(query, values);
            
            if (result.rows.length === 0) {
                res.status(404).json({
                    ok: false,
                    message: `${feature.displayName} not found`
                });
                return;
            }
            
            res.json({
                ok: true,
                [name.slice(0, -1)]: result.rows[0],
                message: `${feature.displayName} updated successfully`
            });
        } catch (error) {
            console.error(`Error updating ${name}:`, error);
            res.status(500).json({
                ok: false,
                message: `Failed to update ${name}`,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Delete item
    router.delete(`/${name}/:id`, async (req, res) => {
        try {
            const { id } = req.params;
            const query = `DELETE FROM ${tableName} WHERE ${idColumn} = $1 RETURNING *`;
            const result = await database.query(query, [id]);
            
            if (result.rows.length === 0) {
                res.status(404).json({
                    ok: false,
                    message: `${feature.displayName} not found`
                });
                return;
            }
            
            res.json({
                ok: true,
                message: `${feature.displayName} deleted successfully`
            });
        } catch (error) {
            console.error(`Error deleting ${name}:`, error);
            res.status(500).json({
                ok: false,
                message: `Failed to delete ${name}`,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
