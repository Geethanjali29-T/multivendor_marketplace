import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, X, ShoppingCart, ShieldCheck, Zap, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const ProductModal = ({ isOpen, onClose, product, partner }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const item = product || partner;

    const [settings] = useState(() => {
        const saved = localStorage.getItem('marketplace_settings');
        return saved ? JSON.parse(saved) : { enableReviews: true, returnPolicy: '7 Days Replacement Policy' };
    });

    const [cartMsg, setCartMsg] = useState('');
    const [wishMsg, setWishMsg] = useState('');
    const [reviews, setReviews] = useState([]);
    useEffect(() => {
        if (item) {
            const mock = [
                { id: 1, user: 'Rahul S.', rating: 5, date: '2 days ago', comment: 'Quality is top notch. Delivery was also very fast.' },
                { id: 2, user: 'Sneha P.', rating: 4, date: '5 days ago', comment: 'Good product, exactly as shown in images.' }
            ];
            setReviews(mock);
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const price = item.price || 999;
    const oldPrice = Math.floor(price * 1.4);
    const discount = "30% OFF";
    const productName = item.name || item.productName || 'Premium Product';
    const image = item.image || item.bannerImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
    const vendorName = item.vendor_name || item.name || 'Official Store';

    const handleAddToCart = (shouldNavigate = false) => {
        addToCart({
            id: item.id || item._id,
            name: productName,
            vendor: vendorName,
            price: price,
            image: image
        });
        if (shouldNavigate) {
            navigate('/checkout');
        } else {
            setCartMsg(`Added to cart!`);
            setTimeout(() => setCartMsg(''), 3000);
        }
    };

    const handleWishlist = async () => {
        if (!user) {
            setWishMsg('Please log in to save items.');
            setTimeout(() => setWishMsg(''), 3000);
            return;
        }
        try {
            const currentWish = user.wishlist || [];
            const isMatch = currentWish.find(i => (i.id || i._id) === (item.id || item._id));
            let newWish;
            if (isMatch) {
                newWish = currentWish.filter(i => (i.id || i._id) !== (item.id || item._id));
            } else {
                newWish = [...currentWish, {
                    id: item.id || item._id,
                    name: productName,
                    price: price,
                    image: image
                }];
            }
            await api.updateUserProfile({ wishlist: newWish });
            setWishMsg(isMatch ? 'Removed from wishlist.' : 'Saved to wishlist!');
            setTimeout(() => setWishMsg(''), 3000);
        } catch (e) {
            setWishMsg('Failed to update wishlist.');
            setTimeout(() => setWishMsg(''), 3000);
        }
    };

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                <button style={styles.closeBtn} onClick={onClose}><X size={20} /></button>

                <div style={styles.container}>
                    {/* Left Side: Images & Actions */}
                    <div style={styles.leftCol}>
                        <div style={styles.imageBox}>
                            <img src={image} alt={productName} style={styles.mainImg} />
                        </div>
                        <div style={styles.actionRow}>
                            <button style={styles.cartBtn} onClick={handleAddToCart}>
                                <ShoppingCart size={18} /> ADD TO CART
                            </button>
                            <button style={styles.buyBtn} onClick={() => handleAddToCart(true)}>
                                <Zap size={18} /> BUY NOW
                            </button>
                        </div>
                        <button style={styles.wishBtn} onClick={handleWishlist}>
                            <Heart size={18} fill={(user?.wishlist?.find(i => (i.id || i._id) === (item.id || item._id))) ? "#ff4343" : "none"} color="#ff4343" />
                            SAVE FOR LATER
                        </button>
                        {cartMsg && (
                            <div style={{ marginTop: '8px', padding: '10px 14px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '4px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>✓ {cartMsg}</div>
                        )}
                        {wishMsg && (
                            <div style={{ marginTop: '8px', padding: '10px 14px', backgroundColor: '#eff6ff', color: '#1e40af', borderRadius: '4px', fontSize: '13px', fontWeight: 600 }}>{wishMsg}</div>
                        )}
                    </div>

                    {/* Right Side: Details & Reviews */}
                    <div style={styles.rightCol}>
                        <div style={styles.breadcrumb}>Home &gt; {item.category || 'Product'} &gt; {productName}</div>

                        <h1 style={styles.title}>{productName}</h1>

                        <div style={styles.ratingRow}>
                            <div style={styles.ratingBox}>{item.rating || 4.2} ★</div>
                            <span style={styles.ratingCount}>{item.reviews || 428} Ratings & 56 Reviews</span>
                        </div>

                        <div style={styles.priceSection}>
                            <span style={styles.currPrice}>₹{price}</span>
                            <span style={styles.oldPrice}>₹{oldPrice}</span>
                            <span style={styles.discountText}>{discount}</span>
                        </div>

                        <div style={styles.vendorBox}>
                            Seller: <span style={styles.vendorLink}>{vendorName}</span>
                        </div>

                        <div style={styles.policyRow}>
                            <div style={styles.policyItem}><ShieldCheck size={16} /> {settings.returnPolicy}</div>
                            <div style={styles.policyItem}><Zap size={16} /> Cash on Delivery available</div>
                        </div>

                        <div style={styles.divider} />

                        {/* Reviews Section */}
                        {settings.enableReviews && (
                            <div style={styles.reviewSection}>
                                <h3 style={styles.sectionTitle}>Ratings & Reviews</h3>
                                <div style={styles.reviewsList}>
                                    {reviews.map(rev => (
                                        <div key={rev.id} style={styles.reviewItem}>
                                            <div style={styles.revHeader}>
                                                <div style={styles.revRating}>{rev.rating} ★</div>
                                                <span style={styles.revUser}>{rev.user}</span>
                                            </div>
                                            <p style={styles.revComment}>{rev.comment}</p>
                                            <span style={styles.revDate}>{rev.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
    },
    modal: {
        backgroundColor: '#fff',
        width: '1000px',
        maxWidth: '100%',
        height: '90vh',
        borderRadius: '2px',
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
    },
    closeBtn: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
    },
    container: {
        display: 'flex',
        width: '100%',
        height: '100%',
    },
    leftCol: {
        flex: '0 0 400px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #f0f0f0',
    },
    imageBox: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #f0f0f0',
        padding: '16px',
        marginBottom: '16px',
    },
    mainImg: {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
    },
    actionRow: {
        display: 'flex',
        gap: '8px',
    },
    cartBtn: {
        flex: 1,
        backgroundColor: '#ff9f00',
        color: '#fff',
        border: 'none',
        padding: '16px',
        fontSize: '16px',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '2px',
    },
    buyBtn: {
        flex: 1,
        backgroundColor: '#fb641b',
        color: '#fff',
        border: 'none',
        padding: '16px',
        fontSize: '16px',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '2px',
    },
    wishBtn: {
        marginTop: '12px',
        width: '100%',
        backgroundColor: '#fff',
        color: '#212121',
        border: '1px solid #e0e0e0',
        padding: '12px',
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '2px',
    },
    rightCol: {
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
    },
    breadcrumb: {
        fontSize: '12px',
        color: '#878787',
        marginBottom: '12px',
    },
    title: {
        fontSize: '18px',
        fontWeight: 500,
        margin: '0 0 12px 0',
        color: '#212121',
    },
    ratingRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
    },
    ratingBox: {
        backgroundColor: '#388e3c',
        color: '#fff',
        padding: '2px 8px',
        borderRadius: '3px',
        fontSize: '14px',
        fontWeight: 700,
    },
    ratingCount: {
        fontSize: '14px',
        color: '#878787',
        fontWeight: 500,
    },
    priceSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
    },
    currPrice: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#212121',
    },
    oldPrice: {
        fontSize: '16px',
        color: '#878787',
        textDecoration: 'line-through',
    },
    discountText: {
        fontSize: '16px',
        color: '#388e3c',
        fontWeight: 600,
    },
    vendorBox: {
        fontSize: '14px',
        color: '#878787',
        marginBottom: '24px',
    },
    vendorLink: {
        color: '#2874f0',
        fontWeight: 600,
        marginLeft: '8px',
    },
    policyRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '24px',
    },
    policyItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        color: '#212121',
    },
    divider: {
        height: '1px',
        backgroundColor: '#f0f0f0',
        margin: '24px 0',
    },
    reviewSection: {
        marginTop: '24px',
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: 600,
        margin: '0 0 20px 0',
    },
    reviewsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    reviewItem: {
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: '16px',
    },
    revHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px',
    },
    revRating: {
        backgroundColor: '#388e3c',
        color: '#fff',
        fontSize: '12px',
        padding: '1px 6px',
        borderRadius: '2px',
        fontWeight: 700,
    },
    revUser: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#212121',
    },
    revComment: {
        fontSize: '14px',
        color: '#212121',
        margin: '0 0 4px 0',
        lineHeight: '1.4',
    },
    revDate: {
        fontSize: '12px',
        color: '#878787',
    }
};

export default ProductModal;
