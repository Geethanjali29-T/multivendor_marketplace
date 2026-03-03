import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, PackagePlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const VendorSetupPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Step 1: Shop Profile State
    const [shopData, setShopData] = useState({
        name: '',
        category: 'Electronics',
        location: '',
        phone: '',
        gstin: '',
        website: '',
        description: ''
    });

    // Step 2: Product State
    const [productData, setProductData] = useState({
        name: '',
        price: '',
        stock: '',
        description: '',
        image: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleShopSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.setupVendorProfile(shopData);
            setStep(2);
        } catch (err) {
            setError(err.message || "Failed to create shop profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.addVendorProduct(productData);
            setStep(3);
        } catch (err) {
            setError(err.message || "Failed to add product. Make sure your shop is created.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* Progress Header */}
                <div style={styles.progressHeader}>
                    <div style={styles.step}>
                        <div style={step >= 1 ? styles.stepCircleActive : styles.stepCircle}>1</div>
                        <span style={step >= 1 ? styles.stepTextActive : styles.stepText}>Shop Profile</span>
                    </div>
                    <div style={styles.line}></div>
                    <div style={styles.step}>
                        <div style={step >= 2 ? styles.stepCircleActive : styles.stepCircle}>2</div>
                        <span style={step >= 2 ? styles.stepTextActive : styles.stepText}>First Item</span>
                    </div>
                    <div style={styles.line}></div>
                    <div style={styles.step}>
                        <div style={step >= 3 ? styles.stepCircleActive : styles.stepCircle}>
                            {step === 3 ? <CheckCircle2 size={16} /> : '3'}
                        </div>
                        <span style={step >= 3 ? styles.stepTextActive : styles.stepText}>Complete</span>
                    </div>
                </div>

                {error && <div style={styles.errorAlert}>{error}</div>}

                {/* Step 1: Create Shop */}
                {step === 1 && (
                    <div className="fade-in">
                        <div style={styles.header}>
                            <Store size={32} color="var(--brand-primary)" style={{ marginBottom: '16px' }} />
                            <h2 style={styles.title}>Build Your Storefront</h2>
                            <p style={styles.subtitle}>Let's set up your public shop profile so customers can find you.</p>
                        </div>

                        <form onSubmit={handleShopSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Shop Name</label>
                                <input type="text" value={shopData.name} onChange={e => setShopData({ ...shopData, name: e.target.value })} placeholder="e.g. Neo Electronics" required style={styles.input} />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Category</label>
                                    <select value={shopData.category} onChange={e => setShopData({ ...shopData, category: e.target.value })} style={styles.input}>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Grocery">Grocery</option>
                                        <option value="Education">Education & Courses</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Vehicle Services">Vehicle Services</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>City / Location</label>
                                    <input type="text" value={shopData.location} onChange={e => setShopData({ ...shopData, location: e.target.value })} placeholder="e.g. New Delhi" required style={styles.input} />
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Phone Number</label>
                                    <input type="tel" value={shopData.phone} onChange={e => setShopData({ ...shopData, phone: e.target.value })} placeholder="+91 9876543210" required style={styles.input} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>GSTIN (Optional)</label>
                                    <input type="text" value={shopData.gstin} onChange={e => setShopData({ ...shopData, gstin: e.target.value })} placeholder="e.g. 22AAAAA0000A1Z5" style={styles.input} />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Website URL (Optional)</label>
                                <input type="url" value={shopData.website} onChange={e => setShopData({ ...shopData, website: e.target.value })} placeholder="https://www.myshop.com" style={styles.input} />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Store Description</label>
                                <textarea
                                    value={shopData.description}
                                    onChange={e => setShopData({ ...shopData, description: e.target.value })}
                                    placeholder="Briefly describe what your store sells..."
                                    required
                                    style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" disabled={loading} style={styles.btnPrimary}>
                                {loading ? 'Saving...' : 'Create Store'} <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 2: Add First Product */}
                {step === 2 && (
                    <div className="fade-in">
                        <div style={styles.header}>
                            <PackagePlus size={32} color="var(--brand-primary)" style={{ marginBottom: '16px' }} />
                            <h2 style={styles.title}>Add Your First Item</h2>
                            <p style={styles.subtitle}>You must have at least one product in your store to go live.</p>
                        </div>

                        <form onSubmit={handleProductSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Product / Service Name</label>
                                <input type="text" value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} placeholder="e.g. Premium Wireless Headphones" required style={styles.input} />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Price (₹)</label>
                                    <input type="number" value={productData.price} onChange={e => setProductData({ ...productData, price: e.target.value })} placeholder="4999" required min="1" style={styles.input} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Initial Stock</label>
                                    <input type="number" value={productData.stock} onChange={e => setProductData({ ...productData, stock: e.target.value })} placeholder="50" required min="1" style={styles.input} />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Image URL (Optional)</label>
                                <input type="url" value={productData.image} onChange={e => setProductData({ ...productData, image: e.target.value })} placeholder="https://images.unsplash..." style={styles.input} />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea value={productData.description} onChange={e => setProductData({ ...productData, description: e.target.value })} placeholder="Details about this item..." required style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} />
                            </div>

                            <button type="submit" disabled={loading} style={styles.btnPrimary}>
                                {loading ? 'Publishing...' : 'Publish First Product'} <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 3: Success Completion */}
                {step === 3 && (
                    <div className="fade-in" style={{ textAlign: 'center', padding: '32px 0' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#166534', marginBottom: '24px' }}>
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 style={styles.title}>You are Live!</h2>
                        <p style={styles.subtitle}>Your shop profile has been created and your first item is now available for buyers to purchase on TradeLink.</p>

                        <button onClick={() => navigate('/dashboard')} style={{ ...styles.btnPrimary, width: 'auto', marginTop: '24px' }}>
                            Go to Dashboard
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '32px',
        maxWidth: '700px',
        margin: '0 auto',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center'
    },
    card: {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: 'var(--shadow-md)',
        width: '100%',
    },
    progressHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '48px',
    },
    step: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    stepCircle: {
        width: '32px', height: '32px',
        borderRadius: '50%',
        backgroundColor: '#f1f5f9',
        border: '2px solid #cbd5e1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.85rem', fontWeight: 700, color: '#64748b'
    },
    stepCircleActive: {
        width: '32px', height: '32px',
        borderRadius: '50%',
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.85rem', fontWeight: 700,
        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
    },
    stepText: {
        fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'
    },
    stepTextActive: {
        fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em'
    },
    line: {
        flex: 1,
        height: '2px',
        backgroundColor: '#e2e8f0',
        margin: '0 16px',
        marginTop: '-24px'
    },
    header: {
        marginBottom: '32px',
    },
    title: {
        fontSize: '2rem',
        color: 'var(--brand-secondary)',
        margin: '0 0 8px 0',
    },
    subtitle: {
        fontSize: '0.95rem',
        color: 'var(--text-muted)',
        margin: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    row: {
        display: 'flex',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#334155',
    },
    input: {
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid #cbd5e1',
        outline: 'none',
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
    },
    btnPrimary: {
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        border: 'none',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '1rem',
        marginTop: '16px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.4)',
    },
    errorAlert: {
        padding: '12px',
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        borderRadius: '12px',
        marginBottom: '24px',
        fontSize: '0.85rem',
        border: '1px solid #fecaca'
    }
};

export default VendorSetupPage;
