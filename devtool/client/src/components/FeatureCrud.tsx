import React, { useState, useEffect } from 'react';
import type { FeatureDefinition, FieldDefinition } from '../types';
import { listFeatureItems, createFeatureItem, updateFeatureItem, deleteFeatureItem } from '../utils/api';

interface FeatureCrudProps {
    feature: FeatureDefinition;
    apiUrl: string;
    onBack: () => void;
}

export const FeatureCrud: React.FC<FeatureCrudProps> = ({ feature, apiUrl, onBack }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});

    useEffect(() => {
        loadItems();
    }, [feature.name]);

    const loadItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await listFeatureItems(feature.name, apiUrl);
            if (response.ok) {
                setItems(response[feature.name] || []);
            } else {
                setError(response.message || 'Failed to load items');
            }
        } catch (err) {
            setError('Failed to load items');
        }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await createFeatureItem(feature.name, formData, apiUrl);
            if (response.ok) {
                setIsCreating(false);
                setFormData({});
                loadItems();
            } else {
                setError(response.message || 'Failed to create item');
            }
        } catch (err) {
            setError('Failed to create item');
        }
        setLoading(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem?.id) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await updateFeatureItem(feature.name, selectedItem.id, formData, apiUrl);
            if (response.ok) {
                setSelectedItem(null);
                setFormData({});
                loadItems();
            } else {
                setError(response.message || 'Failed to update item');
            }
        } catch (err) {
            setError('Failed to update item');
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await deleteFeatureItem(feature.name, id, apiUrl);
            if (response.ok) {
                loadItems();
            } else {
                setError(response.message || 'Failed to delete item');
            }
        } catch (err) {
            setError('Failed to delete item');
        }
        setLoading(false);
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setFormData({ ...item });
        setIsCreating(false);
    };

    const handleCancel = () => {
        setSelectedItem(null);
        setIsCreating(false);
        setFormData({});
        setError(null);
    };

    const renderField = (field: FieldDefinition) => {
        const value = formData[field.name] || '';
        const isReadonly = field.readonly || false;

        if (field.type === 'textarea') {
            return (
                <textarea
                    className="devtools-form-textarea"
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    required={field.required}
                    disabled={isReadonly}
                />
            );
        }

        return (
            <input
                className="devtools-form-input"
                type={field.type}
                value={value}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                required={field.required}
                disabled={isReadonly}
            />
        );
    };

    const renderForm = () => (
        <form className="devtools-form" onSubmit={selectedItem ? handleUpdate : handleCreate}>
            {feature.fields.map((field) => (
                <div key={field.name} className="devtools-form-group">
                    <label className="devtools-form-label">
                        {field.label}
                        {field.required && <span style={{ color: 'red' }}> *</span>}
                    </label>
                    {renderField(field)}
                </div>
            ))}
            <div className="devtools-form-actions">
                <button type="button" className="devtools-btn devtools-btn-secondary" onClick={handleCancel}>
                    Cancel
                </button>
                <button type="submit" className="devtools-btn devtools-btn-primary" disabled={loading}>
                    {selectedItem ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );

    const renderList = () => (
        <>
            <div style={{ marginBottom: '12px' }}>
                <button
                    className="devtools-btn devtools-btn-primary"
                    onClick={() => setIsCreating(true)}
                    disabled={loading}
                >
                    + Create New
                </button>
            </div>
            
            {items.length === 0 ? (
                <div className="devtools-empty">No items found</div>
            ) : (
                <ul className="devtools-list">
                    {items.map((item) => (
                        <li key={item.id} className="devtools-list-item">
                            <div className="devtools-list-item-main">
                                <div className="devtools-list-item-title">
                                    {item[feature.fields[0]?.name] || item.id}
                                </div>
                                <div className="devtools-list-item-meta">
                                    ID: {item.id}
                                </div>
                            </div>
                            <div className="devtools-list-item-actions">
                                <button
                                    className="devtools-btn devtools-btn-primary"
                                    onClick={() => handleEdit(item)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="devtools-btn devtools-btn-danger"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );

    return (
        <div>
            <button className="devtools-btn devtools-btn-secondary devtools-back-btn" onClick={onBack}>
                ← Back
            </button>
            
            {error && <div className="devtools-error">{error}</div>}
            
            {loading && <div className="devtools-loading">Loading...</div>}
            
            {!loading && (isCreating || selectedItem) ? renderForm() : renderList()}
        </div>
    );
};
