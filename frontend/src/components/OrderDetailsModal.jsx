import React from 'react';
import { X, User, MapPin, Phone, CreditCard, ShoppingBag, Calendar, CheckCircle } from 'lucide-react';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    return (
        <div style={styles.overlay}>
            <div className="glass fade-in" style={styles.modal}>
                <div style={styles.header}>
                    <div style={styles.headerTitleGroup}>
                        <h2 style={styles.title}>Order Details</h2>
                        <span style={styles.orderId}>#TRL-{order.id.toString().slice(-6)}</span>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
                </div>

                <div style={styles.body}>
                    <div style={styles.grid}>
                        {/* Section 1: Customer info */}
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}><User size={16} /> Customer Information</h3>
                            <div className="glass" style={styles.infoCard}>
                                <p style={styles.infoRow}><strong>Name:</strong> {order.buyer_username}</p>
                                <p style={styles.infoRow}><strong>Email:</strong> {order.buyer_email || 'Not shared'}</p>
                                <p style={styles.infoRow}><Phone size={14} /> <strong>Phone:</strong> {order.buyer_phone || '+91 98XXX XXXXX'}</p>
                                <p style={styles.infoRow}><MapPin size={14} /> <strong>Address:</strong> {order.shipping_address || '123 Tech Park, Bangalore'}</p>
                            </div>
                        </div>

                        {/* Section 2: Order Summary */}
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}><Calendar size={16} /> Order Summary</h3>
                            <div className="glass" style={styles.infoCard}>
                                <p style={styles.infoRow}><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                                <p style={styles.infoRow}>
                                    <strong>Status:</strong>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: order.status === 'Processing' ? '#fde68a' : '#dcfce7',
                                        color: order.status === 'Processing' ? '#92400e' : '#166534'
                                    }}>
                                        {order.status}
                                    </span>
                                </p>
                                <p style={styles.infoRow}><CreditCard size={14} /> <strong>Payment:</strong> Prepaid (Razorpay)</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Items */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}><ShoppingBag size={16} /> Order Items</h3>
                        <div style={styles.itemsList}>
                            {order.items && order.items.map((item, idx) => (
                                <div key={idx} style={styles.itemRow}>
                                    <div style={styles.itemThumb}>
                                        <ShoppingBag size={20} color="var(--brand-primary)" />
                                    </div>
                                    <div style={styles.itemDetails}>
                                        <p style={styles.itemName}>{item.product_name}</p>
                                        <p style={styles.itemSub}>Qty: {item.quantity} × ₹{item.price}</p>
                                    </div>
                                    <div style={styles.itemTotal}>
                                        ₹{item.quantity * item.price}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Stats */}
                    <div style={styles.totalRow}>
                        <div style={styles.totalLabel}>Total Revenue</div>
                        <div style={styles.totalValue}>₹{order.total_amount}</div>
                    </div>
                </div>

                <div style={styles.footer}>
                    {order.status === 'Processing' && (
                        <button style={styles.primaryBtn}>
                            <CheckCircle size={18} /> Mark as Shipped
                        </button>
                    )}
                    <button onClick={onClose} style={styles.secondaryBtn}>Close</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    modal: {
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
    },
    header: {
        padding: '24px 32px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTitleGroup: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '12px'
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: 'var(--brand-secondary)',
        margin: 0
    },
    orderId: {
        fontSize: '0.9rem',
        color: 'var(--brand-primary)',
        fontWeight: 700,
        opacity: 0.8
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#64748b'
    },
    body: {
        padding: '32px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
    },
    sectionTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--brand-secondary)',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    infoCard: {
        padding: '16px',
        borderRadius: '16px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0'
    },
    infoRow: {
        margin: '0 0 8px 0',
        fontSize: '0.9rem',
        lineHeight: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    statusBadge: {
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 800,
        marginLeft: '8px'
    },
    itemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    itemRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
    },
    itemThumb: {
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    itemDetails: {
        flex: 1
    },
    itemName: {
        fontWeight: 700,
        fontSize: '0.9rem',
        margin: 0
    },
    itemSub: {
        fontSize: '0.75rem',
        color: '#64748b',
        margin: 0
    },
    itemTotal: {
        fontWeight: 800,
        color: 'var(--brand-secondary)'
    },
    totalRow: {
        marginTop: '12px',
        padding: '20px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid var(--brand-primary)',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
    },
    totalLabel: {
        fontWeight: 700,
        color: 'var(--brand-secondary)'
    },
    totalValue: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: 'var(--brand-primary)'
    },
    footer: {
        padding: '24px 32px',
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '16px',
        borderTop: '1px solid #e2e8f0'
    },
    primaryBtn: {
        padding: '12px 24px',
        borderRadius: '12px',
        border: 'none',
        background: 'var(--brand-primary)',
        color: 'white',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
    },
    secondaryBtn: {
        padding: '12px 24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        background: 'white',
        fontWeight: 600,
        cursor: 'pointer'
    }
};

export default OrderDetailsModal;
