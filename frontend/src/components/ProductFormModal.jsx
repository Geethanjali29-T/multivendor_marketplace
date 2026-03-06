import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Trash2, Package, Tag, IndianRupee, Info } from 'lucide-react';

const ProductFormModal = ({ isOpen, onClose, onSave, product = null, categories = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image: '',
        variants: []
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                stock: product.stock || '',
                category: product.category || categories[0] || 'Electronics',
                image: product.image || '',
                variants: product.variants || []
            });
        } else {
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                category: categories[0] || 'Electronics',
                image: '',
                variants: []
            });
        }
    }, [product, isOpen, categories]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div className="glass fade-in" style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.scrollArea}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Product Name</label>
                            <div style={styles.inputWrapper}>
                                <Package size={18} style={styles.inputIcon} />
                                <input
                                    type="text"
                                    required
                                    style={styles.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Wireless Noise Cancelling Headphones"
                                />
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={{ ...styles.fieldGroup, flex: 1 }}>
                                <label style={styles.label}>Price (₹)</label>
                                <div style={styles.inputWrapper}>
                                    <IndianRupee size={18} style={styles.inputIcon} />
                                    <input
                                        type="number"
                                        required
                                        style={styles.input}
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div style={{ ...styles.fieldGroup, flex: 1 }}>
                                <label style={styles.label}>In Stock</label>
                                <div style={styles.inputWrapper}>
                                    <Tag size={18} style={styles.inputIcon} />
                                    <input
                                        type="number"
                                        required
                                        style={styles.input}
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        placeholder="Available Qty"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Category</label>
                            <select
                                style={styles.select}
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.length > 0 ? categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                )) : <option value="Electronics">Electronics</option>}
                            </select>
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Description</label>
                            <textarea
                                style={styles.textarea}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tell buyers about your product features, quality, and usage..."
                            />
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Product Photo URL</label>
                            <div style={styles.inputWrapper}>
                                <Upload size={18} style={styles.inputIcon} />
                                <input
                                    type="text"
                                    style={styles.input}
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>
                            {formData.image && (
                                <div style={styles.previewContainer}>
                                    <img src={formData.image} alt="Preview" style={styles.preview} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.footer}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                        <button type="submit" style={styles.saveBtn}>
                            <Save size={18} /> {product ? 'Update Details' : 'Publish Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    modal: {
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)'
    },
    header: {
        padding: '24px 32px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: 'var(--brand-secondary)',
        margin: 0
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#64748b'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden'
    },
    scrollArea: {
        padding: '32px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    row: {
        display: 'flex',
        gap: '20px'
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'var(--brand-secondary)',
        marginLeft: '4px'
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    inputIcon: {
        position: 'absolute',
        left: '16px',
        color: 'var(--brand-primary)',
        opacity: 0.7
    },
    input: {
        width: '100%',
        padding: '14px 14px 14px 48px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        backgroundColor: '#f8fafc'
    },
    select: {
        padding: '14px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        fontSize: '0.95rem',
        outline: 'none'
    },
    textarea: {
        padding: '16px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        fontSize: '0.95rem',
        minHeight: '120px',
        resize: 'vertical',
        outline: 'none'
    },
    previewContainer: {
        marginTop: '12px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
    },
    preview: {
        width: '100%',
        height: '200px',
        objectFit: 'cover'
    },
    footer: {
        padding: '24px 32px',
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '16px',
        borderTop: '1px solid #e2e8f0'
    },
    cancelBtn: {
        padding: '12px 24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        background: 'white',
        fontWeight: 600,
        cursor: 'pointer'
    },
    saveBtn: {
        padding: '12px 28px',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: 'var(--brand-primary)',
        color: 'white',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: '13px',
        boxShadow: 'var(--shadow-md)',
        transition: 'all 0.3s ease'
    }
};

export default ProductFormModal;
