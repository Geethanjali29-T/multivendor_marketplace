import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import './ProfilePage.css';
import {
    User, Store, Save, Shield, Compass, MapPin,
    CreditCard, Package, ChevronRight, CheckCircle2,
    Clock, Truck, Star
} from 'lucide-react';
import ProductModal from '../components/ProductModal';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('account'); // 'account', 'orders', 'shop'

    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [productToReview, setProductToReview] = useState(null);

    // Vendor Shop State
    const [shopData, setShopData] = useState({
        name: '', category: 'Electronics', location: '', phone: '',
        gstin: '', website: '', description: ''
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
                        setShopData(prev => ({ ...prev, ...shop }));
                        setHasShop(true);
                    }
                } catch (e) { console.log("No shop found."); }
            };
            fetchShop();
        }

        const fetchOrders = async () => {
            try {
                const fetchedOrders = await api.getUserOrders();
                setOrders(fetchedOrders);
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setOrdersLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true); setProfileMsg({ type: '', text: '' });
        try {
            await api.updateUserProfile({ username: profileData.username, phone: profileData.phone, address: profileData.address });
            setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
            const updatedUser = { ...user, username: profileData.username, phone: profileData.phone, address: profileData.address };
            setUser(updatedUser);
            if (!user.isGoogleAuth) localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.message || 'Failed to update.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleShopUpdate = async (e) => {
        e.preventDefault();
        setShopLoading(true); setShopMsg({ type: '', text: '' });
        try {
            await api.setupVendorProfile(shopData);
            setShopMsg({ type: 'success', text: 'Shop configuration saved.' });
            setHasShop(true);
        } catch (err) {
            setShopMsg({ type: 'error', text: err.message || 'Failed to update shop.' });
        } finally {
            setShopLoading(false);
        }
    };

    if (!user) {
        return <div className="retail-container">Please log in to view your profile.</div>;
    }

    const renderAccountTab = () => (
        <div className="retail-tab-content fade-in">
            <h2 className="retail-section-title">Personal Overview</h2>
            <p className="retail-section-desc">Manage your personal data, secure your account, and tailor your TradeLink experience.</p>

            {profileMsg.text && (
                <div className={`retail-alert ${profileMsg.type}`}>
                    {profileMsg.text}
                </div>
            )}

            <form className="retail-form" onSubmit={handleProfileUpdate}>
                <div className="retail-form-group">
                    <label>Email Address</label>
                    <div className="retail-input-wrapper disabled">
                        <User size={18} className="retail-input-icon" />
                        <input type="email" value={profileData.email} disabled />
                    </div>
                    <div className="retail-input-help"><Shield size={12} /> Contact support to change email</div>
                </div>

                <div className="retail-form-row">
                    <div className="retail-form-group">
                        <label>Display Name</label>
                        <input type="text" value={profileData.username} onChange={e => setProfileData({ ...profileData, username: e.target.value })} required className="retail-input" />
                    </div>
                    <div className="retail-input-group">
                        <label>Phone Number</label>
                        <input type="tel" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} className="retail-input" />
                    </div>
                </div>

                <div className="retail-form-group">
                    <label>Primary Shipping Address</label>
                    <div className="retail-input-wrapper align-top">
                        <MapPin size={18} className="retail-input-icon" style={{ marginTop: '12px' }} />
                        <textarea
                            value={profileData.address}
                            onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                            className="retail-textarea"
                            placeholder="Enter full street address, city, state, zip..."
                        />
                    </div>
                </div>

                <div className="retail-form-actions">
                    <button type="submit" disabled={profileLoading} className="retail-btn-primary">
                        {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderShopTab = () => (
        <div className="retail-tab-content fade-in">
            <h2 className="retail-section-title">Merchant Center</h2>
            <p className="retail-section-desc">Configure your public storefront presence and business details.</p>

            {shopMsg.text && (
                <div className={`retail-alert ${shopMsg.type}`}>
                    {shopMsg.text}
                </div>
            )}

            <form className="retail-form" onSubmit={handleShopUpdate}>
                <div className="retail-form-group">
                    <label>Public Shop Name</label>
                    <div className="retail-input-wrapper">
                        <Store size={18} className="retail-input-icon" />
                        <input type="text" value={shopData.name} onChange={e => setShopData({ ...shopData, name: e.target.value })} required className="retail-input" />
                    </div>
                </div>

                <div className="retail-form-row">
                    <div className="retail-form-group">
                        <label>Business Category</label>
                        <select value={shopData.category} onChange={e => setShopData({ ...shopData, category: e.target.value })} className="retail-input">
                            <option value="Electronics">Electronics & Tech</option>
                            <option value="Fashion">Fashion & Apparel</option>
                            <option value="Grocery">Home & Grocery</option>
                            <option value="Education">Education Services</option>
                            <option value="Others">General Merchandise</option>
                        </select>
                    </div>
                    <div className="retail-form-group">
                        <label>Operational City</label>
                        <input type="text" value={shopData.location} onChange={e => setShopData({ ...shopData, location: e.target.value })} required className="retail-input" />
                    </div>
                </div>

                <div className="retail-form-row">
                    <div className="retail-form-group">
                        <label>Support Phone</label>
                        <input type="tel" value={shopData.phone} onChange={e => setShopData({ ...shopData, phone: e.target.value })} required className="retail-input" />
                    </div>
                    <div className="retail-form-group">
                        <label>Tax ID / GSTIN</label>
                        <input type="text" value={shopData.gstin} onChange={e => setShopData({ ...shopData, gstin: e.target.value })} className="retail-input" placeholder="Optional" />
                    </div>
                </div>

                <div className="retail-form-group">
                    <label>Store Description</label>
                    <textarea
                        value={shopData.description}
                        onChange={e => setShopData({ ...shopData, description: e.target.value })}
                        required
                        className="retail-textarea"
                        placeholder="Tell customers about your brand..."
                    />
                </div>

                <div className="retail-form-actions">
                    <button type="submit" disabled={shopLoading} className="retail-btn-primary store-btn">
                        {shopLoading ? 'Saving...' : (hasShop ? 'Update Merchant Profile' : 'Launch Shop')}
                    </button>
                </div>
            </form>
        </div>
    );

    const getProgressLevel = (status) => {
        if (!status) return 1;
        const s = status.toUpperCase();
        if (s === 'PENDING' || s === 'PROCESSING') return 1;
        if (s === 'SHIPPED') return 2;
        if (s === 'DELIVERED') return 3;
        return 0; // Canceled or returned
    };

    const renderOrdersTab = () => (
        <div className="retail-tab-content fade-in">
            <h2 className="retail-section-title">Order History</h2>
            <p className="retail-section-desc">Track, manage, and review your recent purchases.</p>

            {ordersLoading ? (
                <div className="retail-loading">Retrieving your orders...</div>
            ) : orders.length === 0 ? (
                <div className="retail-empty-state">
                    <Package size={48} className="retail-empty-icon" />
                    <h3>No recent orders</h3>
                    <p>When you purchase items, they will appear here with live tracking.</p>
                </div>
            ) : (
                <div className="retail-order-list">
                    {orders.map(order => {
                        const level = getProgressLevel(order.status);
                        const isTerminal = order.status === 'DELIVERED' || order.status === 'RETURN_REQUESTED' || order.status === 'CANCELED';

                        return (
                            <div key={order._id || order.id} className="retail-order-card">
                                <div className="retail-order-header">
                                    <div className="retail-order-meta">
                                        <div className="retail-order-id">Order {String(order._id || order.id).slice(-8).toUpperCase()}</div>
                                        <div className="retail-order-date">Purchased on {new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                    </div>
                                    <div className="retail-order-total">
                                        <span>Total</span>
                                        <strong>₹{order.total_amount.toLocaleString()}</strong>
                                    </div>
                                </div>

                                <div className="retail-order-items">
                                    {(order.items || []).map((item, idx) => (
                                        <div key={idx} className="retail-order-item">
                                            <div className="retail-item-thumb">
                                                <Package size={24} color="#94a3b8" />
                                            </div>
                                            <div className="retail-item-details">
                                                <div className="retail-item-name">{item.name}</div>
                                                <div className="retail-item-price">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</div>
                                            </div>
                                            {order.status === 'DELIVERED' && (
                                                <button
                                                    className="retail-btn-ghost sm"
                                                    onClick={() => {
                                                        setProductToReview({
                                                            id: item.product_id, name: item.name, price: item.price,
                                                            vendor_name: order.vendor_username, description: 'Purchased recently'
                                                        });
                                                        setIsReviewModalOpen(true);
                                                    }}
                                                >
                                                    <Star size={14} /> Review item
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {!['CANCELED', 'RETURN_REQUESTED'].includes(order.status) && (
                                    <div className="retail-tracker">
                                        <div className="retail-track-line">
                                            <div className="retail-track-progress" style={{ width: level === 1 ? '0%' : level === 2 ? '50%' : '100%' }}></div>
                                        </div>
                                        <div className="retail-track-steps">
                                            <div className={`retail-track-step ${level >= 1 ? 'active' : ''}`}>
                                                <div className="retail-step-icon"><Clock size={16} /></div>
                                                <span>Processing</span>
                                            </div>
                                            <div className={`retail-track-step ${level >= 2 ? 'active' : ''}`}>
                                                <div className="retail-step-icon"><Truck size={16} /></div>
                                                <span>Shipped</span>
                                            </div>
                                            <div className={`retail-track-step ${level >= 3 ? 'active' : ''}`}>
                                                <div className="retail-step-icon"><CheckCircle2 size={16} /></div>
                                                <span>Delivered</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="retail-order-footer">
                                    <span className={`retail-status-pill ${order.status?.toLowerCase() || 'processing'}`}>
                                        {order.status || 'PROCESSING'}
                                    </span>

                                    <div className="retail-order-actions">
                                        {(order.status === 'PENDING' || order.status === 'PROCESSING' || order.status === 'SHIPPED') && (
                                            <button
                                                className="retail-btn-secondary"
                                                onClick={async () => {
                                                    try {
                                                        const idRef = order._id || order.id;
                                                        await api.updateOrderStatus(idRef, 'DELIVERED');
                                                        setOrders(orders.map(o => (o._id || o.id) === idRef ? { ...o, status: 'DELIVERED' } : o));
                                                    } catch (e) { alert('Error: ' + e.message); }
                                                }}
                                            >
                                                Mark as Received
                                            </button>
                                        )}
                                        {order.status === 'DELIVERED' && (
                                            <button
                                                className="retail-btn-ghost danger"
                                                onClick={() => {
                                                    if (window.confirm("Initialize return protocol for this order?")) {
                                                        const idRef = order._id || order.id;
                                                        api.updateOrderStatus(idRef, 'RETURN_REQUESTED').then(() => {
                                                            setOrders(orders.map(o => (o._id || o.id) === idRef ? { ...o, status: 'RETURN_REQUESTED' } : o));
                                                        }).catch(e => alert(e.message));
                                                    }
                                                }}
                                            >
                                                Request Return
                                            </button>
                                        )}
                                        <button className="retail-btn-ghost">View Invoice</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="retail-page-root">
            <div className="retail-layout">
                {/* Retail Sidebar */}
                <aside className="retail-sidebar">
                    <div className="retail-user-header">
                        <div className="retail-user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                        <div>
                            <div className="retail-user-name">{user.username}</div>
                            <div className="retail-user-role">{user.role?.toUpperCase()}</div>
                        </div>
                    </div>

                    <nav className="retail-nav">
                        <button className={`retail-nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
                            <User size={18} /> Account Details <ChevronRight size={16} className="rt-arrow" />
                        </button>
                        <button className={`retail-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                            <Compass size={18} /> Order History <ChevronRight size={16} className="rt-arrow" />
                        </button>
                        <button className="retail-nav-item">
                            <CreditCard size={18} /> Payment Methods <ChevronRight size={16} className="rt-arrow" />
                        </button>
                        {(user.role === 'VENDOR' || user.role === 'vendor') && (
                            <button className={`retail-nav-item ${activeTab === 'shop' ? 'active' : ''} store-tab`} onClick={() => setActiveTab('shop')}>
                                <Store size={18} /> Merchant Settings <ChevronRight size={16} className="rt-arrow" />
                            </button>
                        )}
                    </nav>
                </aside>

                {/* Retail Content Area */}
                <main className="retail-main">
                    {activeTab === 'account' && renderAccountTab()}
                    {activeTab === 'shop' && renderShopTab()}
                    {activeTab === 'orders' && renderOrdersTab()}
                </main>
            </div>

            <ProductModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                product={productToReview}
            />
        </div>
    );
};

export default ProfilePage;
