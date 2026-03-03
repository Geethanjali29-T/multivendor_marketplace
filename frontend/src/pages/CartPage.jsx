import React, { useState } from 'react';
import { Minus, Plus, MessageSquare, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleCheckout = () => {
        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
        } else {
            alert("Checkout flow initiated!");
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="fade-in" style={styles.emptyContainer}>
                <div style={styles.emptyIconWrapper}>
                    <ShoppingBag size={64} color="var(--brand-secondary)" />
                </div>
                <h2 style={styles.emptyTitle}>Your basket is empty</h2>
                <p style={styles.emptySub}>
                    Looks like you haven't added any items to your cart yet. Discover local services, healthcare, and educational programs.
                </p>
                <Link to="/" style={styles.browseBtn}>
                    Start Exploring <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={styles.header}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--brand-secondary)' }}>
                    Your TradeLink <span style={{ color: 'var(--brand-primary)' }}>Basket</span>
                </h1>
            </div>

            <div style={styles.container}>
                {/* Cart Items Area */}
                <div style={styles.itemsList}>
                    {cartItems.map((item) => (
                        <div key={item.id} style={{ ...styles.itemCard, marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '32px' }}>
                                <img src={item.logoImage || item.bannerImage || "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"} alt={item.name} style={styles.itemImage} />

                                <div style={styles.itemDetails}>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: '0 0 8px 0' }}>{item.name}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: 500, margin: 0 }}>
                                            By {item.vendor || 'TradeLink Partner'}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: 'auto' }}>
                                        <div style={styles.quantityControl}>
                                            <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                                            <span style={styles.qtyText}>{item.quantity}</span>
                                            <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div style={styles.priceContainer}>
                                    <h3 style={{ fontSize: '1.5rem', color: 'var(--brand-secondary)', margin: '0 0 8px 0' }}>₹{(item.price || 3499) * item.quantity}</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Free Delivery Included</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary Form */}
                <div style={styles.summaryCard}>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--brand-secondary)', margin: '0 0 32px 0' }}>Order Summary</h3>

                    <div style={styles.summaryRow}>
                        <span style={styles.summaryLabel}>Subtotal</span>
                        <span style={styles.summaryValue}>₹{getCartTotal()}</span>
                    </div>

                    <div style={styles.summaryRow}>
                        <span style={styles.summaryLabel}>Shipping</span>
                        <span style={{ ...styles.summaryValue, color: '#16a34a', fontWeight: 700 }}>FREE</span>
                    </div>

                    <div style={{ ...styles.summaryRow, marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                        <span style={{ ...styles.summaryLabel, fontWeight: 600, color: 'var(--text-main)' }}>Estimated Total</span>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-primary)' }}>₹{getCartTotal()}</span>
                    </div>

                    <button style={styles.checkoutBtn} onClick={handleCheckout}>
                        Complete Purchase
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: '24px' }}>
                        SECURE ENCRYPTED PAYMENT 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    header: {
        marginBottom: '40px',
    },
    container: {
        display: 'flex',
        gap: '32px',
        alignItems: 'flex-start',
    },
    itemsList: {
        flex: 1,
    },
    itemCard: {
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        boxShadow: 'var(--shadow-sm)',
    },
    itemImage: {
        width: '120px',
        height: '120px',
        borderRadius: '16px',
        objectFit: 'cover',
    },
    itemDetails: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    quantityControl: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: '#f8fafc',
        padding: '8px 16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
    },
    qtyBtn: {
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        fontWeight: 600,
        fontSize: '0.95rem',
        minWidth: '20px',
        textAlign: 'center',
    },
    priceContainer: {
        textAlign: 'right',
    },
    summaryCard: {
        width: '380px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: '100px',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    summaryLabel: {
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
    },
    summaryValue: {
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--brand-secondary)',
    },
    checkoutBtn: {
        width: '100%',
        backgroundColor: 'var(--brand-primary)', // Emerald 
        color: 'white',
        border: 'none',
        padding: '20px',
        borderRadius: '16px',
        fontSize: '1rem',
        fontWeight: 600,
        marginTop: '32px',
        cursor: 'pointer',
        boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)', // Emerald shadow
        transition: 'transform 0.2s, background-color 0.2s',
    },
    emptyContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center'
    },
    emptyIconWrapper: {
        backgroundColor: '#f1f5f9',
        padding: '32px',
        borderRadius: '50%',
        marginBottom: '24px'
    },
    emptyTitle: {
        fontSize: '2rem',
        color: 'var(--brand-secondary)',
        marginBottom: '16px',
        margin: 0
    },
    emptySub: {
        color: 'var(--text-muted)',
        marginBottom: '32px',
        maxWidth: '400px',
        lineHeight: 1.6
    },
    browseBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        padding: '16px 32px',
        borderRadius: '99px',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '1rem',
        boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
        transition: 'transform 0.2s',
    }
};

export default CartPage;
