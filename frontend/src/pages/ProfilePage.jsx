import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { User, Store, Save, Shield } from 'lucide-react';

const ProfilePage = () => {
    const { user, setUser } = useAuth();

    // Basic Profile State
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    // Vendor Shop State
    const [shopData, setShopData] = useState({
        name: '',
        category: 'Electronics',
        location: '',
        phone: '',
        gstin: '',
        website: '',
        description: ''
    });
    const [shopLoading, setShopLoading] = useState(false);
    const [shopMsg, setShopMsg] = useState({ type: '', text: '' });
    const [hasShop, setHasShop] = useState(false);

    useEffect(() => {
        if (user?.role === 'VENDOR' || user?.role === 'vendor') {
            const fetchShop = async () => {
                try {
                    const shop = await api.getMyShop();
                    if (shop) {
                        setShopData({
                            name: shop.name || '',
                            category: shop.category || 'Electronics',
                            location: shop.location || '',
                            phone: shop.phone || '',
                            gstin: shop.gstin || '',
                            website: shop.website || '',
                            description: shop.description || ''
                        });
                        setHasShop(true);
                    }
                } catch (e) {
                    console.log("No shop found or error fetching shop.");
                }
            };
            fetchShop();
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg({ type: '', text: '' });

        try {
            await api.updateUserProfile({ username: profileData.username });
            setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });

            // Update context and local storage properly
            const updatedUser = { ...user, username: profileData.username };
            setUser(updatedUser);
            if (!user.isGoogleAuth) {
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleShopUpdate = async (e) => {
        e.preventDefault();
        setShopLoading(true);
        setShopMsg({ type: '', text: '' });

        try {
            await api.setupVendorProfile(shopData);
            setShopMsg({ type: 'success', text: 'Shop details updated successfully!' });
            setHasShop(true);
        } catch (err) {
            setShopMsg({ type: 'error', text: err.message || 'Failed to update shop details' });
        } finally {
            setShopLoading(false);
        }
    };

    if (!user) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Please log in to view your profile.</div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.pageTitle}>Account Settings</h1>

            <div style={styles.grid}>
                {/* Basic User Profile Card */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <User size={24} color="var(--brand-primary)" />
                        <h2 style={styles.cardTitle}>Personal Information</h2>
                    </div>

                    {profileMsg.text && (
                        <div style={profileMsg.type === 'success' ? styles.successAlert : styles.errorAlert}>
                            {profileMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                value={profileData.email}
                                disabled
                                style={{ ...styles.input, backgroundColor: '#e2e8f0', cursor: 'not-allowed', color: '#64748b' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Shield size={12} /> Email cannot be changed
                            </span>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Username / Display Name</label>
                            <input
                                type="text"
                                value={profileData.username}
                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Account Role</label>
                            <span style={styles.roleBadge}>{user.role?.toUpperCase()}</span>
                        </div>

                        <button type="submit" disabled={profileLoading} style={styles.btnPrimary}>
                            <Save size={16} /> {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                    </form>
                </div>

                {/* Vendor Shop Detail Card */}
                {(user.role === 'VENDOR' || user.role === 'vendor') && (
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <Store size={24} color="#d97706" />
                            <div>
                                <h2 style={{ ...styles.cardTitle, margin: 0 }}>Shop Settings</h2>
                                {!hasShop && <p style={{ fontSize: '0.8rem', color: '#b45309', margin: '4px 0 0 0', fontWeight: 600 }}>Create your shop profile to go live</p>}
                            </div>
                        </div>

                        {shopMsg.text && (
                            <div style={shopMsg.type === 'success' ? styles.successAlert : styles.errorAlert}>
                                {shopMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleShopUpdate} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Public Shop Name</label>
                                <input type="text" value={shopData.name} onChange={e => setShopData({ ...shopData, name: e.target.value })} required style={styles.input} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                                    <label style={styles.label}>Location / City</label>
                                    <input type="text" value={shopData.location} onChange={e => setShopData({ ...shopData, location: e.target.value })} required style={styles.input} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Phone Number</label>
                                    <input type="tel" value={shopData.phone} onChange={e => setShopData({ ...shopData, phone: e.target.value })} required style={styles.input} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>GSTIN (Optional)</label>
                                    <input type="text" value={shopData.gstin} onChange={e => setShopData({ ...shopData, gstin: e.target.value })} style={styles.input} />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Website URL (Optional)</label>
                                <input type="url" value={shopData.website} onChange={e => setShopData({ ...shopData, website: e.target.value })} style={styles.input} />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Store Description</label>
                                <textarea
                                    value={shopData.description}
                                    onChange={e => setShopData({ ...shopData, description: e.target.value })}
                                    required
                                    style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" disabled={shopLoading} style={{ ...styles.btnPrimary, backgroundColor: '#d97706' }}>
                                <Save size={16} /> {shopLoading ? 'Saving...' : (hasShop ? 'Save Shop Details' : 'Create Shop')}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '32px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '80vh',
    },
    pageTitle: {
        fontSize: '2rem',
        color: 'var(--brand-secondary)',
        marginBottom: '32px',
        fontWeight: 800,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '32px',
        alignItems: 'start',
    },
    card: {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid #e2e8f0',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #f1f5f9',
    },
    cardTitle: {
        fontSize: '1.4rem',
        color: 'var(--text-main)',
        margin: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
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
        transition: 'border-color 0.2s',
    },
    roleBadge: {
        display: 'inline-flex',
        alignSelf: 'flex-start',
        padding: '6px 16px',
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        borderRadius: '99px',
        fontSize: '0.8rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
    },
    btnPrimary: {
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        border: 'none',
        padding: '14px',
        borderRadius: '12px',
        fontWeight: 700,
        fontSize: '0.95rem',
        marginTop: '8px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        transition: 'opacity 0.2s',
    },
    successAlert: {
        padding: '12px 16px',
        backgroundColor: '#f0fdf4',
        color: '#15803d',
        borderRadius: '12px',
        marginBottom: '24px',
        fontSize: '0.85rem',
        border: '1px solid #bbf7d0',
        fontWeight: 600,
    },
    errorAlert: {
        padding: '12px 16px',
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        borderRadius: '12px',
        marginBottom: '24px',
        fontSize: '0.85rem',
        border: '1px solid #fecaca',
        fontWeight: 600,
    }
};

export default ProfilePage;
