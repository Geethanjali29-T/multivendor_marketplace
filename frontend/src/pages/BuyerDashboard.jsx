import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Settings, Package, Heart, LogOut, ChevronRight, MapPin, Clock, CreditCard, Bell, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');

    const [wishlist, setWishlist] = useState(user?.wishlist || []);

    const [addresses, setAddresses] = useState([
        { id: 1, type: 'Home', address: '123 Tech Park, Cyber City, Delhi', isDefault: true },
        { id: 2, type: 'Office', address: '456 Business Square, Noida', isDefault: false }
    ]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await api.getUserOrders();
                setOrders(data);

                // Load from user object if available (synced from DB)
                if (user?.wishlist) setWishlist(user.wishlist);
                if (user?.addresses) setAddresses(user.addresses);
            } catch (e) {
                console.error("Failed to fetch orders", e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const handleDownloadInvoice = (order) => {
        const doc = new jsPDF();

        // Add Header
        doc.setFontSize(22);
        doc.setTextColor(40, 70, 229);
        doc.text('TRADELINK MARKETPLACE', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('PREMIUM E-COMMERCE ECOSYSTEM', 105, 26, { align: 'center' });

        doc.setDrawColor(230);
        doc.line(20, 32, 190, 32);

        doc.setFontSize(12);
        doc.setTextColor(33);
        doc.text(`INVOICE: #INV-${String(order._id || order.id).slice(-6).toUpperCase()}`, 20, 45);
        doc.text(`DATE: ${new Date(order.created_at || Date.now()).toLocaleDateString()}`, 190, 45, { align: 'right' });

        doc.setFontSize(10);
        doc.text('BILL TO:', 20, 60);
        doc.setFontSize(12);
        doc.text((user?.username || 'GUEST').toUpperCase(), 20, 66);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(user?.email || '', 20, 71);

        const tableColumn = ["Item Description", "Price", "Qty", "Total"];
        const tableRows = (order.items || []).map(item => [
            item.name,
            `INR ${item.price.toLocaleString()}`,
            item.quantity,
            `INR ${(item.price * item.quantity).toLocaleString()}`
        ]);

        doc.autoTable({
            startY: 85,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [40, 70, 229], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [249, 250, 251] }
        });

        const finalY = doc.previousAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setTextColor(33);
        doc.text(`TOTAL AMOUNT: INR ${order.total_amount.toLocaleString()}`, 190, finalY, { align: 'right' });

        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Thank you for choosing TradeLink.', 105, finalY + 30, { align: 'center' });

        doc.save(`Invoice_${String(order._id || order.id).slice(-8)}.pdf`);
    };

    const saveProfileUpdates = async (updates) => {
        try {
            await api.updateUserProfile(updates);
        } catch (e) {
            console.error("Failed to sync profile updates", e);
        }
    };

    const addToWishlist = async (product) => {
        const itemToAdd = {
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            image: product.image
        };
        const newWish = [...wishlist, itemToAdd];
        setWishlist(newWish);
        await saveProfileUpdates({ wishlist: newWish });
    };

    const removeFromWishlist = async (productId) => {
        const newWish = wishlist.filter(item => (item.id || item._id) !== productId);
        setWishlist(newWish);
        await saveProfileUpdates({ wishlist: newWish });
    };

    const addAddress = (newAddr) => {
        const updated = [...addresses, { ...newAddr, id: Date.now() }];
        setAddresses(updated);
        saveProfileUpdates({ addresses: updated });
    };

    const deleteAddress = (id) => {
        const updated = addresses.filter(a => a.id !== id);
        setAddresses(updated);
        saveProfileUpdates({ addresses: updated });
    };

    const StatusDot = ({ status }) => {
        let dotClass = 'dot-warning';
        if (status === 'Delivered') dotClass = 'dot-success';
        if (status === 'Canceled') dotClass = 'dot-danger';
        return <div className={`buyer-status-dot ${dotClass}`} />;
    };

    const renderSidebar = () => (
        <div className="buyer-sidebar">
            <div className="buyer-profile-mini">
                <div className="buyer-avatar-mini glass">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="buyer-hello">Welcome back,</div>
                    <div className="buyer-name-mini">{user?.username || 'Guest Customer'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--brand-accent)', fontWeight: 800, marginTop: '4px' }}>GOLD TIER MEMBER</div>
                </div>
            </div>

            <div className="buyer-side-menu">
                <div className="buyer-menu-section">
                    <div className="buyer-menu-header">
                        <ShoppingBag className="buyer-menu-icon" size={20} />
                        PURCHASES
                        <ChevronRight size={14} color="#CBD5E1" />
                    </div>
                    <div className="buyer-menu-items">
                        <button className={`buyer-menu-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>All Orders</button>
                    </div>
                </div>

                <div className="buyer-menu-section">
                    <div className="buyer-menu-header">
                        <User className="buyer-menu-icon" size={20} />
                        PROFILE
                    </div>
                    <div className="buyer-menu-items">
                        <button className={`buyer-menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Personal Details</button>
                        <button className={`buyer-menu-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>Shipping Addresses</button>
                    </div>
                </div>

                <div className="buyer-menu-section">
                    <div className="buyer-menu-header">
                        <Heart className="buyer-menu-icon" size={20} />
                        FAVORITES
                    </div>
                    <div className="buyer-menu-items">
                        <button className={`buyer-menu-item ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')}>Saved Items</button>
                        <button className={`buyer-menu-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>Payment Methods</button>
                        <button className="buyer-menu-item">Followed Shops</button>
                    </div>
                </div>

                <div className="buyer-menu-section" style={{ border: 'none' }}>
                    <button onClick={logout} className="buyer-menu-item" style={{ paddingLeft: '64px', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-light)', marginTop: '8px' }}>
                        <LogOut size={18} /> SIGNOUT
                    </button>
                </div>
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="buyer-card fade-in">
            <h3 className="buyer-card-title">Order History</h3>
            {loading ? (
                <div className="buyer-empty">Loading your order nodes...</div>
            ) : orders.length === 0 ? (
                <div className="buyer-empty">
                    <Package size={64} color="#CBD5E1" strokeWidth={1} />
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600 }}>No active orders found</p>
                    <Link to="/" className="buyer-btn-primary">DISCOVER SHOPS</Link>
                </div>
            ) : (
                <div className="buyer-order-list">
                    {orders.slice(0, 8).map(order => (
                        <div key={order.id} className="buyer-order-item card">
                            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                                <Package size={32} color="var(--brand-primary)" />
                            </div>
                            <div className="buyer-order-details">
                                <div className="buyer-order-name">ORDER ID: {order.id.toString().slice(-8).toUpperCase()}</div>
                                <div className="buyer-order-price">₹{order.total_amount.toLocaleString()}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
                                    <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                    PLACED ON {new Date(order.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="buyer-status-area">
                                <div className="buyer-status-text">
                                    <StatusDot status={order.status} />
                                    Current Status: Refined logistics update pending.
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                    <Link to="/orders" className="buyer-btn-ghost sm" style={{ padding: '6px 12px', fontSize: '11px' }}>TRACK ORDER</Link>
                                    <button onClick={() => handleDownloadInvoice(order)} className="buyer-btn-ghost sm" style={{ padding: '6px 12px', fontSize: '11px' }}>VIEW INVOICE</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderWishlist = () => (
        <div className="buyer-card fade-in">
            <h3 className="buyer-card-title">Curated Favorites ({wishlist.length})</h3>
            <div className="buyer-order-list">
                {wishlist.map(item => (
                    <div key={item._id || item.id} className="buyer-order-item card">
                        <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                            <img src={item.image} alt={item.name} className="buyer-order-img" style={{ borderRadius: '8px' }} />
                        </div>
                        <div className="buyer-order-details">
                            <div className="buyer-order-name" style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}>{item.name}</div>
                            <div className="buyer-order-price" style={{ color: 'var(--brand-primary)', fontSize: '18px' }}>₹{item.price.toLocaleString()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <button className="buyer-btn-primary" style={{ padding: '10px 24px', fontSize: '12px' }}>ADD TO CART</button>
                            <button
                                onClick={() => removeFromWishlist(item._id || item.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Remove from wishlist"
                            >
                                <XCircle size={22} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAddresses = () => (
        <div className="buyer-card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 className="buyer-card-title" style={{ margin: 0 }}>Shipping Destinations</h3>
                <button
                    className="buyer-btn-primary"
                    style={{ padding: '10px 20px', fontSize: '11px' }}
                    onClick={() => addAddress({ type: 'New', address: 'Enter your new address details here', isDefault: false })}
                >
                    + ADD NEW DESTINATION
                </button>
            </div>
            <div className="buyer-order-list">
                {addresses.map(addr => (
                    <div key={addr.id} className="buyer-order-item card" style={{ flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--brand-primary)', padding: '4px 12px', fontSize: '10px', fontWeight: 800, borderRadius: '20px', letterSpacing: '0.5px' }}>{addr.type.toUpperCase()}</span>
                                {addr.isDefault && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-accent)', fontSize: '11px', fontWeight: 800 }}><ShieldCheck size={14} /> DEFAULT SHIPPING</div>}
                            </div>
                            <div style={{ color: 'var(--text-muted)' }}><MapPin size={18} strokeWidth={1.5} /></div>
                        </div>
                        <div style={{ width: '100%' }}>
                            <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>{user?.username}</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.5', maxWidth: '500px' }}>{addr.address}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--border-light)', width: '100%', paddingTop: '16px', marginTop: '8px' }}>
                            <button style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 800, fontSize: '12px', cursor: 'pointer', letterSpacing: '0.5px' }}>EDIT DETAILS</button>
                            <button
                                onClick={() => deleteAddress(addr.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, fontSize: '12px', cursor: 'pointer', letterSpacing: '0.5px' }}
                            >
                                REMOVE
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    const renderPayments = () => (
        <div className="buyer-card fade-in">
            <h3 className="buyer-card-title">Stored Payment Methods</h3>
            <div className="buyer-order-list">
                <div className="buyer-order-item card" style={{ padding: '24px' }}>
                    <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', padding: '16px', borderRadius: '12px' }}>
                        <CreditCard size={32} color="var(--brand-primary)" />
                    </div>
                    <div style={{ flex: 1, marginLeft: '20px' }}>
                        <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>Razorpay (Test Mode Active)</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Fast and secure payments integrated.</div>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', fontSize: '10px', fontWeight: 800, borderRadius: '20px' }}>LINKED</span>
                </div>
            </div>
            <div style={{ marginTop: '32px', padding: '24px', border: '1px dashed var(--border-light)', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>More payment methods coming soon.</p>
            </div>
        </div>
    );

    const XCircle = ({ size }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
    );

    return (
        <div className="buyer-container">
            {renderSidebar()}
            <main className="buyer-main">
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'wishlist' && renderWishlist()}
                {activeTab === 'addresses' && renderAddresses()}
                {activeTab === 'payments' && renderPayments()}
                {activeTab === 'profile' && (
                    <div className="buyer-card fade-in">
                        <h3 className="buyer-card-title">Personal Portfolio</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                            <div className="input-group">
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>ACCOUNT USERNAME</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }} />
                                    <input type="text" value={user?.username} readOnly style={{ width: '100%', padding: '14px 14px 14px 48px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', backgroundColor: '#f8fafc', fontWeight: 600, color: 'var(--text-main)' }} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>VERIFIED EMAIL</label>
                                <div style={{ position: 'relative' }}>
                                    <Bell size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }} />
                                    <input type="text" value={user?.email} readOnly style={{ width: '100%', padding: '14px 14px 14px 48px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', backgroundColor: '#f8fafc', fontWeight: 600, color: 'var(--text-main)' }} />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button className="buyer-btn-primary">UPDATE PROFILE</button>
                            <button className="btn btn-ghost" style={{ padding: '14px 32px' }}>CHANGE PASSWORD</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BuyerDashboard;
