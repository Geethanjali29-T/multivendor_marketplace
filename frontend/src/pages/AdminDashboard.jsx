import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import './AdminDashboard.css';
import {
    Users, ShoppingCart, TrendingUp, AlertTriangle,
    Settings, Package, CheckCircle, XCircle,
    BarChart3, ShieldCheck, Search, Bell, Activity,
    Database, Server, Zap, Globe, ChevronRight, Terminal, FileText
} from 'lucide-react';

const AdminDashboard = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state?.activeTab]);

    const [settings, setSettings] = useState({
        enableReviews: true,
        chatbotApiKey: '',
        aiRecommendations: true,
        returnPolicy: 'Standard 7-day return policy'
    });

    const [isSaving, setIsSaving] = useState(false);

    const fetchConfig = async () => {
        try {
            const config = await api.getPlatformConfig();
            setSettings({
                enableReviews: config.reviews_enabled,
                chatbotApiKey: config.chatbot_api_key,
                aiRecommendations: config.recommendations_enabled,
                return_policy: config.return_policy
            });
        } catch (error) {
            console.error("Error fetching config:", error);
        }
    };

    const saveConfig = async (newSettings) => {
        setIsSaving(true);
        try {
            await api.updatePlatformConfig({
                reviews_enabled: newSettings.enableReviews,
                chatbot_api_key: newSettings.chatbotApiKey,
                recommendations_enabled: newSettings.aiRecommendations,
                return_policy: newSettings.returnPolicy
            });
        } catch (error) {
            setAdminMsg({ type: 'error', text: "Failed to save config: " + error.message });
            setTimeout(() => setAdminMsg({ type: '', text: '' }), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    const [data, setData] = useState({
        buyers: [],
        vendors: [],
        orders: [],
        stats: {
            totalRevenue: '₹2,84,900',
            activeUsers: '1,240',
            activeVendors: '84',
            pendingApprovals: '12'
        }
    });

    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminForm, setAdminForm] = useState({ username: '', email: '', password: '' });
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminMsg, setAdminMsg] = useState({ type: '', text: '' });

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setAdminLoading(true);
        setAdminMsg({ type: '', text: '' });
        try {
            await api.createAdmin(adminForm);
            setAdminMsg({ type: 'success', text: 'Admin account created.' });
            setTimeout(() => {
                setShowAdminModal(false);
                setAdminForm({ username: '', email: '', password: '' });
                setAdminMsg({ type: '', text: '' });
            }, 1000);
        } catch (error) {
            setAdminMsg({ type: 'error', text: error.message || 'Creation failed.' });
        } finally {
            setAdminLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            const [buyers, vendors, analytics] = await Promise.all([
                api.getAdminBuyers(),
                api.getAdminVendors(),
                api.getAdminAnalytics()
            ]);
            setData(prev => ({
                ...prev,
                buyers: buyers,
                vendors: vendors,
                stats: {
                    totalRevenue: `₹${analytics.total_revenue || 0}`,
                    activeUsers: analytics.active_users || 0,
                    activeVendors: analytics.total_vendors || 0,
                    pendingApprovals: vendors.filter(v => !v.approved).length
                }
            }));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchConfig();
    }, []);

    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        saveConfig(newSettings);
    };

    const handleApproveVendor = async (username, approved) => {
        try {
            await api.approveVendor(username, approved);
            setAdminMsg({ type: 'success', text: `Vendor ${approved ? 'approved' : 'rejected'} successfully.` });
            setTimeout(() => setAdminMsg({ type: '', text: '' }), 3000);
            fetchData();
        } catch (e) {
            setAdminMsg({ type: 'error', text: `Failed: ` + e.message });
            setTimeout(() => setAdminMsg({ type: '', text: '' }), 5000);
        }
    };

    const handleUpdateUserStatus = async (username, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await api.updateUserStatus(username, newStatus);
            setAdminMsg({ type: 'success', text: `User status updated to ${newStatus}.` });
            setTimeout(() => setAdminMsg({ type: '', text: '' }), 3000);
            fetchData();
        } catch (e) {
            setAdminMsg({ type: 'error', text: `Failed: ` + e.message });
            setTimeout(() => setAdminMsg({ type: '', text: '' }), 5000);
        }
    };

    const renderSidebar = () => (
        <aside className="cmd-sidebar">
            <div className="cmd-logo-area">
                <ShieldCheck size={28} className="cmd-logo-icon" />
                <span className="cmd-logo-text">CORE CMD</span>
            </div>

            <nav className="cmd-nav">
                <div className="cmd-nav-label">OPERATIONS</div>
                <button className={`cmd-nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    <Activity size={18} /> LIVE INSIGHTS
                </button>
                <button className={`cmd-nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                    <Users size={18} /> USER BASE
                </button>
                <button className={`cmd-nav-btn ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>
                    <Database size={18} /> VENDOR NODES
                    {data.vendors.filter(v => !v.approved).length > 0 &&
                        <span className="cmd-badge-pulse">{data.vendors.filter(v => !v.approved).length}</span>
                    }
                </button>
                <button className={`cmd-nav-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
                    <Globe size={18} /> GLOBAL LEDGER
                </button>

                <div className="cmd-nav-label" style={{ marginTop: '32px' }}>CONFIGURATION</div>
                <button className={`cmd-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    <Settings size={18} /> SYSTEM CORE
                </button>
                <button className={`cmd-nav-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
                    <Terminal size={18} /> EVENT LOGS
                </button>

                <div className="cmd-nav-label" style={{ marginTop: '32px' }}>EXTERNAL</div>
                <button className="cmd-nav-btn" onClick={() => window.location.href = '/'}>
                    <Globe size={18} /> STOREFRONT
                </button>
            </nav>

            <div className="cmd-sidebar-footer">
                <div className="cmd-admin-info glass">
                    <div className="cmd-admin-avatar">SA</div>
                    <div>
                        <div className="cmd-admin-name">ADMIN COMMANDER</div>
                        <div className="cmd-admin-status">● SYSTEM ONLINE</div>
                    </div>
                </div>
            </div>
        </aside>
    );

    const renderHeader = () => (
        <header className="cmd-header">
            <h1 className="cmd-page-title">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'users' && 'Customer Management'}
                {activeTab === 'vendors' && 'Vendor Management'}
                {activeTab === 'transactions' && 'Global Ledger'}
                {activeTab === 'settings' && 'Platform Settings'}
                {activeTab === 'logs' && 'System Logs'}
            </h1>

            <div className="cmd-header-right">
                {isSaving && <span style={{ fontSize: '0.75rem', color: 'var(--admin-primary)', fontWeight: 600 }}>Saving...</span>}
                <div className="cmd-search">
                    <Search size={16} />
                    <input type="text" placeholder="Search..." />
                </div>
                <button className="cmd-icon-btn"><Bell size={18} /><span className="cmd-dot"></span></button>
            </div>
        </header>
    );

    const renderOverview = () => (
        <div className="cmd-panel-fade">
            <div className="cmd-alert-banner">
                <div className="cmd-alert-icon"><AlertTriangle size={20} /></div>
                <div className="cmd-alert-text">
                    <strong>Notice:</strong> 3 pending vendor applications require immediate review for account verification.
                </div>
                <button className="cmd-neon-btn danger sm" onClick={() => setActiveTab('vendors')}>Review Now</button>
            </div>

            <div className="cmd-metrics-grid">
                <div className="cmd-metric-card">
                    <div className="cmd-metric-header">TOTAL VOLUME <TrendingUp size={16} /></div>
                    <div className="cmd-metric-value">{data.stats.totalRevenue}</div>
                    <div className="cmd-metric-trend up">+14.2% GROWTH</div>
                </div>

                <div className="cmd-metric-card">
                    <div className="cmd-metric-header">TOTAL USERS <Users size={16} /></div>
                    <div className="cmd-metric-value">{data.stats.activeUsers}</div>
                    <div className="cmd-metric-trend up">+8.5% INCREASE</div>
                </div>

                <div className="cmd-metric-card">
                    <div className="cmd-metric-header">ACTIVE NODES <Database size={16} /></div>
                    <div className="cmd-metric-value">{data.stats.activeVendors}</div>
                    <div className="cmd-metric-trend up">+4.1% UPTIME</div>
                </div>

                <div className="cmd-metric-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="cmd-metric-header">PENDING OPS <AlertTriangle size={16} color="#ef4444" /></div>
                    <div className="cmd-metric-value" style={{ color: '#ef4444' }}>{data.vendors.filter(v => !v.approved).length || data.stats.pendingApprovals}</div>
                    <div className="cmd-metric-trend down">ATTENTION REQUIRED</div>
                </div>
            </div>

            <div className="cmd-card">
                <h3 className="cmd-card-title">Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                        { time: '10:42 AM', code: 'JOIN', desc: 'New vendor "TrendMart" registered.' },
                        { time: '10:15 AM', code: 'SALE', desc: 'Order #TRL-2910 confirmed successfully.' },
                        { time: '09:30 AM', code: 'AUTH', desc: 'Admin login detected from new IP address.' }
                    ].map((log, i) => (
                        <div key={i} style={{ display: 'flex', gap: '16px', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--admin-text-muted)', width: '70px' }}>{log.time}</span>
                            <span style={{ fontWeight: 700, width: '40px', color: 'var(--admin-primary)' }}>{log.code}</span>
                            <span style={{ color: 'var(--admin-text-main)' }}>{log.desc}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="cmd-panel-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="cmd-card-title" style={{ margin: 0 }}>Customer Directory</h2>
                <button className="cmd-neon-btn" onClick={() => setShowAdminModal(true)}>
                    + Create Admin Account
                </button>
            </div>

            <div className="cmd-card">
                <div className="cmd-table-container">
                    <table className="cmd-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Internal ID</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.buyers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="cmd-table-main-text">{user.name}</div>
                                        <div className="cmd-table-sub-text">@{user.username}</div>
                                    </td>
                                    <td><span className="cmd-mono">#{user.id.slice(0, 8)}</span></td>
                                    <td>{user.email || 'N/A'}</td>
                                    <td>
                                        <span className={`cmd-status-pill ${user.status === 'suspended' ? 'red' : 'green'}`}>
                                            {user.status === 'suspended' ? 'Suspended' : 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="cmd-icon-action"
                                            onClick={() => handleUpdateUserStatus(user.username, user.status || 'active')}
                                        >
                                            {user.status === 'suspended' ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderVendors = () => (
        <div className="cmd-panel-fade cmd-card">
            <div className="cmd-table-container">
                <table className="cmd-table">
                    <thead>
                        <tr>
                            <th>Store Name</th>
                            <th>Username</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Operation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.vendors.map(vendor => (
                            <tr key={vendor.id}>
                                <td><div className="cmd-table-main-text">{vendor.shopName || vendor.name}</div></td>
                                <td><span className="cmd-mono">@{vendor.username}</span></td>
                                <td>{vendor.category || 'Default'}</td>
                                <td>
                                    <span className={`cmd-status-pill ${vendor.approved ? 'green' : 'yellow'}`}>
                                        {vendor.approved ? 'Verified' : 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {!vendor.approved && (
                                            <button className="cmd-neon-btn sm" onClick={() => handleApproveVendor(vendor.username, true)}>
                                                Approve
                                            </button>
                                        )}
                                        <button className="cmd-neon-btn danger sm" onClick={() => handleApproveVendor(vendor.username, vendor.approved ? false : false)}>
                                            {vendor.approved ? 'Revoke' : 'Reject'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="cmd-panel-fade cmd-card" style={{ maxWidth: '800px' }}>
            <h3 className="cmd-card-title">Configuration Management</h3>

            <div className="cmd-setting-row">
                <div>
                    <div className="cmd-setting-title">Customer Reviews</div>
                    <div className="cmd-setting-desc">Allow customers to post and view product reviews.</div>
                </div>
                <label className="cmd-toggle">
                    <input type="checkbox" checked={settings.enableReviews} onChange={e => updateSetting('enableReviews', e.target.checked)} />
                    <span className="cmd-toggle-slider"></span>
                </label>
            </div>

            <div className="cmd-setting-row">
                <div>
                    <div className="cmd-setting-title">Product Recommendations</div>
                    <div className="cmd-setting-desc">Use AI logic to show relevant products to users.</div>
                </div>
                <label className="cmd-toggle">
                    <input type="checkbox" checked={settings.aiRecommendations} onChange={e => updateSetting('aiRecommendations', e.target.checked)} />
                    <span className="cmd-toggle-slider"></span>
                </label>
            </div>

            <div style={{ marginTop: '24px' }}>
                <label className="cmd-setting-title">Chatbot API Key</label>
                <div className="cmd-input-wrapper">
                    <Zap size={16} className="cmd-input-icon" />
                    <input
                        type="password" className="cmd-input" value={settings.chatbotApiKey}
                        onChange={e => updateSetting('chatbotApiKey', e.target.value)} placeholder="Enter API Key"
                    />
                </div>
            </div>

            <div style={{ marginTop: '24px' }}>
                <label className="cmd-setting-title">Platform Return Policy</label>
                <textarea
                    className="cmd-textarea" value={settings.returnPolicy}
                    onChange={e => updateSetting('returnPolicy', e.target.value)} placeholder="Type policy details..."
                />
            </div>
        </div>
    );

    const renderLogs = () => (
        <div className="cmd-panel-fade cmd-card">
            <h3 className="cmd-card-title">Event Logging</h3>
            <div className="cmd-table-container">
                <table className="cmd-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Source</th>
                            <th>Event</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { time: '2024-03-06 14:22', source: 'AuthService', event: 'USER_LOGIN', status: 'OK' },
                            { time: '2024-03-06 14:19', source: 'VendorSvc', event: 'VERIFY_VENDOR', status: 'SUCCESS' },
                            { time: '2024-03-06 14:15', source: 'AdminConsole', event: 'CONFIG_UPDATE', status: 'SYNCED' }
                        ].map((log, i) => (
                            <tr key={i}>
                                <td><span className="cmd-mono">{log.time}</span></td>
                                <td>{log.source}</td>
                                <td><span className="cmd-status-pill cyan">{log.event}</span></td>
                                <td><span style={{ color: '#22c55e', fontWeight: 700 }}>{log.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="cmd-container">
            {showAdminModal && (
                <div className="cmd-modal-overlay">
                    <div className="cmd-modal" style={{ maxWidth: '400px' }}>
                        <div className="cmd-modal-header">
                            <h3 style={{ margin: 0 }}>New Admin Account</h3>
                            <button onClick={() => setShowAdminModal(false)} className="cmd-icon-btn"><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="cmd-input-wrapper">
                                <Users size={16} className="cmd-input-icon" />
                                <input
                                    type="text" className="cmd-input" placeholder="Username"
                                    value={adminForm.username} onChange={e => setAdminForm({ ...adminForm, username: e.target.value })} required
                                />
                            </div>
                            <div className="cmd-input-wrapper">
                                <Globe size={16} className="cmd-input-icon" />
                                <input
                                    type="email" className="cmd-input" placeholder="Email Address"
                                    value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} required
                                />
                            </div>
                            <div className="cmd-input-wrapper">
                                <ShieldCheck size={16} className="cmd-input-icon" />
                                <input
                                    type="password" className="cmd-input" placeholder="Password"
                                    value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} required
                                />
                            </div>
                            {adminMsg.text && <div style={{ color: adminMsg.type === 'error' ? '#ef4444' : '#10b981', fontSize: '0.85rem' }}>{adminMsg.text}</div>}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="submit" className="cmd-neon-btn" style={{ flex: 1 }} disabled={adminLoading}>
                                    {adminLoading ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {renderSidebar()}
            <main className="cmd-main-content">
                {renderHeader()}

                {adminMsg.text && !showAdminModal && (
                    <div style={{
                        margin: '0 40px 24px 40px',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        backgroundColor: adminMsg.type === 'error' ? '#fee2e2' : '#dcfce7',
                        color: adminMsg.type === 'error' ? '#b91c1c' : '#166534',
                        border: `1px solid ${adminMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        {adminMsg.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        {adminMsg.text}
                    </div>
                )}
                <div className="cmd-content-scroll">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'vendors' && renderVendors()}
                    {activeTab === 'transactions' && (
                        <div className="cmd-card" style={{ textAlign: 'center', padding: '100px 0' }}>
                            <Globe size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                            <h3 style={{ color: '#94a3b8' }}>Global Ledger Mapping</h3>
                            <p style={{ color: '#64748b' }}>Currently aggregating real-time transaction nodes.</p>
                        </div>
                    )}
                    {activeTab === 'settings' && renderSettings()}
                    {activeTab === 'logs' && renderLogs()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
