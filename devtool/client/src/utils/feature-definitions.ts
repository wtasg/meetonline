import type { FeatureDefinition } from '../types';

/**
 * Feature definitions for CRUD operations
 */
export const FEATURE_DEFINITIONS: Record<string, FeatureDefinition> = {
    users: {
        name: 'users',
        displayName: 'Users',
        icon: '👤',
        fields: [
            { name: 'username', label: 'Username', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'created_at', label: 'Created At', type: 'datetime-local', readonly: true },
            { name: 'updated_at', label: 'Updated At', type: 'datetime-local', readonly: true }
        ]
    },
    events: {
        name: 'events',
        displayName: 'Events',
        icon: '📅',
        fields: [
            { name: 'title', label: 'Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'creator_id', label: 'Creator ID', type: 'text', required: true },
            { name: 'start_time', label: 'Start Time', type: 'datetime-local' },
            { name: 'end_time', label: 'End Time', type: 'datetime-local' },
            { name: 'location', label: 'Location', type: 'text' },
            { name: 'created_at', label: 'Created At', type: 'datetime-local', readonly: true },
            { name: 'updated_at', label: 'Updated At', type: 'datetime-local', readonly: true }
        ]
    },
    groups: {
        name: 'groups',
        displayName: 'Groups',
        icon: '👥',
        fields: [
            { name: 'group_name', label: 'Group Name', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'creator_id', label: 'Creator ID', type: 'text', required: true },
            { name: 'created_at', label: 'Created At', type: 'datetime-local', readonly: true },
            { name: 'updated_at', label: 'Updated At', type: 'datetime-local', readonly: true }
        ]
    },
    profiles: {
        name: 'profiles',
        displayName: 'User Profiles',
        icon: '🔖',
        fields: [
            { name: 'user_id', label: 'User ID', type: 'text', required: true },
            { name: 'display_name', label: 'Display Name', type: 'text' },
            { name: 'bio', label: 'Bio', type: 'textarea' },
            { name: 'avatar_url', label: 'Avatar URL', type: 'text' },
            { name: 'created_at', label: 'Created At', type: 'datetime-local', readonly: true },
            { name: 'updated_at', label: 'Updated At', type: 'datetime-local', readonly: true }
        ]
    }
};
