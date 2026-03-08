import { useNavigate, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ChevronRight, ArrowLeft, MapPin, Star, ShoppingBag, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await api.getUserOrders();
                setOrders(data);
                if (data.length > 0) {
                    setSelectedOrderId(data[0]._id);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusStep = (status) => {
        const s = status?.toUpperCase();
        if (s === 'PLACED') return 0;
        if (s === 'PROCESSING') return 1;
        if (s === 'SHIPPED') return 2;
        if (s === 'OUT_FOR_DELIVERY') return 3;
        if (s === 'DELIVERED') return 4;
        return 0;
    };

    const steps = [
        { id: 0, label: 'Order Placed', icon: <Clock size={20} /> },
        { id: 1, label: 'Processing', icon: <Package size={20} /> },
        { id: 2, label: 'Shipped', icon: <Truck size={20} /> },
        { id: 3, label: 'Out for Delivery', icon: <Truck size={20} /> },
        { id: 4, label: 'Delivered', icon: <CheckCircle size={20} /> }
    ];

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading your orders...</div>;

    if (orders.length === 0) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <Package size={64} color="#CBD5E1" style={{ marginBottom: '24px' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#64748B' }}>No Orders Found</h2>
                    <p style={{ color: '#94A3B8', marginBottom: '32px' }}>You haven't placed any orders yet.</p>
                    <Link to="/" style={{ ...styles.invoiceBtn, width: '200px', margin: '0 auto', backgroundColor: 'var(--brand-primary)', color: 'white', border: 'none' }}>
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const currentOrder = orders.find(o => o._id === selectedOrderId) || orders[0];
    const orderStatus = getStatusStep(currentOrder.status);

    const handleDownloadInvoice = () => {
        const invoiceContent = `
            INVOICE - TRADELINK MARKETPLACE
            Order ID: ${currentOrder._id}
            Date: ${new Date(currentOrder.created_at).toLocaleDateString()}
            Customer: ${currentOrder.buyer_username}
            Total Amount: ₹${currentOrder.total_amount}
            
            Items:
            ${currentOrder.items?.map(i => `- ${i.name} (x${i.quantity}): ₹${i.price}`).join('\n')}
            
            Thank you for shopping with us!
        `;
        const blob = new Blob([invoiceContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice_${currentOrder._id.substring(0, 8)}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fade-in" style={styles.container}>
            <div style={styles.navRow}>
                <Link to="/" style={styles.backLink}>
                    <ArrowLeft size={18} /> Back to Shopping
                </Link>
                <div style={styles.orderIdBadge}>Order #{currentOrder._id?.substring(-6)}</div>
            </div>

            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '40px' }}>
                {orders.map(order => (
                    <button
                        key={order._id}
                        onClick={() => setSelectedOrderId(order._id)}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '16px',
                            border: selectedOrderId === order._id ? '2px solid var(--brand-primary)' : '1px solid #E2E8F0',
                            backgroundColor: selectedOrderId === order._id ? 'white' : '#F8FAFC',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px'
                        }}
                    >
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Order #{order._id?.substring(order._id.length - 6).toUpperCase()}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
                    </button>
                ))}
            </div>

            <h1 style={styles.title}>Track Your <span style={{ color: 'var(--brand-primary)' }}>Order</span></h1>

            {/* Stepper / Order Placed Bar */}
            <div className="glass" style={styles.stepperContainer}>
                <div style={styles.stepper}>
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div style={styles.stepGroup}>
                                <div style={{
                                    ...styles.stepCircle,
                                    backgroundColor: orderStatus >= step.id ? 'var(--brand-primary)' : '#e2e8f0',
                                    color: orderStatus >= step.id ? 'white' : '#94a3b8',
                                    boxShadow: orderStatus === step.id ? '0 0 15px var(--brand-primary)' : 'none'
                                }}>
                                    {orderStatus > step.id ? <CheckCircle size={16} /> : step.icon}
                                </div>
                                <span style={{
                                    ...styles.stepLabel,
                                    color: orderStatus >= step.id ? 'var(--brand-secondary)' : '#94a3b8',
                                    fontWeight: orderStatus === step.id ? 800 : 600
                                }}>{step.label}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div style={{
                                    ...styles.stepLine,
                                    backgroundColor: orderStatus > step.id ? 'var(--brand-primary)' : '#e2e8f0'
                                }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div style={styles.contentGrid}>
                {/* Left: Items List */}
                <div style={styles.mainCol}>
                    <div className="glass" style={styles.card}>
                        <h3 style={styles.cardTitle}>Order Items</h3>
                        <div style={styles.itemsList}>
                            {currentOrder.items?.map((item, idx) => (
                                <div key={idx} style={styles.itemRow}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        <ShoppingBag size={32} color="#CBD5E1" />
                                    </div>
                                    <div style={styles.itemInfo}>
                                        <h4 style={styles.itemName}>{item.name}</h4>
                                        <p style={styles.itemVendor}>Sold by <span style={{ color: 'var(--brand-primary)' }}>{item.vendor || 'Premium Merchant'}</span></p>
                                        <div style={styles.priceRow}>
                                            <span style={styles.itemPrice}>₹{item.price}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B', marginLeft: '12px' }}>Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    {orderStatus === 4 && (
                                        <button style={styles.reviewBtn}>
                                            <Star size={14} /> Rate Product
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass" style={styles.card}>
                        <h3 style={styles.cardTitle}>Shipping Details</h3>
                        <div style={styles.shippingInfo}>
                            <div style={styles.infoBlock}>
                                <div style={styles.infoLabel}>Delivery Address</div>
                                <div style={styles.infoValue}>{currentOrder.shipping_address || 'Default Address'}</div>
                            </div>
                            <div style={styles.infoBlock}>
                                <div style={styles.infoLabel}>Order Date</div>
                                <div style={styles.infoValue}>{new Date(currentOrder.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}
                <div style={styles.sideCol}>
                    <div className="glass" style={styles.summaryCard}>
                        <h3 style={styles.cardTitle}>Payment Summary</h3>
                        <div style={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{currentOrder.total_amount}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span>Shipping</span>
                            <span style={{ color: '#16a34a', fontWeight: 700 }}>FREE</span>
                        </div>
                        <div style={{ ...styles.summaryRow, color: 'var(--brand-secondary)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px', marginTop: '16px' }}>
                            <span style={{ fontWeight: 800 }}>Total Paid</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{currentOrder.total_amount}</span>
                        </div>
                        <div style={{ ...styles.paymentMethod, cursor: 'pointer' }} onClick={() => alert(`Payment via ${currentOrder.payment_method || 'COD'}. Transaction ID: ${currentOrder.razorpay_payment_id || 'N/A'}`)}>
                            <ShieldCheck size={16} color="#16a34a" />
                            <span>Payment Method: {currentOrder.payment_method || 'COD'}</span>
                        </div>
                        <button style={styles.invoiceBtn} onClick={handleDownloadInvoice}>
                            <ExternalLink size={16} /> Download Invoice
                        </button>
                    </div>

                    {orderStatus === 4 && (
                        <div className="glass fade-in" style={styles.deliveryCompletedCard}>
                            <CheckCircle size={32} color="#16a34a" />
                            <h4 style={{ margin: '12px 0 8px 0' }}>Order Delivered!</h4>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', margin: 0 }}>Please rate your experience with the products to help other buyers.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    backLink: { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' },
    orderIdBadge: { padding: '6px 16px', borderRadius: '99px', backgroundColor: '#f1f5f9', color: 'var(--brand-secondary)', fontWeight: 700, fontSize: '0.85rem' },
    title: { fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-secondary)', marginBottom: '40px', textAlign: 'center' },
    stepperContainer: { padding: '40px 60px', borderRadius: '32px', marginBottom: '48px' },
    stepper: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' },
    stepGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' },
    stepCircle: { width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    stepLabel: { fontSize: '0.85rem', whiteSpace: 'nowrap' },
    stepLine: { flex: 1, height: '4px', margin: '0 -20px', marginTop: '-34px', position: 'relative', zIndex: 1, borderRadius: '2px', transition: 'background-color 0.4s' },
    contentGrid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' },
    mainCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
    card: { padding: '32px', borderRadius: '24px' },
    cardTitle: { fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-secondary)', margin: '0 0 24px 0' },
    itemsList: { display: 'flex', flexDirection: 'column', gap: '24px' },
    itemRow: { display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' },
    itemImg: { width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0' },
    itemVendor: { fontSize: '0.8rem', color: '#64748b', margin: 0 },
    itemPrice: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-primary)' },
    reviewBtn: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'white', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' },
    shippingInfo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    infoBlock: { display: 'flex', flexDirection: 'column', gap: '4px' },
    infoLabel: { fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' },
    infoValue: { fontSize: '0.95rem', color: 'var(--brand-secondary)', fontWeight: 600, lineHeight: 1.5 },
    sideCol: { display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' },
    summaryCard: { padding: '32px', borderRadius: '24px' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', color: '#64748b' },
    paymentMethod: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '12px', marginTop: '24px', fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 },
    invoiceBtn: { width: '100%', marginTop: '24px', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: 'var(--brand-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' },
    deliveryCompletedCard: { padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ecfdf5', border: '1px solid #d1fae5' }
};

export default OrdersPage;
