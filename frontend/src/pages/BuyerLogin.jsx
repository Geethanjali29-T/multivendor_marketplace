import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Zap, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BuyerLogin = () => {
    const { login, register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'BUYER'
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
                await login(formData.email, formData.password);
                navigate('/');
            } else {
                await register({ ...formData, role: 'BUYER' });
                setMode('login');
                alert("Account created! Please sign in.");
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const user = await loginWithGoogle();
            if (user) {
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.logo}>
                        <Zap size={24} color="white" />
                    </div>
                    <h1 style={styles.title}>{mode === 'login' ? 'Buyer Login' : 'Buyer Signup'}</h1>
                    <p style={styles.subtitle}>Access the premium marketplace</p>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {mode === 'signup' && (
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Username</label>
                            <div style={styles.inputWrapper}>
                                <User size={18} style={styles.icon} />
                                <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} style={styles.input} required />
                            </div>
                        </div>
                    )}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} style={styles.icon} />
                            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} style={styles.input} required />
                        </div>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} style={styles.icon} />
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
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
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div style={styles.divider}>
                    <div style={styles.line}></div>
                    <span style={styles.dividerText}>or</span>
                    <div style={styles.line}></div>
                </div>

                <button onClick={handleGoogleLogin} style={styles.googleBtn}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: 18 }} />
                    Continue with Google
                </button>

                <p style={styles.footer}>
                    {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={styles.toggleBtn}>
                        {mode === 'login' ? 'Sign up' : 'Log in'}
                    </button>
                </p>

                <button onClick={() => navigate('/vendor/login')} style={styles.switchBtn}>
                    Are you a Vendor? Login here <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        padding: '20px'
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    header: { textAlign: 'center' },
    logo: {
        width: '48px',
        height: '48px',
        background: '#8b5cf6',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
    },
    title: { fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 },
    subtitle: { fontSize: '0.9rem', color: '#64748b', marginTop: '4px' },
    error: { background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '0.85rem', fontWeight: 600, color: '#475569' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    icon: { position: 'absolute', left: '12px', color: '#94a3b8' },
    input: { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border 0.2s' },
    eye: { position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
    submitBtn: {
        background: '#4f46e5',
        color: 'white',
        border: 'none',
        padding: '12px',
        borderRadius: '10px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
    },
    divider: { display: 'flex', alignItems: 'center', gap: '10px' },
    line: { flex: 1, height: '1px', background: '#e2e8f0' },
    dividerText: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 },
    googleBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '12px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        background: 'white',
        fontWeight: 600,
        color: '#475569',
        cursor: 'pointer'
    },
    footer: { textAlign: 'center', fontSize: '0.85rem', color: '#64748b' },
    toggleBtn: { background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer' },
    switchBtn: { border: 'none', background: 'none', color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', marginTop: '-10px' }
};

export default BuyerLogin;
