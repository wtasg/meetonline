import React, { useEffect, useState } from 'react';

interface GeneratorState {
    users: number;
    events: number;
    groups: number;
    loading: boolean;
    message: string;
    error: string;
}

interface ApiResponse {
    ok: boolean;
    message?: string;
    data?: any;
}

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        // Check if response has content before parsing
        const contentType = response.headers.get('content-type');
        const text = await response.text();

        if (!text || text.trim() === '') {
            return {
                ok: false,
                message: 'Empty response from server'
            };
        }

        if (contentType?.includes('application/json')) {
            try {
                const data = JSON.parse(text);
                return data;
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                return {
                    ok: false,
                    message: `Invalid JSON response: ${text.substring(0, 100)}`
                };
            }
        }

        return {
            ok: false,
            message: `Unexpected response type: ${contentType || 'unknown'}`
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            ok: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export const RandomDataGenerator: React.FC = () => {
    const [state, setState] = useState<GeneratorState>({
        users: 10,
        events: 20,
        groups: 5,
        loading: false,
        message: '',
        error: ''
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const resp = await apiCall('/devtools/random-data/config');
            if (!cancelled) {
                if (resp.ok && resp.data?.defaults) {
                    const { users, events, groups } = resp.data.defaults;
                    setState(prev => ({
                        ...prev,
                        users: users ?? prev.users,
                        events: events ?? prev.events,
                        groups: groups ?? prev.groups,
                    }));
                } else if (!resp.ok) {
                    setState(prev => ({
                        ...prev,
                        error: resp.message || 'Random data config missing. Please add `randomData` to devtool config.'
                    }));
                }
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handleGenerate = async () => {
        setState(prev => ({ ...prev, loading: true, message: '', error: '' }));

        try {
            const response = await apiCall('/devtools/random-data/generate', {
                method: 'POST',
                body: JSON.stringify({
                    users: state.users,
                    events: state.events,
                    groups: state.groups
                })
            });

            if (response.ok) {
                const data = response.data;
                setState(prev => ({
                    ...prev,
                    loading: false,
                    message: `Successfully generated: ${data.users || 0} users, ${data.events || 0} events, ${data.groups || 0} groups`,
                    error: ''
                }));
            } else {
                throw new Error(response.message || 'Failed to generate data');
            }
        } catch (err) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: err instanceof Error ? err.message : 'An error occurred',
                message: ''
            }));
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
            return;
        }

        setState(prev => ({ ...prev, loading: true, message: '', error: '' }));

        try {
            const response = await apiCall('/devtools/random-data/clear', {
                method: 'DELETE'
            });

            if (response.ok) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    message: 'All data cleared successfully',
                    error: ''
                }));
            } else {
                throw new Error(response.message || 'Failed to clear data');
            }
        } catch (err) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: err instanceof Error ? err.message : 'An error occurred',
                message: ''
            }));
        }
    };

    return (
        <div className="devtools-random-data">
            <h3>🎲 Random Data Generator</h3>
            <p className="devtools-description">
                Generate random test data for development and testing purposes.
            </p>

            <div className="devtools-form">
                <div className="devtools-form-row">
                    <label>
                        <span>Users:</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={state.users}
                            onChange={(e) => setState(prev => ({
                                ...prev,
                                users: parseInt(e.target.value) || 0
                            }))}
                            disabled={state.loading}
                        />
                    </label>
                </div>

                <div className="devtools-form-row">
                    <label>
                        <span>Events:</span>
                        <input
                            type="number"
                            min="0"
                            max="200"
                            value={state.events}
                            onChange={(e) => setState(prev => ({
                                ...prev,
                                events: parseInt(e.target.value) || 0
                            }))}
                            disabled={state.loading}
                        />
                    </label>
                </div>

                <div className="devtools-form-row">
                    <label>
                        <span>Groups:</span>
                        <input
                            type="number"
                            min="0"
                            max="50"
                            value={state.groups}
                            onChange={(e) => setState(prev => ({
                                ...prev,
                                groups: parseInt(e.target.value) || 0
                            }))}
                            disabled={state.loading}
                        />
                    </label>
                </div>

                <div className="devtools-button-group">
                    <button
                        className="devtools-button devtools-button-primary"
                        onClick={handleGenerate}
                        disabled={state.loading}
                    >
                        {state.loading ? '⏳ Generating...' : '🎲 Generate Data'}
                    </button>

                    <button
                        className="devtools-button devtools-button-danger"
                        onClick={handleClearAll}
                        disabled={state.loading}
                    >
                        {state.loading ? '⏳ Clearing...' : '🗑️ Clear All Data'}
                    </button>
                </div>

                {state.message && (
                    <div className="devtools-message devtools-message-success">
                        ✅ {state.message}
                    </div>
                )}

                {state.error && (
                    <div className="devtools-message devtools-message-error">
                        ❌ {state.error}
                    </div>
                )}
            </div>
        </div>
    );
};
