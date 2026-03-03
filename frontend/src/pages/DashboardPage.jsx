import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, IndianRupee, Clock, ChevronRight } from 'lucide-react';
import RecommendationsCarousel from '../components/RecommendationsCarousel';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                let fetchedOrders = [];
                if (user.role === 'VENDOR') {
                    fetchedOrders = await api.getVendorOrders();
                } else {
                    fetchedOrders = await api.getUserOrders();
                }
                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const handleAction = () => {
        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
        } else {
            alert("Action initiated!");
        }
    };

    // Calculate Metrics
    const totalOrders = orders.length;
    let itemsQuantity = 0;
    let totalSpentEarned = 0;

    orders.forEach(order => {
        totalSpentEarned += parseFloat(order.total_amount);
        if (order.items) {
            order.items.forEach(item => {
                itemsQuantity += item.quantity;
            });
        }
    });

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard...</div>;
    }

    return (
        <div className="fade-in">
            <div style={styles.header}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--brand-secondary)' }}>
                    Hello, <span style={{ color: 'var(--brand-primary)' }}>{user ? (user.username || 'User') : 'Guest'}</span>
                </h1>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    {user ? `VERIFIED TRADELINK ${user.role}` : 'VIEWING PREVIEW DASHBOARD'}
                </p>
            </div>

            <div style={styles.metricsGrid}>
                {/* Orders Card */}
                <div
                    style={{ ...styles.metricCard, backgroundColor: activeTab === 'orders' ? '#d1fae5' : '#f8fafc', border: activeTab === 'orders' ? '2px solid var(--brand-primary)' : '2px solid transparent', cursor: 'pointer' }}
                    onClick={() => setActiveTab('orders')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ ...styles.metricTitle, color: 'var(--brand-secondary)' }}>TOTAL ORDERS</p>
                        <ChevronRight size={16} color="var(--brand-primary)" />
                    </div>
                    <h2 style={{ ...styles.metricValue, color: 'var(--brand-secondary)' }}>{totalOrders}</h2>
                </div>

                {/* Items Card */}
                <div
                    style={{ ...styles.metricCard, backgroundColor: activeTab === 'items' ? '#d1fae5' : '#f8fafc', border: activeTab === 'items' ? '2px solid var(--brand-primary)' : '2px solid transparent', cursor: 'pointer' }}
                    onClick={() => setActiveTab('items')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ ...styles.metricTitle, color: 'var(--brand-secondary)' }}>{user?.role === 'VENDOR' ? 'ITEMS SOLD' : 'ITEMS PURCHASED'}</p>
                        <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                    <h2 style={{ ...styles.metricValue, color: 'var(--brand-secondary)' }}>{itemsQuantity}</h2>
                </div>

                {/* Spent Card */}
                <div
                    style={{ ...styles.metricCard, backgroundColor: activeTab === 'spent' ? '#d1fae5' : '#f8fafc', border: activeTab === 'spent' ? '2px solid var(--brand-primary)' : '2px solid transparent', cursor: 'pointer' }}
                    onClick={() => setActiveTab('spent')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ ...styles.metricTitle, color: 'var(--brand-secondary)' }}>{user?.role === 'VENDOR' ? 'TOTAL EARNINGS' : 'TOTAL SPENT'}</p>
                        <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                    <h2 style={{ ...styles.metricValue, color: 'var(--brand-secondary)' }}>₹{totalSpentEarned.toLocaleString('en-IN')}</h2>
                </div>
            </div>

            {/* Vendor Onboarding Actions */}
            {user?.role === 'VENDOR' && (
                <div style={styles.vendorSetupCard}>
                    <div style={styles.vendorSetupContent}>
                        <div>
                            <span style={styles.badgeSetup}>ACTION REQUIRED</span>
                            <h3 style={styles.vendorSetupTitle}>Build Your Storefront</h3>
                            <p style={styles.vendorSetupDesc}>
                                To start receiving orders on TradeLink, you must first create your public Shop Profile and add your initial product inventory.
                            </p>
                        </div>
                        <div style={styles.vendorSetupActions}>
                            <button onClick={() => navigate('/setup-shop')} style={styles.setupBtnSecondary}>1. Create Shop Profile</button>
                            <button onClick={() => navigate('/setup-shop')} style={styles.setupBtnPrimary}>2. Add First Item</button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Recommendations */}
            {user?.role !== 'VENDOR' && <RecommendationsCarousel />}

            {/* Purchase History */}
            <div style={{ marginTop: '48px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--brand-secondary)' }}>
                    {user?.role === 'VENDOR' ? 'Recent Shop Orders' : 'Your Purchase History'}
                </h3>

                {orders.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-xl)' }}>
                        <p style={{ color: 'var(--text-muted)' }}>No orders found.</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} style={{ ...styles.orderCard, marginBottom: '24px' }}>
                            <div style={styles.orderHeader}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>ORDER LOG ID</p>
                                    <p style={{ color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.9rem', margin: '4px 0' }}>TRL-{order.id.toString().padStart(8, '0')}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleString()}</p>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '4px' }}>TOTAL VOLUME</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</h3>
                                        <span style={styles.statusDelivered}>{order.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.orderItems}>
                                {order.items && order.items.map(item => (
                                    <div key={item.id} style={{ ...styles.orderItem, marginBottom: '16px' }}>
                                        <img
                                            src={item.product_image ? `http://localhost:8000${item.product_image}` : "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"}
                                            alt={item.product_name}
                                            style={styles.itemImage}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--brand-secondary)' }}>{item.product_name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                QTY: {item.quantity} × ₹{parseFloat(item.price).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        {user?.role === 'BUYER' && order.status === 'DELIVERED' && (
                                            <button style={styles.actionBtn} onClick={handleAction}>MARK RECEIVED</button>
                                        )}
                                        {user?.role === 'VENDOR' && order.status === 'ORDERED' && (
                                            <button style={styles.actionBtn} onClick={handleAction}>MARK SHIPPED</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

const styles = {
    header: {
        marginBottom: '40px',
    },
    vendorSetupCard: {
        backgroundColor: '#fef3c7',
        border: '1px solid #fde68a',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        marginTop: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    },
    badgeSetup: {
        display: 'inline-block',
        backgroundColor: '#d97706',
        color: 'white',
        fontSize: '0.65rem',
        fontWeight: 800,
        padding: '6px 12px',
        borderRadius: '99px',
        letterSpacing: '0.05em',
        marginBottom: '12px',
    },
    vendorSetupContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
    },
    vendorSetupTitle: {
        margin: '0 0 8px 0',
        fontSize: '1.5rem',
        color: '#92400e',
    },
    vendorSetupDesc: {
        margin: 0,
        color: '#b45309',
        fontSize: '0.95rem',
        maxWidth: '500px',
    },
    vendorSetupActions: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
    },
    setupBtnPrimary: {
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.4)',
    },
    setupBtnSecondary: {
        backgroundColor: 'white',
        color: '#92400e',
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: 600,
        border: '1px solid #fcd34d',
        cursor: 'pointer',
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
    },
    metricCard: {
        padding: '32px 24px',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'transform 0.2s',
        cursor: 'default',
    },
    metricTitle: {
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        marginBottom: '8px',
    },
    metricValue: {
        fontSize: '2.5rem',
        margin: 0,
        lineHeight: 1,
    },
    orderCard: {
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        boxShadow: 'var(--shadow-sm)',
    },
    orderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '24px',
        borderBottom: '1px solid #f1f5f9',
    },
    statusDelivered: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        padding: '6px 16px',
        borderRadius: '99px',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
    },
    orderItems: {
        paddingTop: '24px',
    },
    orderItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    itemImage: {
        width: '80px',
        height: '80px',
        borderRadius: '16px',
        objectFit: 'cover',
    },
    actionBtn: {
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '0.85rem',
        boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.4)', // Indigo shadow
        cursor: 'pointer',
        transition: 'transform 0.2s, background-color 0.2s'
    }
};

export default DashboardPage;
