import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Eye, EyeOff, BarChart3, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const VendorLogin = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'VENDOR'
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'login') {
                const user = await login(formData.email, formData.password, 'VENDOR');
                navigate('/dashboard');
            } else {
                await register({ ...formData, role: 'VENDOR' });
                setMode('login');
                alert("Vendor application received! Please sign in to setup your shop.");
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <div style={styles.sidebarContent}>
                    <Building2 size={40} color="white" />
                    <h2 style={styles.sidebarTitle}>Grow Your Business with TradeLink</h2>
                    <ul style={styles.benefitList}>
                        <li style={styles.benefitItem}>✓ Reach thousands of premium buyers</li>
                        <li style={styles.benefitItem}>✓ Advanced inventory management</li>
                        <li style={styles.benefitItem}>✓ Real-time sales analytics</li>
                        <li style={styles.benefitItem}>✓ Secure payments & escrow</li>
                    </ul>
                </div>
            </div>

            <div style={styles.loginSection}>
                <div style={styles.card}>
                    <button onClick={() => navigate('/')} style={styles.backBtn}>
                        <ChevronLeft size={18} /> Marketplace
                    </button>

                    <div style={styles.header}>
                        <h1 style={styles.title}>{mode === 'login' ? 'Vendor Portal' : 'Partner with Us'}</h1>
                        <p style={styles.subtitle}>
                            {mode === 'login' ? 'Sign in to manage your storefront' : 'Fill in your details to start selling'}
                        </p>
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {mode === 'signup' && (
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Business Representative Name</label>
                                <div style={styles.inputWrapper}>
                                    <User size={18} style={styles.icon} />
                                    <input name="username" placeholder="Full Name" value={formData.username} onChange={handleChange} style={styles.input} required />
                                </div>
                            </div>
                        )}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Business Email</label>
                            <div style={styles.inputWrapper}>
                                <Mail size={18} style={styles.icon} />
                                <input name="email" type="email" placeholder="vendor@business.com" value={formData.email} onChange={handleChange} style={styles.input} required />
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Access Key</label>
                            <div style={styles.inputWrapper}>
                                <Lock size={18} style={styles.icon} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eye}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={styles.submitBtn}>
                            {loading ? 'Authenticating...' : (mode === 'login' ? 'Login to Dashboard' : 'Apply for Vendor Account')}
                        </button>
                    </form>

                    <p style={styles.footer}>
                        {mode === 'login' ? "Want to sell on TradeLink? " : "Already a partner? "}
                        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={styles.toggleBtn}>
                            {mode === 'login' ? 'Register Now' : 'Sign in here'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#f8fafc',
    },
    sidebar: {
        flex: 1,
        background: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        color: 'white',
        '@media (max-width: 768px)': { display: 'none' }
    },
    sidebarContent: { maxWidth: '400px' },
    sidebarTitle: { fontSize: '2rem', fontWeight: 800, margin: '24px 0', lineHeight: 1.2 },
    benefitList: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' },
    benefitItem: { fontSize: '1.1rem', color: '#94a3b8' },
    loginSection: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
    },
    card: {
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        position: 'relative'
    },
    backBtn: {
        position: 'absolute',
        top: '-40px',
        left: 0,
        background: 'none',
        border: 'none',
        color: '#64748b',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer'
    },
    header: { textAlign: 'left' },
    title: { fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 },
    subtitle: { fontSize: '1rem', color: '#64748b', marginTop: '8px' },
    error: { background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.9rem', fontWeight: 600, color: '#334155' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    icon: { position: 'absolute', left: '16px', color: '#94a3b8' },
    input: {
        width: '100%',
        padding: '14px 14px 14px 48px',
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
        outline: 'none',
        fontSize: '1rem',
        transition: 'all 0.2s',
        '&:focus': { borderColor: '#1e293b' }
    },
    eye: { position: 'absolute', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
    submitBtn: {
        background: '#1e293b',
        color: 'white',
        border: 'none',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: 700,
        fontSize: '1rem',
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    },
    footer: { textAlign: 'center', fontSize: '0.9rem', color: '#64748b' },
    toggleBtn: { background: 'none', border: 'none', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }
};

export default VendorLogin;
