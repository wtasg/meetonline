import React, { useState } from 'react';
import type { DevToolsClientConfig } from '../types';
import { FEATURE_DEFINITIONS } from '../utils/feature-definitions';
import { FeatureCrud } from './FeatureCrud';
import { RandomDataGenerator } from './RandomDataGenerator';
// Import styles from dist location (CSS is built to dist/styles.css)
import '../styles.css';

interface DevToolsPanelProps {
    config?: Partial<DevToolsClientConfig>;
}

export const DevToolsPanel: React.FC<DevToolsPanelProps> = ({ config = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

    const finalConfig: DevToolsClientConfig = {
        enabled: config.enabled ?? true,
        position: config.position ?? 'bottom-right',
        features: {
            users: config.features?.users ?? true,
            events: config.features?.events ?? true,
            groups: config.features?.groups ?? true,
            profiles: config.features?.profiles ?? true
        },
        apiUrl: config.apiUrl ?? '/devtools'
    };

    // Don't render if disabled or not in development
    if (!finalConfig.enabled) {
        return null;
    }

    const enabledFeatures = Object.entries(FEATURE_DEFINITIONS).filter(
        ([key]) => finalConfig.features[key as keyof typeof finalConfig.features]
    );

    const handleFeatureSelect = (featureName: string) => {
        setSelectedFeature(featureName);
    };

    const handleBack = () => {
        setSelectedFeature(null);
    };

    const renderContent = () => {
        if (selectedFeature) {
            const feature = FEATURE_DEFINITIONS[selectedFeature];
            if (!feature) return null;

            return (
                <FeatureCrud
                    feature={feature}
                    apiUrl={finalConfig.apiUrl || '/devtools'}
                    onBack={handleBack}
                />
            );
        }

        return (
            <div>
                <RandomDataGenerator />

                <div style={{ margin: '24px 0', borderTop: '1px solid #ddd' }}></div>

                <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                    Select a feature to manage:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {enabledFeatures.map(([key, feature]) => (
                        <button
                            key={key}
                            className="devtools-btn devtools-btn-primary"
                            onClick={() => handleFeatureSelect(key)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                justifyContent: 'flex-start',
                                padding: '12px 16px'
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                            <span>{feature.displayName}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={`devtools-container position-${finalConfig.position}`}>
            {isOpen && (
                <div className="devtools-panel">
                    <div className="devtools-header">
                        <h3>🔧 DevTools</h3>
                        <button
                            className="devtools-close"
                            onClick={() => setIsOpen(false)}
                            title="Close"
                        >
                            ×
                        </button>
                    </div>
                    <div className="devtools-body">
                        {renderContent()}
                    </div>
                </div>
            )}

            <button
                className="devtools-toggle"
                onClick={() => setIsOpen(!isOpen)}
                title="Toggle DevTools"
            >
                🔧
            </button>
        </div>
    );
};
