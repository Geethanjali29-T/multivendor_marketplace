import React, { useState } from 'react';
import { Minus, Plus, MessageSquare, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleCheckout = () => {
        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
        } else {
            navigate('/checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div style={styles.emptyWrapper}>
                <div style={styles.emptyCard}>
                    <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a1-520d560971e2.png?q=90" alt="empty" style={{ width: '200px' }} />
                    <h2 style={{ fontSize: '18px', margin: '20px 0 10px 0' }}>Your cart is empty!</h2>
                    <p style={{ fontSize: '12px', color: '#878787', marginBottom: '20px' }}>Add items to it now.</p>
                    <button onClick={() => navigate('/')} style={styles.shopNowBtn}>Shop Now</button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageBackground}>
            <div style={styles.container}>
                {/* Left Side: Items */}
                <div style={styles.leftCol}>
                    <div style={styles.cardHeader}>
                        My Cart ({cartItems.length})
                    </div>
                    {status.message && (
                        <div style={{
                            padding: '16px 24px',
                            margin: '16px 24px',
                            borderRadius: '8px',
                            backgroundColor: status.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                            color: status.type === 'success' ? '#065F46' : '#991B1B',
                            fontSize: '14px',
                            fontWeight: 600,
                            textAlign: 'center',
                            border: `1px solid ${status.type === 'success' ? '#A7F3D0' : '#FECACA'}`
                        }}>
                            {status.message}
                        </div>
                    )}
                    {cartItems.map((item) => (
                        <div key={item.id} style={styles.itemRow}>
                            <div style={styles.itemImgWrapper}>
                                <img src={item.image || item.bannerImage || "https://via.placeholder.com/150"} alt={item.name} style={styles.itemImg} />
                                <div style={styles.qtyContainer}>
                                    <button style={styles.qtyCircle} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                    <div style={styles.qtyInput}>{item.quantity}</div>
                                    <button style={styles.qtyCircle} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                </div>
                            </div>
                            <div style={styles.itemInfo}>
                                <h3 style={styles.itemName}>{item.name}</h3>
                                <p style={styles.vendorName}>Seller: {item.vendor}</p>
                                <div style={styles.priceRow}>
                                    <span style={styles.actualPrice}>₹{(item.price || 999) * item.quantity}</span>
                                    <span style={styles.oldPrice}>₹{Math.floor((item.price || 999) * 1.4) * item.quantity}</span>
                                    <span style={styles.discountText}>30% Off</span>
                                </div>
                                <div style={styles.itemActions}>
                                    <button style={styles.actionLink}>SAVE FOR LATER</button>
                                    <button style={styles.actionLink} onClick={() => removeFromCart(item.id)}>REMOVE</button>
                                </div>
                            </div>
                            <div style={styles.deliveryInfo}>
                                Delivery by Tomorrow, Sat | <span style={{ color: '#388e3c' }}>Free</span>
                            </div>
                        </div>
                    ))}
                    <div style={styles.placeOrderRow}>
                        <button style={styles.placeOrderBtn} onClick={handleCheckout} disabled={isProcessing}>
                            {isProcessing ? 'PROCESSING...' : 'PLACE ORDER'}
                        </button>
                    </div>
                </div>

                {/* Right Side: Price Details */}
                <div style={styles.rightCol}>
                    <div style={styles.priceCard}>
                        <div style={styles.priceHeading}>PRICE DETAILS</div>
                        <div style={styles.priceBody}>
                            <div style={styles.priceStat}>
                                <span>Price ({cartItems.length} items)</span>
                                <span>₹{getCartTotal() * 1.4}</span>
                            </div>
                            <div style={styles.priceStat}>
                                <span>Discount</span>
                                <span style={{ color: '#388e3c' }}>- ₹{Math.floor(getCartTotal() * 0.4)}</span>
                            </div>
                            <div style={styles.priceStat}>
                                <span>Delivery Charges</span>
                                <span style={{ color: '#388e3c' }}>FREE</span>
                            </div>
                            <div style={styles.totalRow}>
                                <span>Total Amount</span>
                                <span>₹{getCartTotal()}</span>
                            </div>
                            <div style={styles.savingsMsg}>
                                You will save ₹{Math.floor(getCartTotal() * 0.4)} on this order
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageBackground: {
        backgroundColor: '#f1f3f6',
        minHeight: 'calc(100vh - 120px)',
        padding: '24px 0',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '16px',
        padding: '0 16px',
    },
    leftCol: {
        flex: 1,
        backgroundColor: '#fff',
        boxShadow: '0 1px 1px 0 rgba(0,0,0,.2)',
    },
    cardHeader: {
        padding: '16px 24px',
        fontSize: '18px',
        fontWeight: 600,
        borderBottom: '1px solid #f0f0f0',
    },
    itemRow: {
        padding: '24px',
        display: 'flex',
        gap: '24px',
        borderBottom: '1px solid #f0f0f0',
    },
    itemImgWrapper: {
        width: '112px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
    },
    itemImg: {
        width: '112px',
        height: '112px',
        objectFit: 'contain',
    },
    qtyContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    qtyCircle: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: '1px solid #e0e0e0',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    qtyInput: {
        width: '46px',
        height: '28px',
        border: '1px solid #e0e0e0',
        textAlign: 'center',
        fontSize: '14px',
        lineHeight: '28px',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: '16px',
        fontWeight: 400,
        color: '#212121',
        marginBottom: '8px',
    },
    vendorName: {
        fontSize: '14px',
        color: '#878787',
        marginBottom: '12px',
    },
    priceRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
    },
    actualPrice: {
        fontSize: '18px',
        fontWeight: 600,
    },
    oldPrice: {
        fontSize: '14px',
        color: '#878787',
        textDecoration: 'line-through',
    },
    discountText: {
        fontSize: '14px',
        color: '#388e3c',
        fontWeight: 600,
    },
    itemActions: {
        display: 'flex',
        gap: '24px',
    },
    actionLink: {
        background: 'none',
        border: 'none',
        fontSize: '16px',
        fontWeight: 600,
        color: '#212121',
        cursor: 'pointer',
        padding: 0,
    },
    deliveryInfo: {
        fontSize: '14px',
        color: '#212121',
        textAlign: 'right',
        width: '200px',
    },
    placeOrderRow: {
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        boxShadow: '0 -2px 10px 0 rgba(0,0,0,.1)',
        backgroundColor: '#fff',
        position: 'sticky',
        bottom: 0,
    },
    placeOrderBtn: {
        backgroundColor: '#fb641b',
        color: '#fff',
        border: 'none',
        padding: '16px 60px',
        fontSize: '16px',
        fontWeight: 600,
        borderRadius: '2px',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,.2)',
        cursor: 'pointer',
    },
    rightCol: {
        width: '380px',
    },
    priceCard: {
        backgroundColor: '#fff',
        boxShadow: '0 1px 1px 0 rgba(0,0,0,.2)',
        position: 'sticky',
        top: '16px',
    },
    priceHeading: {
        padding: '13px 24px',
        fontSize: '16px',
        color: '#878787',
        fontWeight: 600,
        borderBottom: '1px solid #f0f0f0',
    },
    priceBody: {
        padding: '24px',
    },
    priceStat: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        fontSize: '16px',
    },
    totalRow: {
        padding: '24px 0',
        borderTop: '1px dashed #e0e0e0',
        borderBottom: '1px dashed #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '18px',
        fontWeight: 700,
        margin: '20px 0',
    },
    savingsMsg: {
        color: '#388e3c',
        fontWeight: 600,
        fontSize: '16px',
    },
    emptyWrapper: {
        padding: '40px 0',
        backgroundColor: '#f1f3f6',
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        justifyContent: 'center',
    },
    emptyCard: {
        backgroundColor: '#fff',
        width: '1200px',
        padding: '50px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 1px 1px 0 rgba(0,0,0,.2)',
    },
    shopNowBtn: {
        backgroundColor: '#2874f0',
        color: '#fff',
        border: 'none',
        padding: '12px 70px',
        fontSize: '14px',
        borderRadius: '2px',
        cursor: 'pointer',
    }
};

export default CartPage;
