import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShoppingBag, MapPin, CreditCard, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const CheckoutPage = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
    const [address, setAddress] = useState(user?.address || '');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    if (cartItems.length === 0 && step !== 4) {
        return <Navigate to="/cart" />;
    }

    const handleRazorpayPayment = () => {
        return new Promise((resolve, reject) => {
            const options = {
                key: 'rzp_test_YOUR_KEY_HERE', // In a real app, this comes from ENV
                amount: getCartTotal() * 100, // amount in paise
                currency: 'INR',
                name: 'TradeLink Marketplace',
                description: 'Test Transaction',
                handler: function (response) {
                    resolve(response.razorpay_payment_id);
                },
                prefill: {
                    name: user?.username || '',
                    email: user?.email || '',
                },
                theme: {
                    color: '#2874f0',
                },
                modal: {
                    ondismiss: function () {
                        reject(new Error('Payment cancelled by user'));
                    }
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        });
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        setError('');
        try {
            let paymentId = 'COD';

            if (paymentMethod !== 'COD') {
                try {
                    paymentId = await handleRazorpayPayment();
                } catch (payErr) {
                    setError(payErr.message);
                    setIsProcessing(false);
                    return;
                }
            }

            const orderData = {
                items: cartItems.map(item => ({
                    product_id: item.id || item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    vendor: item.vendor
                })),
                total_amount: getCartTotal(),
                shipping_address: address,
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
                razorpay_payment_id: paymentId
            };

            const result = await api.placeOrder(orderData);
            setStep(4); // Success Step
            clearCart();
        } catch (err) {
            // Try to parse the backend detail message
            let msg = err.message || 'Failed to place order. Please try again.';
            if (msg === 'Failed to place order') {
                msg = 'Order failed. Please ensure you are logged in and try again.';
            }
            setError(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const cartTotal = getCartTotal();

    return (
        <div style={styles.pageBg} className="checkout-page-wrapper">
            <div style={styles.container} className="checkout-container">
                {step < 4 && (
                    <div style={styles.header}>
                        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')} style={styles.backBtn}>
                            <ArrowLeft size={20} />
                        </button>
                        <h1 style={styles.title}>Secure Checkout</h1>
                    </div>
                )}

                {step < 4 && (
                    <div style={styles.progressRow} className="checkout-progress-row">
                        <div style={step >= 1 ? styles.stepActive : styles.step}>1. Address</div>
                        <div style={styles.stepDivider} />
                        <div style={step >= 2 ? styles.stepActive : styles.step}>2. Payment</div>
                        <div style={styles.stepDivider} />
                        <div style={step >= 3 ? styles.stepActive : styles.step}>3. Review</div>
                    </div>
                )}

                <div style={styles.contentGrid} className="checkout-content-grid">
                    <div style={styles.mainCol} className="checkout-main-col">
                        {step === 1 && (
                            <div className="fade-in" style={styles.card}>
                                <h2 style={styles.sectionTitle}><MapPin size={20} /> Delivery Address</h2>
                                <textarea
                                    style={styles.textarea}
                                    placeholder="Enter your full delivery address..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                <button
                                    style={styles.primaryBtn}
                                    disabled={!address.trim()}
                                    onClick={() => setStep(2)}
                                >
                                    Deliver Here <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="fade-in" style={styles.card}>
                                <h2 style={styles.sectionTitle}><CreditCard size={20} /> Payment Method</h2>
                                <div style={styles.paymentOptions}>
                                    <div
                                        style={paymentMethod === 'COD' ? styles.paymentOptionActive : styles.paymentOption}
                                        onClick={() => setPaymentMethod('COD')}
                                    >
                                        <div style={styles.radio}>{paymentMethod === 'COD' && <div style={styles.radioInner} />}</div>
                                        <span>Cash on Delivery</span>
                                    </div>
                                    <div
                                        style={paymentMethod === 'UPI' ? styles.paymentOptionActive : styles.paymentOption}
                                        onClick={() => setPaymentMethod('UPI')}
                                    >
                                        <div style={styles.radio}>{paymentMethod === 'UPI' && <div style={styles.radioInner} />}</div>
                                        <span>UPI / PhonePe / GPay</span>
                                    </div>
                                    <div
                                        style={paymentMethod === 'CARD' ? styles.paymentOptionActive : styles.paymentOption}
                                        onClick={() => setPaymentMethod('CARD')}
                                    >
                                        <div style={styles.radio}>{paymentMethod === 'CARD' && <div style={styles.radioInner} />}</div>
                                        <span>Credit / Debit Card</span>
                                    </div>
                                </div>
                                <button style={styles.primaryBtn} onClick={() => setStep(3)}>
                                    Continue <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="fade-in" style={styles.card}>
                                <h2 style={styles.sectionTitle}><ShoppingBag size={20} /> Review Order</h2>
                                <div style={styles.orderSummaryItems}>
                                    {cartItems.map(item => (
                                        <div key={item.id} style={styles.summaryItem}>
                                            <img src={item.image} alt={item.name} style={styles.summaryImg} />
                                            <div style={styles.summaryInfo}>
                                                <div style={styles.summaryName}>{item.name}</div>
                                                <div style={styles.summaryQty}>Qty: {item.quantity} × ₹{item.price}</div>
                                            </div>
                                            <div style={styles.summaryPrice}>₹{item.price * item.quantity}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={styles.detailRow}>
                                    <span>Deliver to:</span>
                                    <strong>{address}</strong>
                                </div>
                                <div style={styles.detailRow}>
                                    <span>Payment Method:</span>
                                    <strong>{paymentMethod}</strong>
                                </div>

                                {error && <div style={styles.errorText}>{error}</div>}

                                <button
                                    style={styles.confirmBtn}
                                    disabled={isProcessing}
                                    onClick={handlePlaceOrder}
                                >
                                    {isProcessing ? 'PLACING ORDER...' : `CONFIRM ORDER - ₹${cartTotal}`}
                                </button>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="fade-in" style={styles.successCard}>
                                <CheckCircle2 size={64} color="#10b981" />
                                <h1 style={styles.successTitle}>Order Placed Successfully!</h1>
                                <p style={styles.successText}>Thank you for your purchase. Your order ID is #TL-{Math.floor(Math.random() * 900000 + 100000)}</p>
                                <div style={styles.successActions}>
                                    <button style={styles.primaryBtn} onClick={() => navigate('/orders')}>View My Orders</button>
                                    <button style={styles.outlineBtn} onClick={() => navigate('/')}>Continue Shopping</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {step < 4 && (
                        <div style={styles.sideCol} className="checkout-side-col">
                            <div style={styles.priceCard}>
                                <h3 style={styles.priceHeading}>PRICE DETAILS</h3>
                                <div style={styles.priceBody}>
                                    <div style={styles.priceStat}>
                                        <span>Price ({cartItems.length} items)</span>
                                        <span>₹{Math.floor(cartTotal * 1.4)}</span>
                                    </div>
                                    <div style={styles.priceStat}>
                                        <span>Discount</span>
                                        <span style={{ color: '#388e3c' }}>- ₹{Math.floor(cartTotal * 0.4)}</span>
                                    </div>
                                    <div style={styles.priceStat}>
                                        <span>Delivery Charges</span>
                                        <span style={{ color: '#388e3c' }}>FREE</span>
                                    </div>
                                    <div style={styles.totalRow}>
                                        <span>Total Payable</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
                                    <p style={styles.savingsMsg}>You will save ₹{Math.floor(cartTotal * 0.4)} on this order</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageBg: { backgroundColor: '#f1f3f6', minHeight: 'calc(100vh - 120px)', padding: '24px 0' },
    container: { maxWidth: '1000px', margin: '0 auto', padding: '0 16px' },
    header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' },
    backBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#666' },
    title: { fontSize: '24px', fontWeight: 800, color: '#212121', fontFamily: 'Outfit, sans-serif' },
    progressRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' },
    step: { fontSize: '14px', fontWeight: 600, color: '#999', flex: 1, textAlign: 'center' },
    stepActive: { fontSize: '14px', fontWeight: 800, color: '#2874f0', flex: 1, textAlign: 'center' },
    stepDivider: { width: '40px', height: '1px', backgroundColor: '#ddd' },
    contentGrid: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    mainCol: { flex: 1 },
    sideCol: { width: '340px' },
    card: { backgroundColor: '#fff', borderRadius: '4px', padding: '24px', boxShadow: '0 1px 1px 0 rgba(0,0,0,.1)', marginBottom: '16px' },
    sectionTitle: { fontSize: '18px', fontWeight: 800, color: '#212121', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' },
    textarea: { width: '100%', height: '100px', padding: '16px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '20px', resize: 'none' },
    primaryBtn: { width: '100%', backgroundColor: '#2874f0', color: '#fff', border: 'none', padding: '14px', fontSize: '15px', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    confirmBtn: { width: '100%', backgroundColor: '#fb641b', color: '#fff', border: 'none', padding: '16px', fontSize: '16px', fontWeight: 800, borderRadius: '4px', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0,0,0,.2)' },
    paymentOptions: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
    paymentOption: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '4px', cursor: 'pointer' },
    paymentOptionActive: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #2874f0', backgroundColor: '#f5faff', borderRadius: '4px', cursor: 'pointer' },
    radio: { width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #2874f0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    radioInner: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2874f0' },
    orderSummaryItems: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
    summaryItem: { display: 'flex', gap: '16px', alignItems: 'center' },
    summaryImg: { width: '60px', height: '60px', objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: '4px' },
    summaryInfo: { flex: 1 },
    summaryName: { fontSize: '14px', fontWeight: 500, color: '#212121' },
    summaryQty: { fontSize: '12px', color: '#878787' },
    summaryPrice: { fontWeight: 700, fontSize: '15px' },
    detailRow: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px', fontSize: '14px' },
    errorText: { color: '#ef4444', fontSize: '13px', marginBottom: '16px', fontWeight: 600 },
    successCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
    successTitle: { fontSize: '28px', fontWeight: 800, color: '#212121' },
    successText: { fontSize: '16px', color: '#666', maxWidth: '400px', lineHeight: '1.6' },
    successActions: { display: 'flex', gap: '16px', width: '100%', maxWidth: '400px', marginTop: '12px' },
    outlineBtn: { flex: 1, backgroundColor: '#fff', color: '#2874f0', border: '1px solid #2874f0', padding: '14px', fontSize: '15px', fontWeight: 700, borderRadius: '4px', cursor: 'pointer' },
    priceCard: { backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 1px 1px 0 rgba(0,0,0,.1)' },
    priceHeading: { padding: '13px 24px', fontSize: '16px', color: '#878787', fontWeight: 600, borderBottom: '1px solid #f0f0f0' },
    priceBody: { padding: '24px' },
    priceStat: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px' },
    totalRow: { borderTop: '1px dashed #e0e0e0', padding: '20px 0', fontSize: '18px', fontWeight: 800, color: '#212121', display: 'flex', justifyContent: 'space-between' },
    savingsMsg: { color: '#388e3c', fontWeight: 600, fontSize: '14px' }
};

export default CheckoutPage;
