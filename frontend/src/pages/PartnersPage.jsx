import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Zap, X, ArrowRight } from 'lucide-react';
import VendorCard from '../components/VendorCard';
import LoadingScreen from '../components/LoadingScreen';
import RecommendationsCarousel from '../components/RecommendationsCarousel';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PartnersPage = ({ activeCategory = 'All', setActiveCategory }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';

    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRecommendation, setShowRecommendation] = useState(false);
    const [trendingTab, setTrendingTab] = useState('New'); // 'New' or 'Top'

    useEffect(() => {
        const timer = setTimeout(() => {
            const settings = JSON.parse(localStorage.getItem('marketplace_settings') || '{}');
            const isAIEnabled = settings.aiRecommendations !== false;

            if (isAIEnabled) {
                setShowRecommendation(true);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleOpenModal = (product) => {
        // AI Tracking: Log view for this category
        if (product.category) api.trackActivity('view', product.category);
        if (product.product_id) api.trackActivity('view', `p_${product.product_id}`);
        navigate('/product', { state: { product } });
    };

    // Fallback Mock Data in case the Django backend is empty
    const fallbackMockPartners = [
        {
            id: 1,
            name: 'Elite Mobile Hub',
            rating: 4.8,
            reviews: 973,
            description: 'Latest premium smartphones and high-speed accessories.',
            tags: ['MOBILES'],
            bannerImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=60',
            logoImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=facearea&facepad=2&w=128&h=128&q=60',
        },
        {
            id: 2,
            name: 'Kitchen Excellence',
            rating: 4.6,
            reviews: 512,
            description: 'Premium home and kitchen appliances for modern living.',
            tags: ['HOME & KITCHEN', 'APPLIANCES'],
            bannerImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=60',
            logoImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=facearea&facepad=2&w=128&h=128&q=60',
        },
        {
            id: 3,
            name: 'Vogue Boutique',
            rating: 4.7,
            reviews: 284,
            description: 'Curated high-fashion apparel and designer accessories.',
            tags: ['FASHION'],
            bannerImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=400&q=60',
            logoImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=facearea&facepad=2&w=128&h=128&q=60',
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                let productsData = [];
                let vendorsData = await api.getVendors();
                let recData = [];

                if (user) {
                    recData = await api.getAIRecommendations();
                    setRecommendations(recData);
                }

                if (searchQuery) {
                    productsData = await api.searchProducts(searchQuery);
                    // AI Tracking: Search activity is already tracked in Header, 
                    // but we can track category views if search matches a category
                } else if (activeCategory !== 'All') {
                    productsData = await api.getProducts(activeCategory);
                    if (user) api.trackActivity('view', activeCategory);
                } else {
                    productsData = await api.getProducts();
                }

                const mappedPartners = vendorsData.map((shop, index) => {
                    const vendorProducts = productsData.filter(p => p.vendor_username === shop.username);
                    const mainProduct = vendorProducts[0] || {};

                    return {
                        id: shop._id || shop.vendor_id || index,
                        name: shop.name || shop.shop_name || 'Vendor Name',
                        username: shop.username,
                        description: shop.description || `${shop.category || 'Retail'} items from ${shop.location || 'Local'}.`,
                        tags: shop.category ? [shop.category.toUpperCase()] : ['PARTNER'],
                        price: mainProduct.price || Math.floor(Math.random() * 500) + 50,
                        productName: mainProduct.name || `${shop.category || 'Premium'} Service Package`,
                        bannerImage: shop.banner_image || mainProduct.image || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=60`,
                        logoImage: shop.logo_image || `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=60`,
                    };
                });

                if (mappedPartners.length > 0 || productsData.length > 0) {
                    setVendors(mappedPartners);
                    setProducts(productsData);
                } else {
                    setVendors(fallbackMockPartners);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                setVendors(fallbackMockPartners);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeCategory, searchQuery, user]);

    // Filter vendors based on activeCategory state passed from Header AND searchQuery
    const filteredPartners = vendors.filter(p => {
        const matchesCategory = activeCategory === 'All' ? true : p.tags.includes(activeCategory.toUpperCase());
        const matchesSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const filteredProducts = products.filter(p => {
        const pCategory = p.category ? p.category.toUpperCase() : 'UNKNOWN';
        const matchesCategory = activeCategory === 'All' ? true : pCategory === activeCategory.toUpperCase() || (vendors.find(v => v.id === p.vendor_id)?.tags.includes(activeCategory.toUpperCase()));
        const matchesSearch = !searchQuery ||
            (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.vendor_name && p.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="fade-in" style={styles.pageWrapper}>
            {/* Top Categories Strip - Floating & Interactive */}
            <div style={styles.categoryStrip} className="category-strip-container">
                <div style={styles.contentContainer} className="category-strip-content">
                    {['Mobiles', 'Fashion', 'Electronics', 'Appliances', 'Beauty', 'Toys', 'Sports', 'Home & Kitchen'].map(cat => (
                        <div key={cat} style={styles.catItem} className="cat-hover" onClick={() => {
                            if (setActiveCategory) setActiveCategory(cat);
                            navigate('/'); // Clear search by navigating to root without query
                        }}>
                            <div style={styles.catCircle}>
                                <div style={styles.catIconWrapper}>
                                    <img src={`https://img.icons8.com/color/48/${cat.toLowerCase()}.png`} alt={cat} style={{ width: '36px' }}
                                        onError={(e) => e.target.src = "https://img.icons8.com/color/48/shopping-cart.png"} />
                                </div>
                            </div>
                            <span style={styles.catLabel}>{cat}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area - Wide & Breathable */}
            <div style={styles.mainContent} className="partners-main-content">
                {/* Hero Banner Area */}
                <div style={styles.bannerContainer} className="home-hero-banner">
                    <img
                        src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                        alt="Summer Sale"
                        style={styles.heroBanner}
                    />
                    <div style={styles.bannerOverlay} className="glass hero-banner-overlay">
                        <div style={styles.bannerText}>SUMMER COLLECTION 2026</div>
                        <div style={styles.bannerSub}>UP TO 70% OFF PREMIUM BRANDS</div>
                        <button
                            style={styles.bannerBtn}
                            className="btn btn-primary"
                            onClick={() => document.getElementById('products-grid-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            SHOP NOW
                        </button>
                    </div>
                </div>

                {/* AI Recommendations Section */}
                {recommendations.length > 0 && (
                    <div style={styles.sectionCard} className="card" id="products-grid-section">
                        <div style={styles.sectionHeader}>
                            <div style={styles.sectionTitleBlock}>
                                <h2 style={styles.sectionTitle}>Recommended For You</h2>
                                <p style={styles.sectionSubtitle}>AI-curated selection based on your recent activity</p>
                            </div>
                            <div style={styles.aiBadge}>AI POWERED</div>
                        </div>
                        <div style={styles.horizontalScroll}>
                            {recommendations.map(prod => (
                                <div key={prod.id || prod._id} style={styles.productTile} onClick={() => handleOpenModal(prod)}>
                                    <div style={styles.tileImageContainer}>
                                        <img src={prod.image} alt={prod.name} style={styles.tileImage} />
                                    </div>
                                    <div style={styles.tileInfo}>
                                        <div style={styles.tileName}>{prod.name}</div>
                                        <div style={styles.tilePrice}>₹{prod.price}</div>
                                        <div style={styles.tileTag}>{prod.category}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Vertical Section: Dynamic Title for Search or Category */}
                <div style={styles.sectionCard} className="card">
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionTitleBlock}>
                            <h2 style={styles.sectionTitle}>
                                {searchQuery ? `Search Results: ${searchQuery}` : `${activeCategory === 'All' ? 'Our' : activeCategory} Collections`}
                            </h2>
                            <p style={styles.sectionSubtitle}>
                                {searchQuery ? `Products matching your query` : `The latest in premium ${activeCategory === 'All' ? 'marketplace' : activeCategory.toLowerCase()} selections`}
                            </p>
                        </div>
                        {searchQuery && (
                            <button style={styles.viewAllBtn} onClick={() => {
                                navigate(`/?search=${encodeURIComponent(searchQuery)}`);
                            }}>REFRESH RESULTS</button>
                        )}
                        {!searchQuery && (
                            <button style={styles.viewAllBtn} onClick={() => {
                                if (activeCategory !== 'All') {
                                    // Properly filter by category instead of searching for category name
                                    if (setActiveCategory) setActiveCategory(activeCategory);
                                    document.getElementById('products-grid-section')?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                    document.getElementById('products-grid-section')?.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}>VIEW FULL COLLECTION</button>
                        )}
                    </div>
                    <div style={styles.horizontalScroll}>
                        {(searchQuery ? filteredProducts : products.filter(p => !activeCategory || activeCategory === 'All' || p.category?.toUpperCase() === activeCategory.toUpperCase())).slice(0, 8).map(prod => (
                            <div key={prod.id || prod._id} style={styles.productTile} onClick={() => handleOpenModal(prod)}>
                                <div style={styles.tileImageContainer}>
                                    <img src={prod.image} alt={prod.name} style={styles.tileImage} />
                                </div>
                                <div style={styles.tileInfo}>
                                    <div style={styles.tileName}>{prod.name}</div>
                                    <div style={styles.tilePrice}>From ₹{prod.price}</div>
                                    <div style={styles.tileTag}>{prod.category}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Product Grid Section */}
                <div id="products-grid-section" style={{ padding: '24px 8px' }}>
                    <div style={styles.gridHeader}>
                        <h3 style={styles.gridTitle}>Curated For You</h3>
                        <div style={styles.gridFilterSummary}>{filteredProducts.length} Items Found</div>
                    </div>
                    <div style={styles.gridContainer}>
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                style={styles.gridViewCard}
                                className="card"
                                onClick={() => handleOpenModal(product)}
                            >
                                <div style={styles.gridImageWrapper}>
                                    <img src={product.image} alt={product.name} style={styles.gridImage} />
                                    <div style={styles.discountBadge} className="glass">30% OFF</div>
                                </div>
                                <div style={styles.gridContent}>
                                    <h4 style={styles.gridName}>{product.name}</h4>
                                    <div style={styles.gridPriceRow}>
                                        <span style={styles.currentPrice}>₹{product.price}</span>
                                        <span style={styles.oldPrice}>₹{Math.floor(product.price * 1.4)}</span>
                                    </div>
                                    <div style={styles.deliveryInfo}>
                                        <Zap size={12} color="var(--brand-secondary)" fill="var(--brand-secondary)" />
                                        <span>EXPRESS DELIVERY</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

const styles = {
    pageWrapper: {
        backgroundColor: 'var(--bg-color)',
        minHeight: '100vh',
    },
    categoryStrip: {
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        marginBottom: '24px',
        padding: '16px 0',
    },
    contentContainer: {
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 24px',
    },
    catItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        gap: '12px',
        transition: 'transform 0.2s',
    },
    catCircle: {
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.3s ease',
    },
    catIconWrapper: {
        transition: 'transform 0.3s ease',
    },
    catLabel: {
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-main)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    mainContent: {
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        padding: '0 24px',
    },
    bannerContainer: {
        width: '100%',
        margin: '8px 0 32px 0',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        height: '400px',
    },
    heroBanner: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    bannerOverlay: {
        position: 'absolute',
        top: '50%',
        left: '5%',
        transform: 'translateY(-50%)',
        padding: '40px',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '450px',
    },
    bannerText: {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '42px',
        fontWeight: 800,
        color: '#0f172a',
        lineHeight: '1.1',
        marginBottom: '16px',
    },
    bannerSub: {
        fontSize: '16px',
        color: '#475569',
        fontWeight: 600,
        marginBottom: '24px',
    },
    sectionCard: {
        margin: '32px 0',
        padding: '24px',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
    },
    sectionTitleBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: 800,
        margin: 0,
        color: '#0f172a',
    },
    sectionSubtitle: {
        fontSize: '14px',
        color: 'var(--text-muted)',
        margin: 0,
    },
    viewAllBtn: {
        backgroundColor: 'var(--brand-primary)',
        color: '#fff',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 20px',
        fontSize: '12px',
        fontWeight: 700,
        border: 'none',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    aiBadge: {
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        color: 'var(--brand-primary)',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '1px',
        border: '1px solid rgba(79, 70, 229, 0.2)',
    },
    horizontalScroll: {
        display: 'flex',
        overflowX: 'auto',
        gap: '24px',
        paddingBottom: '16px',
        scrollbarWidth: 'none',
    },
    productTile: {
        minWidth: '200px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    tileImageContainer: {
        height: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: '12px',
    },
    tileImage: {
        maxHeight: '100%',
        maxWidth: '100%',
        transition: 'transform 0.3s ease',
    },
    tileInfo: {
        textAlign: 'left',
    },
    tileName: {
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-main)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    tilePrice: {
        color: 'var(--brand-primary)',
        fontSize: '16px',
        fontWeight: 800,
        marginTop: '4px',
    },
    tileTag: {
        color: 'var(--text-muted)',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginTop: '2px',
    },
    gridHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '0 8px',
    },
    gridTitle: {
        fontSize: '22px',
        fontWeight: 800,
        margin: 0,
    },
    gridFilterSummary: {
        fontSize: '14px',
        color: 'var(--text-muted)',
        fontWeight: 600,
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '24px',
    },
    gridViewCard: {
        padding: '0',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
    },
    gridImageWrapper: {
        height: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: '#f8fafc',
    },
    gridImage: {
        maxHeight: '80%',
        maxWidth: '80%',
        objectFit: 'contain',
    },
    discountBadge: {
        position: 'absolute',
        top: '12px',
        left: '12px',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: 800,
        color: 'var(--brand-secondary)',
        borderRadius: 'var(--radius-sm)',
    },
    gridContent: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    gridName: {
        fontSize: '15px',
        fontWeight: 600,
        margin: 0,
        color: 'var(--text-main)',
        height: '42px',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    gridRating: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    ratingBox: {
        backgroundColor: 'var(--brand-accent)',
        color: '#fff',
        fontSize: '12px',
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    reviewCount: {
        fontSize: '12px',
        color: 'var(--text-muted)',
    },
    gridPriceRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginTop: '4px',
    },
    currentPrice: {
        fontSize: '18px',
        fontWeight: 800,
        color: 'var(--text-main)',
    },
    oldPrice: {
        fontSize: '14px',
        color: 'var(--text-muted)',
        textDecoration: 'line-through',
    },
    deliveryInfo: {
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '8px',
        letterSpacing: '0.5px',
    }
};

export default PartnersPage;
