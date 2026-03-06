import React from 'react';
import { Lightbulb, ChevronRight, ChevronLeft, Star } from 'lucide-react';

const RecommendationsCarousel = ({ category = 'All' }) => {
    // Simulated Machine Learning Output based on browsing history
    const recommendedProducts = [
        {
            id: 1,
            title: 'Books',
            vendor: 'STATIONARY SHOP',
            price: '₹25',
            reason: 'Top Pick',
            tagColor: '#6366f1',
            rating: 5.0,
            image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
            bgTint: '#f1f5f9'
        },
        {
            id: 2,
            title: 'German Language A1 Course',
            vendor: 'YES GERMANY DELHI',
            price: '₹18500',
            reason: 'Great Match',
            tagColor: '#f59e0b',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80',
            bgTint: '#fffbeb'
        },
        {
            id: 3,
            title: 'Study in Germany Consultation',
            vendor: 'YES GERMANY DELHI',
            price: '₹5000',
            reason: 'Great Match',
            tagColor: '#f59e0b',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400&q=80',
            bgTint: '#fffbeb'
        },
        {
            id: 4,
            title: 'Full Vehicle Service Package',
            vendor: 'SPEEDY WHEELS',
            price: '₹4999',
            reason: 'Great Match',
            tagColor: '#f59e0b',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=400&q=80',
            bgTint: '#fffbeb'
        }
    ];

    const filteredProducts = category === 'All'
        ? recommendedProducts
        : recommendedProducts.filter(p => {
            if (category === 'Electronics') return p.title.includes('Vehicle') || p.title.includes('Course'); // Simulate relevance
            if (category === 'Education') return p.title.includes('German') || p.title.includes('Study');
            return true;
        });

    const displayProducts = filteredProducts.length > 0 ? filteredProducts : recommendedProducts;

    return (
        <div style={styles.container}>
            <div style={styles.headerArea}>
                <div>
                    <div style={styles.badgeWrapper}>
                        <div style={styles.iconWrapper}>
                            <Lightbulb size={14} color="white" />
                        </div>
                        <span style={styles.badgeText}>TRENDING NOW</span>
                    </div>
                    <h2 style={styles.title}>Recommended <span style={{ color: 'var(--brand-primary)' }}>For You</span></h2>
                    <p style={styles.subtitle}>Discover our most popular and top-rated products</p>
                </div>
                <div style={styles.controls}>
                    <button style={styles.controlBtn}><ChevronLeft size={20} color="#94a3b8" /></button>
                    <button style={styles.controlBtn}><ChevronRight size={20} color="#0f172a" /></button>
                </div>
            </div>

            <div style={styles.carouselTrack}>
                {displayProducts.map(product => (
                    <div key={product.id} style={styles.card}>
                        <div style={{ ...styles.imageSection, backgroundColor: product.bgTint }}>
                            <div style={styles.tagLine}>
                                <div style={styles.categoryPill}>EDUCATION</div>
                                <div style={{ ...styles.reasonPill, backgroundColor: product.tagColor }}>
                                    {product.reason === 'Top Pick' && <Star size={10} fill="white" style={{ marginRight: '4px' }} />}
                                    {product.reason}
                                </div>
                            </div>
                            <img src={product.image} alt={product.title} style={styles.image} />
                        </div>

                        <div style={styles.contentSection}>
                            <div style={styles.ratingInfo}>
                                <Star fill="#f59e0b" color="#f59e0b" size={14} />
                                <span style={styles.ratingText}>{product.rating}</span>
                            </div>
                            <h3 style={styles.productTitle}>{product.title}</h3>
                            <p style={styles.vendorText}>STORE: {product.vendor}</p>

                            <div style={styles.priceRow}>
                                <span style={styles.price}>{product.price}</span>
                                <button style={styles.addBtn}>+</button>
                            </div>
                        </div>

                        <div style={styles.footerHints}>
                            <span style={styles.hintItem}>✧ Top rated on TradeLink</span>
                            <span style={styles.hintItem}>✧ Discover something new</span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={styles.paginationDots}>
                <div style={{ ...styles.dot, ...styles.dotActive }}></div>
                <div style={styles.dot}></div>
                <div style={styles.dot}></div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        marginBottom: '48px',
        padding: '0 24px',
    },
    headerArea: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '24px',
    },
    badgeWrapper: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        backgroundColor: '#f8fafc',
        padding: '4px 12px 4px 4px',
        borderRadius: '99px',
    },
    iconWrapper: {
        backgroundColor: 'var(--brand-primary)',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)',
    },
    badgeText: {
        fontSize: '0.7rem',
        fontWeight: 700,
        color: 'var(--brand-primary)',
        letterSpacing: '0.05em',
    },
    title: {
        fontSize: '2.2rem',
        fontWeight: 800,
        color: 'var(--brand-secondary)',
        margin: '0 0 8px 0',
        lineHeight: 1.1,
    },
    subtitle: {
        fontSize: '0.95rem',
        color: '#64748b',
        margin: 0,
    },
    controls: {
        display: 'flex',
        gap: '8px',
    },
    controlBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '1px solid #e2e8f0',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        transition: 'all 0.2s',
    },
    carouselTrack: {
        display: 'flex',
        gap: '24px',
        overflowX: 'auto',
        paddingBottom: '24px',
        scrollbarWidth: 'none', // hide scrollbar Firefox
        msOverflowStyle: 'none',  // hide scrollbar IE 10+
    },
    card: {
        flex: '0 0 320px',
        backgroundColor: 'white',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease',
    },
    imageSection: {
        height: '220px',
        position: 'relative',
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    tagLine: {
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    categoryPill: {
        backgroundColor: '#6366f1',
        color: 'white',
        fontSize: '0.65rem',
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: '6px',
        letterSpacing: '0.05em',
    },
    reasonPill: {
        color: 'white',
        fontSize: '0.65rem',
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: '99px',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    image: {
        width: '85%',
        height: '85%',
        objectFit: 'cover',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    },
    contentSection: {
        padding: '20px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    ratingInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '12px',
    },
    ratingText: {
        fontSize: '0.85rem',
        fontWeight: 700,
        color: '#f59e0b',
    },
    productTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        color: 'var(--brand-secondary)',
        margin: '0 0 8px 0',
        lineHeight: 1.3,
    },
    vendorText: {
        fontSize: '0.7rem',
        color: '#64748b',
        fontWeight: 600,
        margin: '0 0 24px 0',
        letterSpacing: '0.05em',
    },
    priceRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    price: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: 'var(--brand-secondary)',
    },
    addBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        color: '#64748b',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    footerHints: {
        borderTop: '1px dashed #e2e8f0',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#fafaf9',
    },
    hintItem: {
        fontSize: '0.65rem',
        color: '#94a3b8',
        fontWeight: 500,
    },
    paginationDots: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '16px',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#cbd5e1',
        transition: 'all 0.3s',
    },
    dotActive: {
        width: '24px',
        borderRadius: '4px',
        backgroundColor: 'var(--brand-primary)',
    }
};

export default RecommendationsCarousel;
