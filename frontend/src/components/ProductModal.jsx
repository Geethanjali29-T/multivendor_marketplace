import React from 'react';
import { Star, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const ProductModal = ({ isOpen, onClose, partner }) => {
    const { addToCart } = useCart();

    if (!isOpen || !partner) return null;

    // Use dynamic product details if available from the backend, otherwise fallback
    const price = partner.price || Math.floor(Math.random() * 5000) + 500;
    const productName = partner.productName || `${partner.name} Premium Service`;

    const handleAddToCart = () => {
        addToCart({
            id: partner.id,
            name: productName,
            vendor: partner.name,
            price: price,
            bannerImage: partner.bannerImage,
            logoImage: partner.logoImage
        });
        alert(`Added ${partner.name} to Cart!`);
        onClose();
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button style={styles.closeBtn} onClick={onClose}>
                    <X size={24} color="var(--text-muted)" />
                </button>

                <div style={styles.content}>
                    {/* Left Column: Product Info */}
                    <div style={styles.productSection}>
                        <div style={styles.imageContainer}>
                            <span style={styles.categoryTag}>{partner.tags && partner.tags[0]}</span>
                            <img src={partner.bannerImage} alt={partner.name} style={styles.productImage} />
                        </div>

                        <div style={styles.productDetails}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <h2 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--brand-secondary)' }}>{productName}</h2>
                                <h2 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--brand-secondary)' }}>₹{price}</h2>
                            </div>

                            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--brand-primary)', letterSpacing: '0.05em', marginBottom: '16px', textTransform: 'uppercase' }}>
                                SOLD BY {partner.name}
                            </p>

                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                                {partner.description}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', alignSelf: 'stretch' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', color: 'var(--brand-accent)' }}>
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{partner.rating} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({partner.reviews} reviews)</span></span>
                                </div>
                                <button onClick={handleAddToCart} style={styles.addToCartBtn}>
                                    <ShoppingCart size={18} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Reviews */}
                    <div style={styles.reviewSection}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Customer Reviews</h3>
                            <span style={{ backgroundColor: '#f1f5f9', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>2</span>
                        </div>

                        <div style={styles.reviewsList}>
                            {/* Review 1 */}
                            <div style={styles.reviewCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ ...styles.avatar, backgroundColor: 'var(--brand-primary)' }}>S</div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Suraj</p>
                                            <div style={{ display: 'flex', color: 'var(--brand-accent)', marginTop: '2px' }}>
                                                <Star size={10} fill="currentColor" />
                                                <Star size={10} fill="currentColor" />
                                                <Star size={10} fill="currentColor" />
                                                <Star size={10} fill="currentColor" />
                                                <Star size={10} fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2/14/2026</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>good books</p>
                            </div>

                            {/* Review 2 */}
                            <div style={styles.reviewCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ ...styles.avatar, backgroundColor: '#8b5cf6' }}>A</div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Amit Kumar</p>
                                            <div style={{ display: 'flex', color: 'var(--brand-accent)', marginTop: '2px' }}>
                                                <Star size={10} fill="currentColor" />
                                                <Star size={10} fill="currentColor" />
                                                <Star size={10} fill="currentColor" />
                                                <Star size={10} fill="currentColor" />
                                                <Star size={10} fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2/13/2026</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>Nice</p>
                            </div>
                        </div>

                        {/* Add Review Form */}
                        <div style={styles.addReviewForm}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Write a Review</h4>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Posting as Suraj</span>
                            </div>
                            <div style={{ display: 'flex', color: 'var(--brand-accent)', gap: '4px', marginBottom: '16px' }}>
                                <Star size={20} fill="currentColor" />
                                <Star size={20} fill="currentColor" />
                                <Star size={20} fill="currentColor" />
                                <Star size={20} fill="currentColor" />
                                <Star size={20} fill="currentColor" />
                            </div>
                            <textarea
                                placeholder="Share your experience with this product... (min 10 chars)"
                                style={styles.textarea}
                            />
                            <button style={styles.submitReviewBtn} onClick={() => alert("Review submitted successfully!")}>Submit Review</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '40px',
    },
    modal: {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '32px',
        width: '1000px',
        maxWidth: '100%',
        height: '600px',
        position: 'relative',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
    },
    closeBtn: {
        position: 'absolute',
        top: '24px',
        right: '24px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        zIndex: 10,
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s',
    },
    content: {
        display: 'flex',
        height: '100%',
    },
    productSection: {
        flex: 1,
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
    },
    imageContainer: {
        width: '100%',
        height: '280px',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '32px',
    },
    categoryTag: {
        position: 'absolute',
        top: '16px',
        left: '16px',
        backgroundColor: 'rgba(255,255,255,0.9)',
        color: 'var(--brand-primary)',
        padding: '6px 14px',
        borderRadius: '99px',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        zIndex: 2,
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    productDetails: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    reviewSection: {
        width: '400px',
        padding: '40px 40px 40px 0',
        display: 'flex',
        flexDirection: 'column',
    },
    reviewsList: {
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px',
        paddingRight: '12px',
    },
    reviewCard: {
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.85rem',
        fontWeight: 600,
    },
    addReviewForm: {
        borderTop: '1px solid #e2e8f0',
        paddingTop: '24px',
    },
    textarea: {
        width: '100%',
        height: '80px',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        outline: 'none',
        fontSize: '0.85rem',
        fontFamily: 'inherit',
        marginBottom: '16px',
        resize: 'none',
        backgroundColor: '#fff',
    },
    submitReviewBtn: {
        width: '100%',
        backgroundColor: 'var(--brand-primary)', // Using Emerald
        color: 'white',
        border: 'none',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '0.9rem',
        cursor: 'pointer',
        boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)', // Emerald shadow
        transition: 'transform 0.2s, background-color 0.2s',
    },
    addToCartBtn: {
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
        transition: 'transform 0.2s'
    }
};

export default ProductModal;
