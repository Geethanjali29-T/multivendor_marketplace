import React, { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import VendorCard from '../components/VendorCard';
import ProductModal from '../components/ProductModal';
import LoadingScreen from '../components/LoadingScreen';
import RecommendationsCarousel from '../components/RecommendationsCarousel';
import { api } from '../services/api';

const PartnersPage = ({ activeCategory = 'All' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleOpenModal = (partner) => {
        setSelectedPartner(partner);
        setIsModalOpen(true);
    };

    // Fallback Mock Data in case the Django backend is empty
    const fallbackMockPartners = [
        {
            id: 1,
            name: 'YES Germany Delhi - Study Abroad',
            rating: 4.8,
            reviews: 973,
            description: 'Premier German Education Consultant in Delhi. Providing German Language Classes and Study Abroad counseling.',
            tags: ['EDUCATION', 'RENTALS'],
            bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60',
            logoImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=128&h=128&q=60',
        },
        {
            id: 2,
            name: 'Apollo Health & Grocery',
            rating: 4.6,
            reviews: 512,
            description: 'Verified healthcare products and premium daily groceries in Green Park.',
            tags: ['HEALTHCARE', 'GROCERY'],
            bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60',
            logoImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=128&h=128&q=60',
        },
        {
            id: 3,
            name: 'Speedy Wheels Service',
            rating: 4.7,
            reviews: 284,
            description: 'Expert vehicle servicing and specialized rentals for travelers.',
            tags: ['VEHICLE SERVICES', 'RENTALS'],
            bannerImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60',
            logoImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=128&h=128&q=60',
        },
        {
            id: 4,
            name: 'Tech Haven',
            rating: 4.7,
            reviews: 450,
            description: 'Latest gadgets, laptops, and smart home devices.',
            tags: ['ELECTRONICS'],
            bannerImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=60',
            logoImage: 'https://plus.unsplash.com/premium_photo-1661914978519-52a11fe159a7?auto=format&fit=facearea&facepad=2&w=128&h=128&q=60',
        },
        {
            id: 5,
            name: 'Global EduTech',
            rating: 4.5,
            reviews: 89,
            description: 'Online coding bootcamps and certification courses.',
            tags: ['EDUCATION'],
            bannerImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=400&q=60',
            logoImage: 'https://images.unsplash.com/photo-1563986768609-322a13526dc6?auto=format&fit=facearea&facepad=2&w=128&h=128&q=60',
        },
        {
            id: 6,
            name: 'Fresh Mart',
            rating: 4.6,
            reviews: 890,
            description: 'Organic produce and daily essentials delivered fast.',
            tags: ['GROCERY'],
            bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=60',
            logoImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=60',
        },
        {
            id: 7,
            name: 'City Care Clinic',
            rating: 4.7,
            reviews: 420,
            description: 'General physicians and specialized consultations.',
            tags: ['HEALTHCARE'],
            bannerImage: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=400&q=60',
            logoImage: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=facearea&facepad=2&w=128&h=128&q=60',
        },
        {
            id: 8,
            name: 'GearHead Electronics',
            rating: 4.9,
            reviews: 1200,
            description: 'Premium audio gear and custom PC builds.',
            tags: ['ELECTRONICS'],
            bannerImage: 'https://images.unsplash.com/photo-1550009158-9aff6f6c945c?auto=format&fit=crop&w=400&q=60',
            logoImage: 'https://images.unsplash.com/photo-1550009158-9aff6f6c945c?auto=format&fit=facearea&facepad=2&w=128&h=128&q=60',
        }
    ];

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const [vendorsData, productsData] = await Promise.all([
                    api.getVendors(),
                    api.getProducts().catch(() => [])
                ]);

                const mappedPartners = vendorsData.map((shop, index) => {
                    const vendorProducts = productsData.filter(p => p.vendor_id === shop.vendor_id);
                    const mainProduct = vendorProducts[0] || {};

                    return {
                        id: shop._id || shop.vendor_id || index, // Use mongo ID
                        name: shop.name || shop.shop_name || 'Vendor Name',
                        rating: shop.rating || 4.8,
                        reviews: Math.floor(Math.random() * 500) + 50,
                        description: shop.description || `${shop.category || 'Retail'} items from ${shop.location || 'Local'}.`,
                        tags: shop.category ? [shop.category.toUpperCase()] : ['PARTNER'],
                        price: mainProduct.price || Math.floor(Math.random() * 500) + 50,
                        productName: mainProduct.name || `${shop.category || 'Premium'} Service Package`,
                        bannerImage: mainProduct.image || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=60`,
                        logoImage: `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=60`,
                    };
                });

                if (mappedPartners.length > 0) {
                    setVendors(mappedPartners);
                } else {
                    setVendors(fallbackMockPartners);
                }
            } catch (error) {
                console.error("Failed to fetch vendors", error);
                setVendors(fallbackMockPartners);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    // Filter vendors based on activeCategory state passed from Header
    const filteredPartners = activeCategory === 'All'
        ? vendors
        : vendors.filter(p => p.tags.includes(activeCategory.toUpperCase()));

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="fade-in">
            {/* New Hero Section - Only show when 'All' categories are selected */}
            {activeCategory === 'All' && (
                <div style={styles.heroSection}>
                    <div style={styles.heroOverlay} />
                    <div style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <span style={styles.heroBadgeDot}></span>
                            NEW STANDARD FOR LOCAL COMMERCE 2026
                        </div>
                        <h1 style={styles.heroTitle}>
                            Connect to<br />
                            your <span style={styles.heroHighlight}>local</span><br />
                            <span style={styles.heroHighlight}>ecosystem.</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            The most intelligent multi-vendor hub in the city. Access premium education in Nehru Place, specialized healthcare in Green Park, and more.
                        </p>
                    </div>
                </div>
            )}

            {/* AI Recommendations - Only show when 'All' categories are selected */}
            {activeCategory === 'All' && (
                <div style={{ paddingBottom: '32px' }}>
                    <RecommendationsCarousel />
                </div>
            )}

            <div style={styles.header}>
                <h2 style={{ fontSize: '2rem', color: 'var(--brand-secondary)', margin: 0 }}>
                    {activeCategory === 'All' ? 'Our ' : ''}<span style={{ color: 'var(--brand-primary)' }}>{activeCategory === 'All' ? 'Partners' : activeCategory}</span>
                </h2>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', margin: 0 }}>
                    {filteredPartners.length} Verified Vendors
                </p>
            </div>

            <div style={styles.grid}>
                {filteredPartners.map(partner => (
                    <div key={partner.id} onClick={() => handleOpenModal(partner)}>
                        <VendorCard partner={partner} />
                    </div>
                ))}
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partner={selectedPartner}
            />
        </div>
    );
};

const styles = {
    heroSection: {
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        minHeight: '480px',
        marginBottom: '48px',
        display: 'flex',
        alignItems: 'center',
        background: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60") center/cover no-repeat', // Placeholder store image
    },
    heroOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)', // Dark blue tint
        zIndex: 1,
    },
    heroContent: {
        position: 'relative',
        zIndex: 2,
        padding: '64px',
        maxWidth: '700px',
    },
    heroBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '99px',
        color: 'white',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        marginBottom: '32px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    heroBadgeDot: {
        width: '6px',
        height: '6px',
        backgroundColor: '#8b5cf6',
        borderRadius: '50%',
    },
    heroTitle: {
        fontSize: '4.5rem',
        lineHeight: 1.1,
        color: 'white',
        margin: '0 0 24px 0',
        letterSpacing: '-0.03em',
    },
    heroHighlight: {
        color: '#c4b5fd',
        fontStyle: 'italic',
    },
    heroSubtitle: {
        fontSize: '1.1rem',
        color: '#cbd5e1',
        lineHeight: 1.6,
        maxWidth: '600px',
        margin: 0,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        maxWidth: '1200px',
        margin: '0 auto 32px auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
    }
};

export default PartnersPage;
