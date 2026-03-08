import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Star, MapPin, Phone, Globe, ArrowLeft, ShoppingBag, ShieldCheck,
    CheckCircle, MessageCircle, Clock, Users, Filter, ArrowDownUp, Package, UserPlus
} from 'lucide-react';
import { api } from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

const ShopPage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtering & Sorting State
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');

    // Tabs
    const [activeTab, setActiveTab] = useState('products');

    const [mockData, setMockData] = useState({
        followers: Math.floor(randomSeed(username || 'shop') * 5000) + 100,
        ordersDelivered: Math.floor(randomSeed(username || 'shop') * 20000) + 500,
        yearsOnPlatform: Math.floor(randomSeed(username || 'shop') * 5) + 1,
        isFollowing: false,
        totalReviews: Math.floor(randomSeed(username || 'shop') * 500) + 50,
        ratingDist: { 5: 180, 4: 40, 3: 20, 2: 5, 1: 5 },
        reviews: [
            { id: 1, name: 'Rahul S.', rating: 5, comment: 'Great product and fast delivery!', date: '2 days ago' },
            { id: 2, name: 'Priya K.', rating: 4, comment: 'Good quality, but shipping took a while.', date: '1 week ago' },
            { id: 3, name: 'Amit G.', rating: 5, comment: 'Exactly as described. Highly recommended vendor!', date: '2 weeks ago' }
        ]
    });

    // Simple deterministic random for mock data consistency
    function randomSeed(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return Math.abs((Math.sin(hash) + 1) / 2);
    }

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const [vendorsData, productsData] = await Promise.all([
                    api.getVendors(),
                    api.getProducts()
                ]);

                const foundShop = vendorsData.find(v => v.username === username);
                const shopProducts = productsData.filter(p => p.vendor_username === username);

                if (foundShop) {
                    setShop(foundShop);
                    setProducts(shopProducts);
                }
            } catch (error) {
                console.error("Error fetching shop data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShopData();
    }, [username]);

    if (loading) return <LoadingScreen />;
    if (!shop) return <div style={styles.error}>Shop not found</div>;

    const handleProductClick = (product) => {
        navigate('/product', { state: { product } });
    };

    const toggleFollow = async () => {
        const newFollowingState = !mockData.isFollowing;
        setMockData(prev => ({
            ...prev,
            isFollowing: newFollowingState,
            followers: newFollowingState ? prev.followers + 1 : prev.followers - 1
        }));

        // Sync with API/User Profile if authenticated
        try {
            const currentFollowing = user?.following_shops || [];
            let newFollowing;
            if (newFollowingState) {
                newFollowing = [...currentFollowing, username];
            } else {
                newFollowing = currentFollowing.filter(u => u !== username);
            }
            await api.updateUserProfile({ following_shops: newFollowing });
        } catch (e) {
            console.error("Failed to sync following state", e);
        }
    };

    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    let displayProducts = [...products];
    if (selectedCategory !== 'All') {
        displayProducts = displayProducts.filter(p => p.category === selectedCategory);
    }

    if (sortBy === 'price-low') {
        displayProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-high') {
        displayProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else {
        displayProducts.reverse();
    }

    return (
        <div style={styles.pageBg} className="shop-page-wrapper">
            <div style={styles.container} className="shop-container">
                {/* 1. Shop Header - Premium Boutique Feel */}
                <div style={styles.headerCard} className="card shop-header-card">
                    <div style={{ ...styles.banner, backgroundImage: `url(${shop.banner_image || shop.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'})` }} className="shop-banner">
                        <div style={styles.overlay} className="glass-dark" />
                        <div style={styles.bannerInfo} className="shop-banner-info">
                            <img
                                src={shop.logo_image || shop.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=60'}
                                alt={shop.shop_name || shop.name}
                                style={styles.logo}
                            />
                            <div style={styles.info}>
                                <h1 style={styles.shopName}>
                                    {shop.shop_name || shop.name}
                                    {shop.isVerified !== false && <CheckCircle size={24} color="#10b981" style={{ marginLeft: '12px', verticalAlign: 'middle' }} />}
                                </h1>
                                <div style={styles.meta}>
                                    <div style={styles.ratingBadge}>
                                        <span>{shop.rating || 4.6}</span>
                                        <Star size={12} fill="white" stroke="white" />
                                    </div>
                                    <span style={styles.followerCount}>{mockData.followers.toLocaleString()} Followers</span>
                                    <div style={styles.metaDivider} />
                                    <span style={styles.metaText}>{shop.location || 'Premium Boutique'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.headerFooter} className="shop-header-footer">
                        <div style={styles.statsStrip}>
                            <div style={styles.statBox}>
                                <div style={styles.statVal}>{mockData.ordersDelivered.toLocaleString()}+</div>
                                <div style={styles.statLabel}>Experiences Delivered</div>
                            </div>
                            <div style={styles.statDivider} />
                            <div style={styles.statBox}>
                                <div style={styles.statVal}>{mockData.yearsOnPlatform} Years</div>
                                <div style={styles.statLabel}>Legacy on TradeLink</div>
                            </div>
                        </div>
                        <div style={styles.headerActions}>
                            <button
                                onClick={toggleFollow}
                                style={mockData.isFollowing ? styles.btnFollowActive : styles.btnFollow}
                                className="btn"
                            >
                                {mockData.isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                            </button>
                            <button
                                style={styles.btnContact}
                                className="btn btn-ghost"
                                onClick={() => {
                                    // Trigger Chatbot via global event or state
                                    window.dispatchEvent(new CustomEvent('openChatbot', {
                                        detail: { message: `Hi, I'm interested in products from ${shop.shop_name || shop.name}.` }
                                    }));
                                }}
                            >
                                <MessageCircle size={18} /> INQUIRE
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Tabs and Stats */}
                <div style={styles.mainLayout} className="shop-main-layout">
                    {/* Left Sidebar: Filters & Stats */}
                    <div style={styles.sidebar} className="shop-sidebar">
                        <div style={styles.sidebarCard}>
                            <h3 style={styles.sidebarTitle}>About</h3>
                            <p style={styles.aboutText}>{shop.description || 'Welcome to our official store.'}</p>
                            <div style={styles.statList}>
                                <div style={styles.statItem}>
                                    <span style={styles.statLabel}>Years on App</span>
                                    <span style={styles.statVal}>{mockData.yearsOnPlatform}+</span>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={styles.statLabel}>Positive Ratings</span>
                                    <span style={styles.statVal}>94%</span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.sidebarCard}>
                            <h3 style={styles.sidebarTitle}>Categories</h3>
                            <div style={styles.catLinks}>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        style={selectedCategory === cat ? styles.catLinkActive : styles.catLink}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div style={styles.contentArea} className="shop-content-area">
                        {/* Tab Nav */}
                        <div style={styles.tabNav}>
                            <button onClick={() => setActiveTab('products')} style={activeTab === 'products' ? styles.tabBtnActive : styles.tabBtn}>ALL PRODUCTS</button>
                            <button onClick={() => setActiveTab('reviews')} style={activeTab === 'reviews' ? styles.tabBtnActive : styles.tabBtn}>REVIEWS</button>
                            <button onClick={() => setActiveTab('policies')} style={activeTab === 'policies' ? styles.tabBtnActive : styles.tabBtn}>POLICIES</button>
                        </div>

                        {activeTab === 'products' && (
                            <>
                                <div style={styles.sortBar}>
                                    <span>Showing {displayProducts.length} items</span>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.selectInput}>
                                        <option value="newest">Newest First</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                    </select>
                                </div>

                                <div style={styles.productGrid}>
                                    {displayProducts.map(product => (
                                        <div key={product.id} style={styles.productCard} className="card" onClick={() => handleProductClick(product)}>
                                            <div style={styles.imgBox}>
                                                <img src={product.image} alt={product.name} style={styles.productImg} />
                                                <div style={styles.pBadge} className="glass">PREMIUM</div>
                                            </div>
                                            <div style={styles.productInfo}>
                                                <h4 style={styles.pName}>{product.name}</h4>
                                                <div style={styles.pRating}>
                                                    <div style={styles.pRatingBox}>
                                                        <span>4.5</span>
                                                        <Star size={10} fill="white" stroke="white" />
                                                    </div>
                                                    <span style={styles.pReviewCount}>(238 reviews)</span>
                                                </div>
                                                <div style={styles.priceRow}>
                                                    <span style={styles.pPrice}>₹{product.price}</span>
                                                    <span style={styles.pOldPrice}>₹{Math.floor(product.price * 1.4)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'reviews' && (
                            <div style={styles.reviewsList}>
                                {mockData.reviews.map(rev => (
                                    <div key={rev.id} style={styles.reviewCard}>
                                        <div style={styles.revHead}>
                                            <div style={styles.revRating}>{rev.rating} ★</div>
                                            <span style={styles.revUser}>{rev.name}</span>
                                            <span style={styles.revDate}>{rev.date}</span>
                                        </div>
                                        <p style={styles.revText}>{rev.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'policies' && (
                            <div style={styles.policyGrid}>
                                <div style={styles.policyCard}>
                                    <h4>Return Policy</h4>
                                    <p>7 Days easy returns and exchange available for all items in original condition.</p>
                                </div>
                                <div style={styles.policyCard}>
                                    <h4>Fast Delivery</h4>
                                    <p>Typically ships within 24 hours. Delivery within 2-4 business days.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div >
    );
};

const styles = {
    pageBg: { backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '60px' },
    container: { maxWidth: 'var(--content-max-width)', margin: '0 auto', padding: '0 24px' },
    headerCard: { marginTop: '24px', overflow: 'hidden', padding: '0' },
    banner: { height: '320px', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 40px 40px 40px' },
    overlay: { position: 'absolute', inset: 0, opacity: 0.6 },
    bannerInfo: { position: 'relative', zIndex: 5, display: 'flex', gap: '32px', alignItems: 'flex-end', width: '100%' },
    logo: { width: '120px', height: '120px', borderRadius: '24px', border: '4px solid rgba(255,255,255,0.2)', objectFit: 'cover', backgroundColor: '#fff', boxShadow: 'var(--shadow-lg)' },
    info: { paddingBottom: '10px' },
    shopName: { fontSize: '36px', fontWeight: 800, color: '#ffffff', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' },
    meta: { display: 'flex', alignItems: 'center', gap: '16px' },
    ratingBadge: { backgroundColor: 'var(--brand-accent)', color: '#fff', fontSize: '13px', fontWeight: 800, padding: '4px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' },
    followerCount: { fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 },
    metaDivider: { width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.3)' },
    metaText: { fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 },
    headerFooter: { padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
    statsStrip: { display: 'flex', gap: '40px', alignItems: 'center' },
    statBox: { display: 'flex', flexDirection: 'column' },
    statVal: { fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' },
    statLabel: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' },
    statDivider: { width: '1px', height: '30px', backgroundColor: 'var(--border-light)' },
    headerActions: { display: 'flex', gap: '16px' },
    btnFollow: { backgroundColor: 'var(--brand-primary)', color: '#fff', padding: '12px 32px' },
    btnFollowActive: { border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', padding: '12px 32px', backgroundColor: 'rgba(79, 70, 229, 0.05)' },
    btnContact: { padding: '12px 24px' },

    mainLayout: { display: 'flex', gap: '32px', marginTop: '32px' },
    sidebar: { width: '300px', display: 'flex', flexDirection: 'column', gap: '24px' },
    sidebarCard: { padding: '24px' },
    sidebarTitle: { fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', borderBottom: '2px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' },
    aboutText: { fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '20px' },
    statList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    statItem: { display: 'flex', justifyContent: 'space-between', fontSize: '14px' },
    statLabel: { color: 'var(--text-muted)', fontWeight: 600 },
    statVal: { color: 'var(--text-main)', fontWeight: 800 },
    catLinks: { display: 'flex', flexDirection: 'column', gap: '8px' },
    catLink: { background: 'none', border: 'none', textAlign: 'left', fontSize: '14px', color: 'var(--text-main)', cursor: 'pointer', padding: '8px 12px', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s' },
    catLinkActive: { background: 'rgba(79, 70, 229, 0.1)', border: 'none', textAlign: 'left', fontSize: '14px', color: 'var(--brand-primary)', fontWeight: 700, cursor: 'pointer', padding: '8px 12px', borderRadius: 'var(--radius-sm)' },

    contentArea: { flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' },
    tabNav: { display: 'flex', gap: '40px', borderBottom: '1px solid var(--border-light)', padding: '0 8px' },
    tabBtn: { padding: '16px 0', border: 'none', background: 'none', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer', borderBottom: '3px solid transparent', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.2s' },
    tabBtnActive: { padding: '16px 0', border: 'none', background: 'none', fontSize: '13px', fontWeight: 800, color: 'var(--brand-primary)', cursor: 'pointer', borderBottom: '3px solid var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '1px' },

    sortBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 },
    selectInput: { border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '14px', color: 'var(--text-main)', fontWeight: 700, backgroundColor: '#fff' },

    productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' },
    productCard: { padding: '0', cursor: 'pointer', overflow: 'hidden' },
    imgBox: { width: '100%', height: '220px', backgroundColor: '#f8fafc', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    productImg: { maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' },
    pBadge: { position: 'absolute', top: '12px', left: '12px', padding: '4px 8px', fontSize: '10px', fontWeight: 800, color: 'var(--brand-primary)', borderRadius: '4px' },
    productInfo: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
    pName: { fontSize: '15px', color: 'var(--text-main)', fontWeight: 600, margin: 0, height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
    pRating: { display: 'flex', alignItems: 'center', gap: '8px' },
    pRatingBox: { backgroundColor: 'var(--brand-accent)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' },
    pReviewCount: { fontSize: '12px', color: 'var(--text-muted)' },
    priceRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    pPrice: { fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' },
    pOldPrice: { fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'line-through' },

    reviewsList: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
    reviewCard: { borderBottom: '1px solid #f0f0f0', paddingBottom: '20px' },
    revHead: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
    revRating: { backgroundColor: '#388e3c', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '1px 5px', borderRadius: '2px' },
    revUser: { fontSize: '14px', fontWeight: 600, color: '#212121' },
    revDate: { fontSize: '12px', color: '#878787' },
    revText: { fontSize: '14px', color: '#212121', lineHeight: '1.4' },

    policyGrid: { padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' },
    policyCard: {},

    error: { textAlign: 'center', padding: '100px 0', fontSize: '20px', color: '#878787' }
};

export default ShopPage;
