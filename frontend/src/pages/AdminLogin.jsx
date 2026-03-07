import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Lock, User, Activity } from 'lucide-react';
import './AdminDashboard.css'; // Reuse the dark Command Center theme

const AdminLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const loggedInUser = await login(formData.username, formData.password);
            // Validate that the user has ADMIN role
            if (!loggedInUser || !['admin', 'ADMIN'].includes(loggedInUser.role)) {
                setError('Access denied. This account does not have admin privileges.');
                setLoading(false);
                return;
            }
            navigate('/admin');
        } catch (err) {
            setError(err.message || 'Authorization failed. Invalid credentials or insufficient clearance.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cmd-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>

            {/* Softened Background elements */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '20%', left: '10%', width: '400px', height: '400px', background: '#3b82f6', filter: 'blur(120px)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '300px', height: '300px', background: '#8b5cf6', filter: 'blur(120px)', borderRadius: '50%' }}></div>
            </div>

            <div className="cmd-card fade-in" style={{ width: '100%', maxWidth: '420px', zIndex: 1, position: 'relative', borderTop: '4px solid #3b82f6' }}>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '16px'
                    }}>
                        <ShieldCheck size={32} style={{ color: '#60a5fa' }} />
                    </div>
                    <h1 className="cmd-page-title" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Admin Portal</h1>
                    <div className="cmd-mono" style={{ color: '#94a3b8' }}><Activity size={12} style={{ display: 'inline', marginRight: '4px' }} /> Secure Access Node</div>
                </div>

                {error && (
                    <div className="cmd-alert-banner" style={{ padding: '12px 16px', marginBottom: '24px', backgroundColor: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(226, 30, 72, 0.2)' }}>
                        <Lock size={16} className="cmd-rose" />
                        <span style={{ color: '#fecdd3', fontSize: '0.85rem' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div className="cmd-input-wrapper" style={{ marginTop: 0 }}>
                        <User size={18} className="cmd-input-icon" />
                        <input
                            type="text"
                            className="cmd-input"
                            placeholder="Email or Username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="cmd-input-wrapper" style={{ marginTop: 0 }}>
                        <Lock size={18} className="cmd-input-icon" />
                        <input
                            type="password"
                            className="cmd-input"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="cmd-neon-btn"
                        style={{ marginTop: '12px', padding: '16px', letterSpacing: '1px', background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.5)' }}
                    >
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>

                </form>
                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                    <button
                        onClick={() => navigate('/')}
                        className="cmd-icon-action"
                        style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem', color: '#94a3b8', margin: '0 auto', gap: '8px', border: 'none', background: 'transparent' }}
                    >
                        Return to Public Storefront
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
