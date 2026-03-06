import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VendorCard = ({ partner }) => {
    const navigate = useNavigate();

    return (
        <div
            style={styles.card}
            className="vendor-card card"
            onClick={() => navigate(`/shop/${partner.username || partner.id}`)}
        >
            <div style={styles.imageWrapper}>
                <img src={partner.bannerImage} alt={partner.name} style={styles.banner} loading="lazy" />
                <div style={styles.logoBadge} className="glass">
                    <img src={partner.logoImage} alt="logo" style={styles.logo} loading="lazy" />
                </div>
                <div style={styles.bannerOverlay}></div>
            </div>

            <div style={styles.content}>
                <div style={styles.headerRow}>
                    <h4 style={styles.name}>{partner.name}</h4>
                    <div style={styles.ratingBadge}>
                        <span>{partner.rating}</span>
                        <Star size={10} fill="white" stroke="white" />
                    </div>
                </div>
                <p style={styles.description}>{partner.description}</p>
                <div style={styles.footerRow}>
                    <span style={styles.reviewsText}>{partner.reviews} Verified Reviews</span>
                    <div style={styles.tagsContainer}>
                        {partner.tags.slice(0, 1).map(tag => (
                            <span key={tag} style={styles.tag}>{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div style={styles.actionBtn}>
                <span>ENTER BOUTIQUE</span>
                <ArrowRight size={14} />
            </div>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    imageWrapper: {
        height: '160px',
        position: 'relative',
        backgroundColor: '#f1f5f9',
    },
    banner: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    bannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.2))',
    },
    logoBadge: {
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        padding: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        boxShadow: 'var(--shadow-md)',
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: '10px',
        objectFit: 'cover',
    },
    content: {
        padding: '20px 16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    name: {
        color: 'var(--text-main)',
        margin: 0,
        fontSize: '17px',
        fontWeight: 700,
        flex: 1,
        fontFamily: 'Outfit, sans-serif',
    },
    ratingBadge: {
        backgroundColor: 'var(--brand-accent)',
        color: '#fff',
        fontSize: '11px',
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    description: {
        color: 'var(--text-muted)',
        fontSize: '13px',
        margin: 0,
        lineHeight: '1.5',
        height: '40px',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    footerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    reviewsText: {
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    tagsContainer: {
        display: 'flex',
        gap: '6px',
    },
    tag: {
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--brand-primary)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        padding: '2px 10px',
        borderRadius: '20px',
        textTransform: 'uppercase',
    },
    actionBtn: {
        padding: '16px',
        textAlign: 'center',
        color: 'var(--brand-primary)',
        fontSize: '12px',
        fontWeight: 800,
        backgroundColor: '#f8fafc',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderTop: '1px solid var(--border-light)',
        letterSpacing: '1px',
    }
};

export default VendorCard;
