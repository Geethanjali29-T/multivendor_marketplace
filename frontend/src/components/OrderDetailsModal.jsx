import React from 'react';
import { X, User, MapPin, Phone, CreditCard, ShoppingBag, Calendar, CheckCircle, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderDetailsModal = ({ isOpen, onClose, order, onStatusUpdate }) => {
    if (!isOpen || !order) return null;

    const handleDownloadInvoice = () => {
        try {
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
            const orderIdDisplay = String(order._id || order.id || 'N/A').slice(-6).toUpperCase();
            doc.text(`INVOICE: #INV-${orderIdDisplay}`, 20, 45);
            doc.text(`DATE: ${new Date(order.created_at || Date.now()).toLocaleDateString()}`, 190, 45, { align: 'right' });

            doc.setFontSize(10);
            doc.text('BILL TO:', 20, 60);
            doc.setFontSize(12);
            doc.text((order.buyer_username || 'GUEST').toUpperCase(), 20, 66);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(order.buyer_email || '', 20, 71);

            const tableColumn = ["Item Description", "Price", "Qty", "Total"];
            const tableRows = (order.items || []).map(item => [
                item.product_name || item.name,
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

            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(14);
            doc.setTextColor(33);
            doc.text(`TOTAL AMOUNT: INR ${Number(order.total_amount || 0).toLocaleString()}`, 190, finalY, { align: 'right' });

            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('Thank you for choosing TradeLink.', 105, finalY + 30, { align: 'center' });

            doc.save(`Invoice_${orderIdDisplay}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to generate invoice. Please check the console for details.");
        }
    };

    return (
        <div style={styles.overlay}>
            <div className="glass fade-in" style={styles.modal}>
                <div style={styles.header}>
                    <div style={styles.headerTitleGroup}>
                        <h2 style={styles.title}>Order Details</h2>
                        <span style={styles.orderId}>#TRL-{String(order.id || order._id || '').slice(-6).toUpperCase()}</span>
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
                    <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Update Status:</span>
                        <select
                            value={order.status}
                            onChange={(e) => onStatusUpdate(order._id || order.id, e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Canceled">Canceled</option>
                        </select>
                    </div>
                    <button
                        onClick={handleDownloadInvoice}
                        style={{ ...styles.secondaryBtn, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)' }}
                    >
                        <Download size={18} /> Download Invoice
                    </button>
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
