import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, Eye, EyeOff, Lock, User, Mail, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthPages = () => {
    const { login, register, loginWithGoogle, resetPassword } = useAuth();
    const location = useLocation();
    const initialMode = (location.pathname === '/register' || location.pathname === '/signup') ? 'signup' : 'login';
    const [mode, setMode] = useState(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'buyer'
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // The route the user was trying to access before being prompted to login
    const from = location.state?.from || '/dashboard';

    // Instead of redirecting immediately if `useAuth().user` is defined (which we can't reliably do directly at the top level here without hooks issue), we just rely on the layout or the router wrapper, but we check location state safely.
    // If we wanted to redirect based on auth context, we'd do it here, but `useAuth` user is already handled via ProtectedRoutes or App layout. We will just navigate specifically upon success.

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            if (mode === 'login') {
                const loggedUser = await login(formData.email, formData.password);
                if (loggedUser.role?.toUpperCase() === 'ADMIN') {
                    navigate('/admin', { replace: true });
                } else if (loggedUser.role?.toUpperCase() === 'VENDOR') {
                    navigate('/dashboard', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } else if (mode === 'signup') {
                await register(formData);
                setSuccessMessage("Account created successfully! Please sign in.");
                setFormData({ ...formData, password: '' });
                setMode('login');
            } else if (mode === 'reset') {
                await resetPassword(formData.email);
                setSuccessMessage("If an account exists, a password reset email has been sent.");
                setFormData({ ...formData, password: '' }); // clear password field
                setTimeout(() => setMode('login'), 3000); // Auto go to login after 3s
            }
        } catch (err) {
            let userMsg = err.message || 'Authentication operation failed. Please try again.';
            if (err.message && err.message.includes('already registered')) {
                userMsg = 'This email is already registered. Please click "Log in" at the bottom.';
            }
            setError(userMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            const loggedUser = await loginWithGoogle();
            if (!loggedUser) {
                setLoading(false);
                return; // User cancelled the popup
            }
            if (loggedUser.role?.toUpperCase() === 'ADMIN') {
                navigate('/admin', { replace: true });
            } else if (loggedUser.role?.toUpperCase() === 'VENDOR') {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError(err.message || 'Google authentication failed.');
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (mode === 'login') return 'Welcome Back';
        if (mode === 'signup') return 'Create an Account';
        if (mode === 'reset') return 'Reset Password';
    };

    const getSubtitle = () => {
        if (mode === 'login') return 'Enter your credentials to access your account';
        if (mode === 'signup') return 'Join the premium multi-vendor marketplace';
        if (mode === 'reset') return "Enter your email and we'll send a recovery link";
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {mode === 'reset' && (
                    <button onClick={() => setMode('login')} style={styles.backBtn}>
                        <ChevronLeft size={20} /> Back
                    </button>
                )}

                <div style={styles.logoContainer}>
                    <div style={styles.logoIcon}>
                        <Zap size={24} color="white" />
                    </div>
                </div>

                <div style={styles.headerText}>
                    <h1 style={styles.title}>{getTitle()}</h1>
                    <p style={styles.subtitle}>{getSubtitle()}</p>
                </div>

                {error && (
                    <div style={styles.errorAlert}>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div style={styles.successAlert}>
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {(mode === 'signup') && (
                        <>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Username</label>
                                <div style={styles.inputWrapper}>
                                    <User size={18} style={styles.inputIcon} />
                                    <input type="text" name="username" placeholder="johndoe" value={formData.username} onChange={handleChange} required style={styles.input} />
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Account Type</label>
                                <div style={styles.inputWrapper}>
                                    <select name="role" value={formData.role} onChange={handleChange} style={{ ...styles.input, paddingLeft: '16px' }}>
                                        <option value="buyer">Buyer</option>
                                        <option value="vendor">Business / Vendor</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} style={styles.inputIcon} />
                            <input type="email" name="email" placeholder="name@email.com" value={formData.email} onChange={handleChange} required style={styles.input} />
                        </div>
                    </div>

                    {(mode === 'login' || mode === 'signup') && (
                        <div style={styles.inputGroup}>
                            <span style={styles.labelWrapper}>
                                <label style={styles.label}>Password</label>
                                {mode === 'login' && (
                                    <span onClick={() => setMode('reset')} style={styles.forgotPassword}>Forgot Password?</span>
                                )}
                            </span>
                            <div style={styles.inputWrapper}>
                                <Lock size={18} style={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={styles.eyeBtn}
                                >
                                    {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                                </button>
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link')}
                    </button>

                    {(mode === 'login' || mode === 'signup') && (
                        <>
                            <div style={styles.divider}>
                                <div style={styles.line}></div>
                                <span style={styles.dividerText}>or continue with</span>
                                <div style={styles.line}></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                style={styles.googleBtn}
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" style={{ width: '20px', height: '20px' }} />
                                Google
                            </button>
                        </>
                    )}

                    {mode === 'login' ? (
                        <p style={styles.footerText}>
                            Don't have an account?{' '}
                            <button type="button" onClick={() => setMode('signup')} style={styles.textBtn}>Sign up</button>
                        </p>
                    ) : mode === 'signup' ? (
                        <p style={styles.footerText}>
                            Already have an account?{' '}
                            <button type="button" onClick={() => setMode('login')} style={styles.textBtn}>Log in</button>
                        </p>
                    ) : null}
                </form>
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
        backgroundColor: '#0f172a', // Slate 900 Background for dark aesthetic
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', // Deep Indigo gradient
        padding: '24px',
    },
    card: {
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        backdropFilter: 'blur(12px)',
    },
    backBtn: {
        position: 'absolute',
        top: '24px',
        left: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#64748b',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
    },
    logoIcon: {
        width: '56px',
        height: '56px',
        backgroundColor: 'var(--brand-primary)', // Indigo Deep
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.4)',
    },
    headerText: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    title: {
        fontSize: '1.75rem',
        color: '#0f172a',
        marginBottom: '8px',
        fontWeight: 800,
    },
    subtitle: {
        fontSize: '0.9rem',
        color: '#64748b',
        margin: 0,
    },
    errorAlert: {
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        padding: '12px 16px',
        borderRadius: '12px',
        marginBottom: '24px',
        fontSize: '0.85rem',
        textAlign: 'center',
        border: '1px solid #fecaca',
    },
    successAlert: {
        backgroundColor: '#f0fdf4',
        color: '#15803d',
        padding: '12px 16px',
        borderRadius: '12px',
        marginBottom: '24px',
        fontSize: '0.85rem',
        textAlign: 'center',
        border: '1px solid #bbf7d0',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    labelWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#334155',
    },
    forgotPassword: {
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--brand-primary)',
        cursor: 'pointer',
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: '16px',
        color: '#94a3b8',
    },
    input: {
        width: '100%',
        padding: '14px 16px 14px 44px',
        borderRadius: '12px',
        border: '1px solid #cbd5e1',
        outline: 'none',
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    submitBtn: {
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        border: 'none',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '1rem',
        marginTop: '8px',
        transition: 'transform 0.2s, background-color 0.2s',
        cursor: 'pointer',
        boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.4)',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '8px 0',
    },
    line: {
        flex: 1,
        height: '1px',
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        padding: '0 12px',
        fontSize: '0.8rem',
        color: '#94a3b8',
        fontWeight: 600,
    },
    googleBtn: {
        backgroundColor: 'white',
        color: '#1e293b',
        border: '1px solid #cbd5e1',
        padding: '14px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    eyeBtn: {
        position: 'absolute',
        right: '12px',
        background: 'none',
        border: 'none',
        padding: '0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#64748b',
        marginTop: '16px',
    },
    textBtn: {
        color: 'var(--brand-primary)',
        fontWeight: 600,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
    }
};

export default AuthPages;
