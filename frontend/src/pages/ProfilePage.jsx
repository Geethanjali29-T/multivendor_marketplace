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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ProfilePage = () => {
    const { user, setUser, updateUser } = useAuth();
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

    // Payment Methods State
    const [paymentMethods, setPaymentMethods] = useState(user?.payment_methods || []);
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
    const [newCard, setNewCard] = useState({ holder: '', number: '', expiry: '', type: 'Visa' });

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

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
            await updateUser({ username: profileData.username, phone: profileData.phone, address: profileData.address });
            setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
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

    const handleAddPaymentMethod = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const updatedMethods = [...paymentMethods, { ...newCard, id: Date.now() }];
            await updateUser({ payment_methods: updatedMethods });
            setPaymentMethods(updatedMethods);
            setIsAddPaymentModalOpen(false);
            setNewCard({ holder: '', number: '', expiry: '', type: 'Visa' });
            setProfileMsg({ type: 'success', text: 'Payment method added successfully.' });
        } catch (err) {
            setProfileMsg({ type: 'error', text: 'Failed to add payment method.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const removePaymentMethod = async (id) => {
        setProfileLoading(true);
        try {
            const updatedMethods = paymentMethods.filter(m => m.id !== id);
            await updateUser({ payment_methods: updatedMethods });
            setPaymentMethods(updatedMethods);
        } catch (err) {
            alert("Failed to remove payment method");
        } finally {
            setProfileLoading(false);
        }
    };

    const handleDownloadInvoice = (order) => {
        try {
            const doc = new jsPDF();

            // Add Header
            doc.setFontSize(22);
            doc.setTextColor(40, 70, 229); // Brand color
            doc.text('TRADELINK MARKETPLACE', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('PREMIUM E-COMMERCE ECOSYSTEM', 105, 26, { align: 'center' });

            // Horizontal Line
            doc.setDrawColor(230);
            doc.line(20, 32, 190, 32);

            // Invoice Details
            doc.setFontSize(12);
            doc.setTextColor(33);
            doc.text(`INVOICE: #INV-${String(order._id || order.id).slice(-6).toUpperCase()}`, 20, 45);
            doc.text(`DATE: ${new Date(order.created_at || Date.now()).toLocaleDateString()}`, 190, 45, { align: 'right' });

            doc.setFontSize(10);
            doc.text('BILL TO:', 20, 60);
            doc.setFontSize(12);
            doc.text((user?.username || user?.email || 'User').toUpperCase(), 20, 66);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(user.email, 20, 71);

            // Table of items
            const tableColumn = ["Item Description", "Price", "Qty", "Total"];
            const tableRows = (order.items || []).map(item => [
                item.name,
                `INR ${Number(item.price || 0).toLocaleString()}`,
                item.quantity,
                `INR ${(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: 85,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [40, 70, 229], textColor: [255, 255, 255] },
                alternateRowStyles: { fillColor: [249, 250, 251] }
            });

            // Final Total
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(14);
            doc.setTextColor(33);
            doc.text(`TOTAL AMOUNT: INR ${Number(order.total_amount || 0).toLocaleString()}`, 190, finalY, { align: 'right' });

            // Footer message
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('Thank you for choosing TradeLink. This is a computer generated invoice.', 105, finalY + 30, { align: 'center' });

            doc.save(`Invoice_${String(order._id || order.id).slice(-8)}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error (ProfilePage):", error);
            alert("Failed to generate invoice. Please check the console for details.");
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

    const renderShopTab = () => {
        // STRICT ROLE CHECK: Only VENDOR can see this
        const isVendor = user.role?.toUpperCase() === 'VENDOR';
        if (!isVendor) {
            return (
                <div className="retail-tab-content fade-in">
                    <h2 className="retail-section-title">Access Restricted</h2>
                    <p className="retail-section-desc">Merchant Settings are reserved for verified business partners.</p>
                    <div className="retail-empty-state">
                        <Shield size={48} className="retail-empty-icon" />
                        <h3>Vendor Status Required</h3>
                        <p>If you'd like to sell on TradeLink, please register as a merchant.</p>
                        <button onClick={() => setActiveTab('account')} className="retail-btn-primary">Back to Profile</button>
                    </div>
                </div>
            );
        }

        return (
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

                {hasShop && (
                    <div className="merchant-quick-links" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee', display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => window.location.href = '/vendor/dashboard'}
                            className="retail-btn-secondary"
                            style={{ flex: 1 }}
                        >
                            <Compass size={18} /> Merchant Dashboard
                        </button>
                        <button
                            onClick={() => window.open(`/shop/${user.username}`, '_blank')}
                            className="retail-btn-ghost"
                            style={{ flex: 1, border: '1px solid #ddd' }}
                        >
                            <Store size={18} /> View Public Store
                        </button>
                    </div>
                )}
            </div>
        );
    };

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
                                        <button className="retail-btn-ghost" onClick={() => setActiveTab('payments')}>Payment Details</button>
                                        <button className="retail-btn-ghost" onClick={() => handleDownloadInvoice(order)}>View Invoice</button>
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
                        <div className="retail-user-avatar">{(user?.username || user?.email || 'U').charAt(0).toUpperCase()}</div>
                        <div>
                            <div className="retail-user-name">{user?.username || user?.email || 'User'}</div>
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
                        <button className={`retail-nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
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
                    {activeTab === 'payments' && (
                        <div className="retail-tab-content fade-in">
                            <h2 className="retail-section-title">Saved Payment Methods</h2>
                            <p className="retail-section-desc">Securely manage your saved cards and wallet balances.</p>

                            {paymentMethods.length > 0 ? (
                                <div className="retail-payment-list" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {paymentMethods.map(method => (
                                        <div key={method.id} className="retail-payment-card" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc' }}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{ background: '#2874f0', color: '#fff', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 800 }}>{method.type.toUpperCase()}</div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '15px' }}>**** **** **** {method.number.slice(-4)}</div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>Expires {method.expiry} • {method.holder}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => removePaymentMethod(method.id)} className="retail-btn-ghost danger" style={{ padding: '8px', fontSize: '13px' }}>Remove</button>
                                        </div>
                                    ))}
                                    <button onClick={() => setIsAddPaymentModalOpen(true)} className="retail-btn-secondary" style={{ marginTop: '16px' }}>Add Another Method</button>
                                </div>
                            ) : (
                                <div className="retail-empty-state" style={{ marginTop: '40px' }}>
                                    <CreditCard size={48} className="retail-empty-icon" />
                                    <h3>No saved methods</h3>
                                    <p>You haven't saved any payment methods yet. Your details are securely encrypted.</p>
                                    <button onClick={() => setIsAddPaymentModalOpen(true)} className="retail-btn-secondary" style={{ marginTop: '16px' }}>Add New Method</button>
                                </div>
                            )}

                            {isAddPaymentModalOpen && (
                                <div className="retail-modal-overlay fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                                    <div className="retail-modal-card" style={{ background: '#fff', padding: '32px', borderRadius: '16px', maxWidth: '450px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Add New Card</h3>
                                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>This is a simulation. Do not enter real credit card numbers.</p>

                                        <form onSubmit={handleAddPaymentMethod}>
                                            <div className="retail-form-group" style={{ marginBottom: '16px' }}>
                                                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Cardholder Name</label>
                                                <input type="text" required value={newCard.holder} onChange={e => setNewCard({ ...newCard, holder: e.target.value })} className="retail-input" placeholder="e.g. John Doe" />
                                            </div>
                                            <div className="retail-form-group" style={{ marginBottom: '16px' }}>
                                                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Card Number</label>
                                                <input type="text" required maxLength="16" value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value.replace(/\D/g, '') })} className="retail-input" placeholder="0000 0000 0000 0000" />
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                                <div className="retail-form-group" style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Expiry (MM/YY)</label>
                                                    <input type="text" required maxLength="5" value={newCard.expiry} onChange={e => setNewCard({ ...newCard, expiry: e.target.value })} className="retail-input" placeholder="MM/YY" />
                                                </div>
                                                <div className="retail-form-group" style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Network</label>
                                                    <select value={newCard.type} onChange={e => setNewCard({ ...newCard, type: e.target.value })} className="retail-input">
                                                        <option value="Visa">Visa</option>
                                                        <option value="Mastercard">Mastercard</option>
                                                        <option value="Rupay">Rupay</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button type="button" onClick={() => setIsAddPaymentModalOpen(false)} className="retail-btn-ghost" style={{ flex: 1, border: '1px solid #ddd' }}>Cancel</button>
                                                <button type="submit" className="retail-btn-primary" style={{ flex: 1 }}>Save Card</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
