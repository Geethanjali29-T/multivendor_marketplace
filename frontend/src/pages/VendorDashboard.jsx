import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard, ShoppingCart, Package, Grid, DollarSign, Tag, Users, MessageSquare,
    RefreshCcw, Calendar, Star, Bug, HelpCircle, BarChart2, Settings, LogOut, TrendingUp, ShoppingBag,
    Search, Bell, MessageCircle, MoveLeft, ChevronDown, Plus, Download, XCircle, CheckCircle, AlertTriangle, ShieldCheck, BarChart3, Globe, Zap, Activity, Database, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import OrderDetailsModal from '../components/OrderDetailsModal';
import ProductFormModal from '../components/ProductFormModal';
import './VendorDashboard.css';

const styles = {
    formLabel: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' },
    formInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--vendor-border)', fontSize: '0.9rem', outline: 'none' },
};

const VendorDashboard = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
    const [orderStatusFilter, setOrderStatusFilter] = useState('All');

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // Shop Settings State
    const [shopData, setShopData] = useState({
        shop_name: '',
        category: '',
        location: '',
        description: '',
        phone: '',
        gstin: '',
        shop_photo: '',
        logo_image: '',
        banner_image: ''
    });
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' }); // { text: '', type: 'success' | 'error' }
    const [savingShop, setSavingShop] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const fetchedCategories = await api.getCategories();
            setCategories(fetchedCategories.map(c => c.name) || ['Electronics', 'Fashion', 'Home']);

            const [vOrders, vAnalytics, allProducts, myShop] = await Promise.all([
                api.getVendorOrders(),
                api.getVendorAnalytics(),
                api.getProducts(),
                api.getMyShop().catch(() => null)
            ]);
            setOrders(vOrders.reverse());
            setAnalytics(vAnalytics);
            setProducts(allProducts.filter(p => p.vendor_username === user.username));
            if (myShop) setShopData(myShop);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const showMessage = (text, type = 'success') => {
        setStatusMessage({ text, type });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000);
    };

    const handleShopUpdate = async (e) => {
        e.preventDefault();
        setSavingShop(true);
        try {
            await api.setupVendorProfile(shopData);
            showMessage("Shop settings updated successfully!");
            fetchDashboardData();
        } catch (err) {
            showMessage(err.message || "Failed to update shop.", "error");
        } finally {
            setSavingShop(false);
        }
    };

    const counts = {
        all: orders.length,
        processing: orders.filter(o => o.status === 'Processing').length,
        shipped: orders.filter(o => o.status === 'Shipped').length,
        canceled: orders.filter(o => o.status === 'Canceled').length,
    };

    let filteredOrders = orders;
    if (orderStatusFilter !== 'All') {
        filteredOrders = orders.filter(o => o.status === orderStatusFilter);
    }

    const handleOrderStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.updateOrderStatus(orderId, newStatus);
            showMessage(`Order status updated to ${newStatus}`);
            fetchDashboardData();
        } catch (e) {
            showMessage("Failed to update status.", "error");
        }
    };

    const handleProductSave = async (productData) => {
        try {
            if (editingProduct) {
                await api.editVendorProduct(editingProduct._id || editingProduct.id, productData);
                showMessage("Product updated successfully!");
            } else {
                await api.addVendorProduct(productData);
                showMessage("New product added successfully!");
            }
            setIsProductModalOpen(false);
            fetchDashboardData();
        } catch (err) {
            showMessage(err.message || "Failed to save product.", "error");
        }
    };

    const handleProductDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.deleteVendorProduct(productId);
            showMessage("Product deleted successfully!");
            fetchDashboardData();
        } catch (err) {
            showMessage("Failed to delete product.", "error");
        }
    };

    if (loading) {
        return (
            <div className="vendor-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className="fade-in">Loading Merchant Console...</div>
            </div>
        );
    }

    const renderSidebar = () => (
        <aside className="vendor-sidebar">
            <div className="vendor-logo-area">
                <ShieldCheck size={28} color="var(--brand-primary)" />
                <span className="vendor-logo-text">MERCHANT PRO</span>
            </div>

            <nav className="vendor-nav">
                <div className="vendor-nav-label">STOREFRONT MGT</div>
                <button className={`vendor-nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    <TrendingUp size={18} /> LIVE ANALYTICS
                </button>
                <button className={`vendor-nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                    <ShoppingBag size={18} /> ORDER PIPELINE
                    {orders.filter(o => o.status === 'Pending').length > 0 &&
                        <span className="vendor-badge">{orders.filter(o => o.status === 'Pending').length}</span>
                    }
                </button>
                <button className={`vendor-nav-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                    <Settings size={18} /> Shop Settings
                </button>
                <button className="vendor-nav-btn" onClick={() => navigate(`/shop/${user.username}`)}>
                    <Globe size={18} /> View Store
                </button>
            </nav>

            <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--vendor-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {user?.username?.charAt(0).toUpperCase() || 'V'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username || 'Merchant'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#10b981' }}>● Online</div>
                    </div>
                </div>
                <button onClick={logout} className="vendor-nav-btn" style={{ color: '#ef4444' }}>
                    <LogOut size={18} /> Sign Out
                </button>
            </div>
        </aside>
    );

    const renderHeader = () => (
        <header className="vendor-header" style={{ position: 'relative' }}>
            <div className="vendor-search">
                <Search size={16} className="vendor-search-icon" />
                <input type="text" placeholder="Search orders, products..." />
            </div>

            {statusMessage.text && (
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: statusMessage.type === 'error' ? '#fee2e2' : '#dcfce7',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    zIndex: 1000,
                    border: `1px solid ${statusMessage.type === 'error' ? '#fecdd3' : '#bbf7d0'}`,
                    color: statusMessage.type === 'error' ? '#dc2626' : '#16a34a',
                    fontWeight: 600,
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    {statusMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    {statusMessage.text}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vendor-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Calendar size={16} /> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <MessageCircle size={20} color="var(--vendor-text-muted)" style={{ cursor: 'pointer' }} />
                    <Bell size={20} color="var(--vendor-text-muted)" style={{ cursor: 'pointer' }} />
                </div>
            </div>
        </header>
    );

    const renderDashboardOverview = () => (
        <div className="fade-in">
            <div className="vendor-page-header" style={{ marginBottom: '32px' }}>
                <h1 className="vendor-page-title">Welcome back, {user?.username}</h1>
                <p className="vendor-page-subtitle">Here is what is happening with your shop today.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div className="vendor-card" style={{ padding: '24px' }}>
                    <div style={{ color: 'var(--vendor-text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>Total Revenue</div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--vendor-text-main)' }}>₹{analytics?.total_revenue || '0'}</div>
                    <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>+12% from last week</div>
                </div>
                <div className="vendor-card" style={{ padding: '24px' }}>
                    <div style={{ color: 'var(--vendor-text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>Active Orders</div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--vendor-text-main)' }}>{counts.processing}</div>
                    <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>Requires processing</div>
                </div>
                <div className="vendor-card" style={{ padding: '24px' }}>
                    <div style={{ color: 'var(--vendor-text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>Inventory Items</div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--vendor-text-main)' }}>{products.length}</div>
                    <div style={{ color: 'var(--vendor-primary)', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>Active listings</div>
                </div>
                <div className="vendor-card" style={{ padding: '24px' }}>
                    <div style={{ color: 'var(--vendor-text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>Store Rating</div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--vendor-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        4.8 <Star size={24} fill="#f59e0b" color="#f59e0b" />
                    </div>
                    <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>Excellent performance</div>
                </div>
            </div>

            {analytics?.low_stock_alerts?.length > 0 && (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '20px', borderRadius: '16px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <AlertTriangle size={24} color="#e11d48" />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, color: '#9f1239', fontSize: '0.95rem' }}>Low Stock Inventory Alert</div>
                        <div style={{ color: '#be123c', fontSize: '0.85rem', marginTop: '4px' }}>
                            The following items are running low: {analytics.low_stock_alerts.map(p => `${p.name} (${p.stock} units)`).join(', ')}.
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="vendor-card">
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700 }}>Recent Orders</h3>
                    <div className="vendor-table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--vendor-border)', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--vendor-text-muted)' }}>Order ID</th>
                                    <th style={{ padding: '12px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--vendor-text-muted)' }}>Customer</th>
                                    <th style={{ padding: '12px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--vendor-text-muted)' }}>Amount</th>
                                    <th style={{ padding: '12px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--vendor-text-muted)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 5).map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600 }}>#{order.id.slice(-6).toUpperCase()}</td>
                                        <td style={{ padding: '16px 12px', fontSize: '0.85rem' }}>{order.buyer_username}</td>
                                        <td style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 700 }}>₹{order.total_amount}</td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <span className={`status-pill ${order.status === 'Processing' ? 'pending' : order.status === 'Delivered' ? 'success' : ''}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="vendor-card">
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700 }}>Sales Analysis</h3>
                    <div style={{ height: '240px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vendor-text-muted)', fontSize: '0.85rem' }}>
                        [ Sales Trend Graph ]
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOrdersPage = () => (
        <div className="fade-in vendor-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 className="vendor-page-title">Order Management</h1>
                    <p className="vendor-page-subtitle">Track and fulfill your customer orders efficiently.</p>
                </div>
                <button className="vendor-btn-primary">
                    <Download size={18} /> Export List
                </button>
            </div>

            <div className="vendor-tabs">
                {[
                    { label: 'All Orders', id: 'All', count: counts.all },
                    { label: 'Processing', id: 'Processing', count: counts.processing },
                    { label: 'Shipped', id: 'Shipped', count: counts.shipped },
                    { label: 'Canceled', id: 'Canceled', count: counts.canceled },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`vendor-tab-btn ${orderStatusFilter === tab.id ? 'active' : ''}`}
                        onClick={() => setOrderStatusFilter(tab.id)}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            <div className="vendor-table-container">
                <div className="vendor-table-header" style={{ gridTemplateColumns: '1fr 2fr 1fr 1.5fr 1fr 1fr' }}>
                    <div>ID</div>
                    <div>Customer / Product</div>
                    <div>Price</div>
                    <div>Date</div>
                    <div>Status</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--vendor-text-muted)' }}>No orders found for this category.</div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className="vendor-table-row" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1.5fr 1fr 1fr', padding: '16px 24px', alignItems: 'center', fontSize: '0.9rem' }}>
                                <div style={{ fontWeight: 700 }}>#{order.id.slice(-6).toUpperCase()}</div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{order.buyer_username}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-muted)' }}>{order.items?.length} items</div>
                                </div>
                                <div style={{ fontWeight: 700 }}>₹{order.total_amount}</div>
                                <div style={{ color: 'var(--vendor-text-muted)' }}>{new Date(order.created_at || Date.now()).toLocaleDateString()}</div>
                                <div>
                                    <span className={`status-pill ${order.status === 'Processing' ? 'pending' : order.status === 'Shipped' ? 'success' : ''}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }} className="vendor-btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex' }}>Manage</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const renderProductsPage = () => (
        <div className="fade-in vendor-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="vendor-page-title">Inventory Management</h1>
                    <p className="vendor-page-subtitle">Manage your product catalog and digital presence.</p>
                </div>
                <button
                    onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                    className="vendor-btn-primary"
                >
                    <Plus size={18} /> Add New Product
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {products.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px' }}>
                        <Package size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
                        <p style={{ color: 'var(--vendor-text-muted)' }}>Your digital storefront is empty. Start adding products!</p>
                    </div>
                ) : (
                    products.map(product => (
                        <div key={product.id} className="vendor-table-row" style={{ overflow: 'hidden', padding: 0 }}>
                            <div style={{ height: '200px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {product.image ? (
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Package size={40} color="#cbd5e1" />
                                )}
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{product.name}</h3>
                                    <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>{product.category}</span>
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--vendor-primary)', marginBottom: '16px' }}>₹{product.price}</div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="vendor-btn-primary" style={{ flex: 1, padding: '8px', background: 'white', color: 'var(--vendor-text-main)', border: '1px solid var(--vendor-border)' }}>Edit Details</button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleProductDelete(product._id || product.id); }}
                                        className="vendor-btn-primary"
                                        style={{ background: '#fee2e2', color: '#dc2626' }}
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderSettingsPage = () => (
        <div className="fade-in vendor-card">
            <div style={{ marginBottom: '32px' }}>
                <h1 className="vendor-page-title">Shop Settings</h1>
                <p className="vendor-page-subtitle">Configure your store's public identity and preferences.</p>
            </div>

            <form onSubmit={handleShopUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={styles.formLabel}>Shop Name</label>
                        <input
                            style={styles.formInput}
                            type="text"
                            value={shopData.shop_name}
                            onChange={(e) => setShopData({ ...shopData, shop_name: e.target.value })}
                            placeholder="My Awesome Store"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label style={styles.formLabel}>Business Category</label>
                        <select
                            style={styles.formInput}
                            value={shopData.category}
                            onChange={(e) => setShopData({ ...shopData, category: e.target.value })}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={styles.formLabel}>Location / City</label>
                        <input
                            style={styles.formInput}
                            type="text"
                            value={shopData.location}
                            onChange={(e) => setShopData({ ...shopData, location: e.target.value })}
                            placeholder="e.g. New Delhi, India"
                        />
                    </div>
                    <div className="form-group">
                        <label style={styles.formLabel}>Shop Description</label>
                        <textarea
                            style={{ ...styles.formInput, height: '100px', resize: 'none' }}
                            value={shopData.description}
                            onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
                            placeholder="Tell your customers about your store..."
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={styles.formLabel}>Contact Phone</label>
                        <input
                            style={styles.formInput}
                            type="text"
                            value={shopData.phone}
                            onChange={(e) => setShopData({ ...shopData, phone: e.target.value })}
                            placeholder="+91 9876543210"
                        />
                    </div>
                    <div className="form-group">
                        <label style={styles.formLabel}>Logo Image URL</label>
                        <input
                            style={styles.formInput}
                            type="text"
                            value={shopData.logo_image}
                            onChange={(e) => setShopData({ ...shopData, logo_image: e.target.value })}
                            placeholder="https://example.com/logo.png"
                        />
                    </div>
                    <div className="form-group">
                        <label style={styles.formLabel}>Banner Image URL</label>
                        <input
                            style={styles.formInput}
                            type="text"
                            value={shopData.banner_image}
                            onChange={(e) => setShopData({ ...shopData, banner_image: e.target.value })}
                            placeholder="https://example.com/banner.jpg"
                        />
                    </div>
                    <button
                        type="submit"
                        className="vendor-btn-primary"
                        disabled={savingShop}
                        style={{ marginTop: '20px', width: '100%', justifyContent: 'center', height: '48px' }}
                    >
                        {savingShop ? 'Saving Changes...' : 'Save Decorations'}
                    </button>
                    <Link
                        to={`/shop/${user.username}`}
                        className="vendor-btn-primary"
                        style={{
                            background: 'white',
                            color: 'var(--vendor-primary)',
                            border: '1px solid var(--vendor-primary)',
                            justifyContent: 'center',
                            textDecoration: 'none'
                        }}
                    >
                        Preview Public Shop
                    </Link>
                </div>
            </form>
        </div>
    );

    return (
        <div className="vendor-layout">
            {renderSidebar()}
            <main className="vendor-main">
                {renderHeader()}
                <div className="vendor-content">
                    {activeTab === 'dashboard' && renderDashboardOverview()}
                    {activeTab === 'orders' && renderOrdersPage()}
                    {activeTab === 'products' && renderProductsPage()}
                    {activeTab === 'settings' && renderSettingsPage()}
                    {(activeTab !== 'dashboard' && activeTab !== 'orders' && activeTab !== 'products' && activeTab !== 'settings') && (
                        <div className="fade-in vendor-card" style={{ textAlign: 'center', padding: '100px 0' }}>
                            <Zap size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                            <h2 style={{ color: 'var(--vendor-text-muted)' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
                            <p style={{ color: '#94a3b8' }}>Advanced features for this module are arriving soon.</p>
                            <button onClick={() => setActiveTab('dashboard')} className="vendor-btn-primary" style={{ marginTop: '24px', marginInline: 'auto' }}>Go to Overview</button>
                        </div>
                    )}
                </div>
            </main>


            <OrderDetailsModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                order={selectedOrder}
            />

            <ProductFormModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSave={handleProductSave}
                product={editingProduct}
                categories={categories}
            />
        </div>
    );
};

export default VendorDashboard;
