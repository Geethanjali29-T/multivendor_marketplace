import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, PackagePlus, ArrowRight, CheckCircle2, Image as ImageIcon, ShieldCheck, Plus, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const VendorSetupPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Step 1 & 2: Shop Profile & Branding
    const [shopData, setShopData] = useState({
        name: '',
        category: 'Mobiles',
        location: '',
        phone: '',
        gstin: '',
        website: '',
        description: '',
        logoUrl: '',
        bannerUrl: '',
        returnPolicy: 'Standard 7-day return policy for unopened items.',
        isVisible: true
    });

    // Validation States
    const [errors, setErrors] = useState({});

    const [showCustomCategory, setShowCustomCategory] = useState(false);
    const [customCatVal, setCustomCatVal] = useState('');

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState({ logo: false, banner: false });
    const [apiError, setApiError] = useState(null);

    // --- Validation Logic ---
    const validateStep1 = () => {
        const newErrors = {};
        if (shopData.name.length < 3) newErrors.name = "Shop name must be at least 3 characters";
        if (shopData.phone && !/^\+?[0-9\s-]{10,15}$/.test(shopData.phone)) {
            newErrors.phone = "Invalid phone number format";
        }
        if (shopData.website && !/^https?:\/\/.*/.test(shopData.website)) {
            newErrors.website = "URL must start with http:// or https://";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (shopData.description.length < 10) newErrors.description = "Description must be at least 10 characters";
        if (shopData.logoUrl && !/^https?:\/\/.*/.test(shopData.logoUrl)) newErrors.logoUrl = "Invalid URL format";
        if (shopData.bannerUrl && !/^https?:\/\/.*/.test(shopData.bannerUrl)) newErrors.bannerUrl = "Invalid URL format";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const res = await api.uploadImage(file);
            setShopData(prev => ({ ...prev, [type === 'logo' ? 'logoUrl' : 'bannerUrl']: res.url }));
        } catch (err) {
            setApiError(`Failed to upload ${type}.`);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (step === 1 && !validateStep1()) return;
        setStep(prev => prev + 1);
    };

    const handleShopSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setLoading(true);
        setApiError(null);
        try {
            const finalShopData = { ...shopData };
            if (showCustomCategory && customCatVal) {
                finalShopData.category = customCatVal;
            }
            await api.setupVendorProfile(finalShopData);
            await api.setupVendorProfile(finalShopData);
            navigate('/dashboard', { state: { activeTab: 'products', openAddModal: true } });
        } catch (err) {
            setApiError(err.message || "Failed to create shop profile.");
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
                        <span style={step >= 1 ? styles.stepTextActive : styles.stepText}>Basic Info</span>
                    </div>
                    <div style={styles.line}></div>
                    <div style={styles.step}>
                        <div style={step >= 2 ? styles.stepCircleActive : styles.stepCircle}>
                            {step >= 2 ? <CheckCircle2 size={16} /> : '2'}
                        </div>
                        <span style={step >= 2 ? styles.stepTextActive : styles.stepText}>Branding</span>
                    </div>
                </div>

                {apiError && <div style={styles.errorAlert}>{apiError}</div>}

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="fade-in">
                        <div style={styles.header}>
                            <Store size={32} color="var(--brand-primary)" style={{ marginBottom: '16px' }} />
                            <h2 style={styles.title}>Build Your Storefront</h2>
                            <p style={styles.subtitle}>Let's start with the basic details of your business.</p>
                        </div>

                        <form onSubmit={handleNextStep} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Shop Name *</label>
                                <input type="text" value={shopData.name} onChange={e => setShopData({ ...shopData, name: e.target.value })} placeholder="e.g. Neo Electronics" required style={errors.name ? styles.inputError : styles.input} />
                                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Shop Category</label>
                                    <div style={styles.categoryChips}>
                                        {['Mobiles', 'Fashion', 'Electronics', 'Appliances', 'Home & Kitchen', 'Beauty', 'Sports', 'Toys'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => {
                                                    setShopData({ ...shopData, category: cat });
                                                    setShowCustomCategory(false);
                                                }}
                                                style={shopData.category === cat && !showCustomCategory ? styles.categoryChipActive : styles.categoryChip}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setShowCustomCategory(true)}
                                            style={showCustomCategory ? styles.categoryChipActive : styles.categoryChip}
                                        >
                                            + Add New
                                        </button>
                                    </div>
                                    {showCustomCategory && (
                                        <div className="fade-in" style={{ marginTop: '12px' }}>
                                            <input
                                                type="text"
                                                placeholder="Type your custom category..."
                                                value={customCatVal}
                                                onChange={e => {
                                                    setCustomCatVal(e.target.value);
                                                    setShopData({ ...shopData, category: e.target.value });
                                                }}
                                                style={styles.input}
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>City / Location *</label>
                                <input type="text" value={shopData.location} onChange={e => setShopData({ ...shopData, location: e.target.value })} placeholder="e.g. New Delhi" required style={styles.input} />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Phone Number *</label>
                                    <input type="tel" value={shopData.phone} onChange={e => setShopData({ ...shopData, phone: e.target.value })} placeholder="+91 9876543210" required style={errors.phone ? styles.inputError : styles.input} />
                                    {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
                                </div>
                                <div style={styles.inputGroup} />
                            </div>

                            <button type="submit" style={styles.btnPrimary}>
                                Next: Branding <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 2: Branding & Policy */}
                {step === 2 && (
                    <div className="fade-in">
                        <div style={styles.header}>
                            <ImageIcon size={32} color="var(--brand-primary)" style={{ marginBottom: '16px' }} />
                            <h2 style={styles.title}>Branding & Visuals</h2>
                            <p style={styles.subtitle}>Upload your shop's identity and set your policies.</p>
                        </div>

                        <form onSubmit={handleShopSubmit} style={styles.form}>
                            <div style={styles.uploadGrid}>
                                <div style={styles.uploadCard}>
                                    <label style={styles.label}>Shop Logo</label>
                                    <div style={styles.imageDropzone}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={styles.urlInput}
                                            onChange={(e) => handleFileUpload(e, 'logo')}
                                        />
                                        <div style={styles.dropzoneHint}>
                                            {uploading.logo ? <RefreshCcw className="spin" size={20} /> : <Plus size={20} />}
                                            <span>{uploading.logo ? 'Uploading...' : 'Upload Logo File'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>OR URL</span>
                                        <input
                                            type="url"
                                            value={shopData.logoUrl}
                                            onChange={e => setShopData({ ...shopData, logoUrl: e.target.value })}
                                            placeholder="Paste URL..."
                                            style={styles.smallUrlInput}
                                        />
                                    </div>
                                </div>
                                <div style={styles.uploadCard}>
                                    <label style={styles.label}>Shop Banner</label>
                                    <div style={styles.imageDropzone}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={styles.urlInput}
                                            onChange={(e) => handleFileUpload(e, 'banner')}
                                        />
                                        <div style={styles.dropzoneHint}>
                                            {uploading.banner ? <RefreshCcw className="spin" size={20} /> : <Plus size={20} />}
                                            <span>{uploading.banner ? 'Uploading...' : 'Upload Banner File'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>OR URL</span>
                                        <input
                                            type="url"
                                            value={shopData.bannerUrl}
                                            onChange={e => setShopData({ ...shopData, bannerUrl: e.target.value })}
                                            placeholder="Paste URL..."
                                            style={styles.smallUrlInput}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview Area */}
                            {(shopData.logoUrl || shopData.bannerUrl) && (
                                <div style={styles.previewContainer}>
                                    <div style={{ ...styles.previewBanner, backgroundImage: shopData.bannerUrl ? `url(${shopData.bannerUrl})` : 'none', backgroundColor: shopData.bannerUrl ? 'transparent' : '#f1f5f9' }}>
                                        {shopData.logoUrl && (
                                            <img src={shopData.logoUrl} alt="Logo Preview" style={styles.previewLogo} onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=Invalid'; }} />
                                        )}
                                        {!shopData.bannerUrl && <p style={{ textAlign: 'center', lineHeight: '120px', margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Banner Preview</p>}
                                    </div>
                                </div>
                            )}

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Return Policy</label>
                                <textarea
                                    value={shopData.returnPolicy}
                                    onChange={e => setShopData({ ...shopData, returnPolicy: e.target.value })}
                                    style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Store Description *</label>
                                <textarea
                                    value={shopData.description}
                                    onChange={e => setShopData({ ...shopData, description: e.target.value })}
                                    placeholder="Briefly describe what your store sells..."
                                    required
                                    style={errors.description ? { ...styles.inputError, minHeight: '100px' } : { ...styles.input, minHeight: '100px', resize: 'vertical' }}
                                />
                                {errors.description && <span style={styles.errorText}>{errors.description}</span>}
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setStep(1)} style={{ ...styles.btnOutline, flex: 1 }}>Back</button>
                                <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, flex: 2, marginTop: 0 }}>
                                    {loading ? 'Saving Shop...' : 'Save & Continue'} <ArrowRight size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}



            </div>
        </div>
    );
};

// ... Trash2 icon needs to be imported or removed, let's just use the 'X' text or import Trash2
import { Trash2, RefreshCcw } from 'lucide-react';

const styles = {
    container: { padding: '32px', maxWidth: '800px', margin: '0 auto', minHeight: '80vh', display: 'flex', alignItems: 'center' },
    card: { backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '48px', boxShadow: 'var(--shadow-md)', width: '100%' },
    progressHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' },
    step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
    stepCircle: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' },
    stepCircleActive: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)' },
    stepText: { fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
    stepTextActive: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' },
    line: { flex: 1, height: '2px', backgroundColor: '#e2e8f0', margin: '0 16px', marginTop: '-24px' },
    header: { marginBottom: '32px' },
    title: { fontSize: '2rem', color: 'var(--brand-secondary)', margin: '0 0 8px 0' },
    subtitle: { fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    row: { display: 'flex', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    label: { fontSize: '0.85rem', fontWeight: 600, color: '#334155' },
    input: { padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit', backgroundColor: '#f8fafc', color: '#0f172a' },
    inputError: { padding: '12px 16px', borderRadius: '12px', border: '1px solid #ef4444', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit', backgroundColor: '#fef2f2', color: '#0f172a' },
    errorText: { color: '#ef4444', fontSize: '0.75rem', marginTop: '2px', fontWeight: 500 },
    btnPrimary: { backgroundColor: 'var(--brand-primary)', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', marginTop: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.4)' },
    btnOutline: { backgroundColor: 'transparent', color: '#334155', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    secondaryBtn: { backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '0 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' },
    errorAlert: { padding: '12px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '12px', marginBottom: '24px', fontSize: '0.85rem', border: '1px solid #fecaca' },
    previewContainer: { border: '1px dashed #cbd5e1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc', marginTop: '8px' },
    previewBanner: { width: '100%', height: '120px', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
    previewLogo: { width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', position: 'absolute', bottom: '-16px', left: '24px', border: '2px solid white', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    closeBadge: { position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', padding: 0 },

    // New Styles
    categoryChips: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' },
    categoryChip: { padding: '8px 16px', borderRadius: '99px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
    categoryChipActive: { padding: '8px 16px', borderRadius: '99px', border: '1px solid var(--brand-primary)', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--brand-primary)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' },
    uploadGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    uploadCard: { display: 'flex', flexDirection: 'column', gap: '8px' },
    imageDropzone: { height: '100px', border: '2px dashed #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    urlInput: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 },
    dropzoneHint: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 },
    smallUrlInput: { flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', outline: 'none' }
};

export default VendorSetupPage;
