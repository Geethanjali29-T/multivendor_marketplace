import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Star, ShoppingCart, Zap, Heart, ShieldCheck, ArrowLeft,
    CheckCircle, Truck, RotateCcw, Package, ChevronRight
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

const ProductDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    // Product is passed via location.state when navigating
    const product = location.state?.product;

    const [cartMsg, setCartMsg] = useState('');
    const [wishMsg, setWishMsg] = useState('');
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loadingRelated, setLoadingRelated] = useState(true);
    const [selectedImg, setSelectedImg] = useState(0);

    if (!product) {
        navigate('/');
        return null;
    }

    const price = product.price || 999;
    const oldPrice = Math.floor(price * 1.4);
    const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
    const name = product.name || 'Premium Product';
    const image = product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
    const vendorName = product.vendor_name || product.vendor_username || 'Official Store';
    const category = product.category || 'General';
    const description = product.description || `Premium quality ${name}. Built for performance and reliability.`;

    // Mock extra images using the same base image with different params
    const images = [image, image + '&sat=-80', image + '&bri=10'];

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const data = await api.getProducts(category);
                const filtered = data.filter(p => (p._id || p.product_id) !== (product._id || product.product_id)).slice(0, 6);
                setRelatedProducts(filtered);
            } catch (e) {
                // no-op
            } finally {
                setLoadingRelated(false);
            }
        };
        fetchRelated();
        // AI tracking
        if (category) api.trackActivity?.('view', category);
    }, []);

    const handleAddToCart = () => {
        addToCart({
            id: product._id || product.product_id,
            name,
            vendor: vendorName,
            price,
            image
        });
        setCartMsg('Added to cart!');
        setTimeout(() => setCartMsg(''), 3000);
    };

    const handleBuyNow = () => {
        addToCart({
            id: product._id || product.product_id,
            name,
            vendor: vendorName,
            price,
            image
        });
        navigate('/checkout');
    };

    const handleWishlist = async () => {
        if (!user) {
            setWishMsg('Please log in to save items.');
            setTimeout(() => setWishMsg(''), 3000);
            return;
        }
        try {
            const currentWishlist = user.wishlist || [];
            const exists = currentWishlist.find(i => (i.id || i._id) === (product._id || product.product_id));
            const newWishlist = exists
                ? currentWishlist.filter(i => (i.id || i._id) !== (product._id || product.product_id))
                : [...currentWishlist, { id: product._id || product.product_id, name, price, image }];
            await api.updateUserProfile({ wishlist: newWishlist });
            setWishMsg(exists ? 'Removed from wishlist.' : 'Saved to wishlist!');
            setTimeout(() => setWishMsg(''), 3000);
        } catch {
            setWishMsg('Failed to update wishlist.');
            setTimeout(() => setWishMsg(''), 3000);
        }
    };

    const reviews = [
        { id: 1, user: 'Rahul S.', rating: 5, date: '2 days ago', comment: 'Excellent quality. Delivery was super fast!', verified: true },
        { id: 2, user: 'Sneha P.', rating: 4, date: '1 week ago', comment: 'Good product, exactly as described in the images.', verified: true },
        { id: 3, user: 'Vijay K.', rating: 5, date: '2 weeks ago', comment: 'Highly recommend. Great value for money.', verified: false }
    ];

    return (
        <div style={s.pageBg}>
            <div style={s.container}>
                {/* Breadcrumb */}
                <div style={s.breadcrumb}>
                    <button onClick={() => navigate(-1)} style={s.backBtn}><ArrowLeft size={16} /> Back</button>
                    <span style={s.crumbDivider}>/</span>
                    <span style={s.crumbLink} onClick={() => navigate('/')}>Home</span>
                    <span style={s.crumbDivider}>/</span>
                    <span style={s.crumbLink} onClick={() => navigate(`/?search=${category}`)}>{category}</span>
                    <span style={s.crumbDivider}>/</span>
                    <span style={s.crumbCurrent}>{name}</span>
                </div>

                {/* Main Product Layout */}
                <div style={s.mainGrid}>
                    {/* Left: Image Gallery */}
                    <div style={s.imageCol}>
                        <div style={s.mainImgBox}>
                            <img src={images[selectedImg]} alt={name} style={s.mainImg} />
                            <div style={s.discountBadge}>{discount}% OFF</div>
                        </div>
                        <div style={s.thumbnails}>
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    style={selectedImg === i ? s.thumbActive : s.thumb}
                                    onClick={() => setSelectedImg(i)}
                                >
                                    <img src={img} alt={`view-${i}`} style={s.thumbImg} />
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div style={s.actionRow}>
                            <button style={s.cartBtn} onClick={handleAddToCart}>
                                <ShoppingCart size={20} /> ADD TO CART
                            </button>
                            <button style={s.buyBtn} onClick={handleBuyNow}>
                                <Zap size={20} /> BUY NOW
                            </button>
                        </div>
                        <button style={s.wishBtn} onClick={handleWishlist}>
                            <Heart size={16} color="#e11d48" />
                            Save to Wishlist
                        </button>

                        {/* Inline Feedback Messages */}
                        {cartMsg && (
                            <div style={s.successMsg}>
                                <CheckCircle size={16} /> {cartMsg}
                            </div>
                        )}
                        {wishMsg && (
                            <div style={s.infoMsg}>{wishMsg}</div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div style={s.detailCol}>
                        <div style={s.categoryTag}>{category}</div>
                        <h1 style={s.productTitle}>{name}</h1>

                        <div style={s.ratingRow}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} size={16} fill={i <= 4 ? '#f59e0b' : 'none'} color="#f59e0b" />
                            ))}
                            <span style={s.ratingText}>4.2 · <span style={s.reviewCount}>428 ratings</span></span>
                        </div>

                        <div style={s.divider} />

                        <div style={s.priceSection}>
                            <span style={s.currPrice}>₹{price.toLocaleString()}</span>
                            <span style={s.oldPrice}>₹{oldPrice.toLocaleString()}</span>
                            <span style={s.discountLabel}>{discount}% off</span>
                        </div>
                        <p style={s.bankOffer}>🏦 Bank offer: Extra 5% off on Axis Bank cards</p>

                        <div style={s.divider} />

                        <div style={s.sellerRow}>
                            <span style={s.sellerLabel}>Seller:</span>
                            <span
                                style={s.sellerLink}
                                onClick={() => navigate(`/shop/${product.vendor_username}`)}
                            >
                                {vendorName}
                            </span>
                        </div>

                        <div style={s.divider} />

                        <h3 style={s.sectionHeading}>Description</h3>
                        <p style={s.description}>{description}</p>

                        <div style={s.divider} />

                        <h3 style={s.sectionHeading}>Trust & Delivery</h3>
                        <div style={s.guarantees}>
                            <div style={s.guaranteeItem}>
                                <Truck size={20} color="#2874f0" />
                                <div>
                                    <div style={s.guaranteeTitle}>Free Delivery</div>
                                    <div style={s.guaranteeSub}>Arrives in 2–4 business days</div>
                                </div>
                            </div>
                            <div style={s.guaranteeItem}>
                                <RotateCcw size={20} color="#2874f0" />
                                <div>
                                    <div style={s.guaranteeTitle}>7-Day Easy Returns</div>
                                    <div style={s.guaranteeSub}>No questions asked</div>
                                </div>
                            </div>
                            <div style={s.guaranteeItem}>
                                <ShieldCheck size={20} color="#2874f0" />
                                <div>
                                    <div style={s.guaranteeTitle}>Secure Payment</div>
                                    <div style={s.guaranteeSub}>100% authentic products</div>
                                </div>
                            </div>
                            <div style={s.guaranteeItem}>
                                <Package size={20} color="#2874f0" />
                                <div>
                                    <div style={s.guaranteeTitle}>In Stock: {product.stock || '50+'}</div>
                                    <div style={s.guaranteeSub}>Ready to ship</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div style={s.reviewsSection}>
                    <h2 style={s.sectionTitle}>Ratings & Reviews</h2>
                    <div style={s.reviewGrid}>
                        {reviews.map(rev => (
                            <div key={rev.id} style={s.reviewCard}>
                                <div style={s.revTop}>
                                    <div style={s.revRatingBadge}>{rev.rating} ★</div>
                                    <span style={s.revUser}>{rev.user}</span>
                                    {rev.verified && <span style={s.verifiedBadge}>✓ Verified</span>}
                                    <span style={s.revDate}>{rev.date}</span>
                                </div>
                                <p style={s.revComment}>{rev.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Related Products */}
                {!loadingRelated && relatedProducts.length > 0 && (
                    <div style={s.relatedSection}>
                        <h2 style={s.sectionTitle}>You May Also Like</h2>
                        <div style={s.relatedGrid}>
                            {relatedProducts.map(p => (
                                <div
                                    key={p._id || p.product_id}
                                    style={s.relatedCard}
                                    onClick={() => {
                                        navigate('/product', { state: { product: p } });
                                        window.scrollTo(0, 0);
                                    }}
                                >
                                    <img src={p.image} alt={p.name} style={s.relatedImg} />
                                    <div style={s.relatedInfo}>
                                        <div style={s.relatedName}>{p.name}</div>
                                        <div style={s.relatedPrice}>₹{p.price?.toLocaleString()}</div>
                                    </div>
                                    <ChevronRight size={16} color="#999" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const s = {
    pageBg: { backgroundColor: '#f1f3f6', minHeight: '100vh', paddingTop: '16px', paddingBottom: '60px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 16px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#878787', marginBottom: '16px', flexWrap: 'wrap' },
    backBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#2874f0', fontWeight: 600, padding: 0 },
    crumbDivider: { color: '#ccc' },
    crumbLink: { cursor: 'pointer', color: '#2874f0' },
    crumbCurrent: { color: '#444', fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

    mainGrid: { display: 'grid', gridTemplateColumns: '420px 1fr', gap: '20px', backgroundColor: '#fff', borderRadius: '4px', padding: '32px', boxShadow: '0 1px 2px rgba(0,0,0,.1)', marginBottom: '20px' },

    imageCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
    mainImgBox: { position: 'relative', border: '1px solid #f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', overflow: 'hidden', backgroundColor: '#fafafa' },
    mainImg: { maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' },
    discountBadge: { position: 'absolute', top: '12px', left: '12px', backgroundColor: '#388e3c', color: '#fff', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '2px' },

    thumbnails: { display: 'flex', gap: '8px' },
    thumb: { width: '60px', height: '60px', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    thumbActive: { width: '60px', height: '60px', border: '2px solid #2874f0', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },

    actionRow: { display: 'flex', gap: '8px', marginTop: '8px' },
    cartBtn: { flex: 1, backgroundColor: '#ff9f00', color: '#fff', border: 'none', padding: '14px', fontSize: '14px', fontWeight: 800, borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,.2)' },
    buyBtn: { flex: 1, backgroundColor: '#fb641b', color: '#fff', border: 'none', padding: '14px', fontSize: '14px', fontWeight: 800, borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,.2)' },
    wishBtn: { backgroundColor: '#fff', border: '1px solid #e0e0e0', padding: '12px', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#212121' },
    successMsg: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ecfdf5', color: '#065f46', padding: '12px', borderRadius: '4px', fontSize: '14px', fontWeight: 600 },
    infoMsg: { backgroundColor: '#eff6ff', color: '#1e40af', padding: '12px', borderRadius: '4px', fontSize: '14px', fontWeight: 600 },

    detailCol: { display: 'flex', flexDirection: 'column', gap: '0' },
    categoryTag: { display: 'inline-block', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '99px', marginBottom: '12px', width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.5px' },
    productTitle: { fontSize: '22px', fontWeight: 500, color: '#212121', margin: '0 0 12px 0', lineHeight: 1.4 },
    ratingRow: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' },
    ratingText: { fontSize: '14px', color: '#212121', marginLeft: '6px', fontWeight: 500 },
    reviewCount: { color: '#878787', fontWeight: 400 },
    divider: { height: '1px', backgroundColor: '#f0f0f0', margin: '16px 0' },
    priceSection: { display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' },
    currPrice: { fontSize: '30px', fontWeight: 700, color: '#212121' },
    oldPrice: { fontSize: '16px', color: '#878787', textDecoration: 'line-through' },
    discountLabel: { fontSize: '16px', color: '#388e3c', fontWeight: 600 },
    bankOffer: { fontSize: '13px', color: '#388e3c', marginBottom: '4px' },
    sellerRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#878787' },
    sellerLabel: { fontWeight: 500 },
    sellerLink: { color: '#2874f0', fontWeight: 600, cursor: 'pointer' },
    sectionHeading: { fontSize: '15px', fontWeight: 700, color: '#212121', margin: '0 0 12px 0' },
    description: { fontSize: '14px', color: '#444', lineHeight: 1.7 },

    guarantees: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    guaranteeItem: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
    guaranteeTitle: { fontSize: '14px', fontWeight: 700, color: '#212121' },
    guaranteeSub: { fontSize: '12px', color: '#878787' },

    reviewsSection: { backgroundColor: '#fff', borderRadius: '4px', padding: '28px 32px', boxShadow: '0 1px 2px rgba(0,0,0,.1)', marginBottom: '20px' },
    sectionTitle: { fontSize: '22px', fontWeight: 600, color: '#212121', marginBottom: '20px' },
    reviewGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
    reviewCard: { borderBottom: '1px solid #f0f0f0', paddingBottom: '20px' },
    revTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' },
    revRatingBadge: { backgroundColor: '#388e3c', color: '#fff', fontSize: '12px', fontWeight: 800, padding: '2px 8px', borderRadius: '3px' },
    revUser: { fontSize: '14px', fontWeight: 700, color: '#212121' },
    verifiedBadge: { fontSize: '11px', color: '#388e3c', fontWeight: 600 },
    revDate: { fontSize: '12px', color: '#878787', marginLeft: 'auto' },
    revComment: { fontSize: '14px', color: '#212121', lineHeight: 1.5, margin: 0 },

    relatedSection: { backgroundColor: '#fff', borderRadius: '4px', padding: '28px 32px', boxShadow: '0 1px 2px rgba(0,0,0,.1)' },
    relatedGrid: { display: 'flex', flexDirection: 'column', gap: '0' },
    relatedCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
    relatedImg: { width: '64px', height: '64px', objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: '4px' },
    relatedInfo: { flex: 1 },
    relatedName: { fontSize: '14px', fontWeight: 500, color: '#212121', marginBottom: '4px' },
    relatedPrice: { fontSize: '14px', fontWeight: 700, color: '#212121' }
};

export default ProductDetailsPage;
