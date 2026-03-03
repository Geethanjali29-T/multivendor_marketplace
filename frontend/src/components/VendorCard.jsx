import React from 'react';
import { Star } from 'lucide-react';

const VendorCard = ({ partner }) => {
    return (
        <div style={styles.card} className="vendor-card">
            <div style={styles.imageContainer}>
                <img src={partner.bannerImage} alt={partner.name} style={styles.banner} loading="lazy" />
                <div style={styles.overlay}>
                    <img src={partner.logoImage} alt="logo" style={styles.logo} loading="lazy" />
                    <div>
                        <h4 style={styles.name}>{partner.name}</h4>
                        <div style={styles.ratingContainer}>
                            <Star size={12} color="var(--brand-accent)" fill="var(--brand-accent)" />
                            <span style={styles.ratingText}>{partner.rating} ({partner.reviews})</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.content}>
                <p style={styles.description}>{partner.description}</p>
                <div style={styles.tagsContainer}>
                    {partner.tags.map(tag => (
                        <span key={tag} style={styles.tag}>{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    imageContainer: {
        height: '160px',
        position: 'relative',
    },
    banner: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    logo: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        border: '2px solid white',
        objectFit: 'cover',
    },
    name: {
        color: 'white',
        margin: 0,
        fontSize: '1rem',
        fontWeight: 600,
    },
    ratingContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '2px',
    },
    ratingText: {
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: 500,
    },
    content: {
        padding: '24px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    description: {
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        marginBottom: '20px',
        lineHeight: 1.5,
        flex: 1,
    },
    tagsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    tag: {
        fontSize: '0.65rem',
        fontWeight: 700,
        color: 'var(--brand-primary)',
        backgroundColor: 'var(--brand-primary-light)',
        padding: '4px 10px',
        borderRadius: '99px',
        letterSpacing: '0.05em',
    }
};

export default VendorCard;
