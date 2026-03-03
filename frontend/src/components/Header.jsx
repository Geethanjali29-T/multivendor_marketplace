import React, { useState } from 'react';
import { Search, ShoppingBag, Zap, ChevronDown, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = ({ activeCategory, setActiveCategory }) => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const location = useLocation();
    const navigate = useNavigate();
    const isBusinessPage = location.pathname === '/';

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const categories = ['All', 'Electronics', 'Rentals', 'Vehicle Services', 'Healthcare', 'Grocery', 'Education'];

    return (
        <header style={styles.header}>
            <div style={styles.topSection}>
                {/* Brand Logo */}
                <Link to="/" style={styles.logoContainer}>
                    <div style={styles.logoIcon}>
                        <Zap size={20} color="white" />
                    </div>
                    <span style={styles.logoText}>TradeLink</span>
                </Link>

                {/* Search Bar */}
                <div style={styles.searchContainer}>
                    <Search size={18} color="var(--text-muted)" style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search verified businesses, rentals..."
                        style={styles.searchInput}
                    />
                </div>

                {/* Right Actions */}
                <div style={styles.actionsContainer}>
                    <Link to="/cart" style={styles.iconButton}>
                        <ShoppingBag size={20} color="var(--text-main)" />
                        {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                    </Link>

                    {user ? (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Link to="/profile" style={styles.iconButton} title="My Profile">
                                <div style={styles.userAvatar}>
                                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" style={{ ...styles.btnSecondary, display: 'flex', alignItems: 'center' }}>
                                    Admin Panel
                                </Link>
                            )}
                            {user.role === 'vendor' && (
                                <Link to="/dashboard" style={{ ...styles.btnSecondary, display: 'flex', alignItems: 'center' }}>
                                    Store Dashboard
                                </Link>
                            )}
                            <button onClick={() => { logout(); navigate('/'); }} style={styles.btnDanger}>LOGOUT</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link to="/login" style={{ ...styles.btnOutline, display: 'flex', alignItems: 'center' }}>
                                SIGN IN
                            </Link>
                            <Link to="/register" style={{ ...styles.btnPrimary, display: 'flex', alignItems: 'center' }}>
                                PARTNER REGISTRATION
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button style={styles.mobileMenuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Bottom Nav - Categories */}
            <nav style={styles.bottomNav}>
                <ul style={styles.navLinks}>
                    {categories.map((cat, index) => (
                        <li key={index}>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (setActiveCategory) setActiveCategory(cat);
                                    if (location.pathname !== '/') navigate('/');
                                }}
                                style={{
                                    ...styles.navLinkBtn,
                                    color: activeCategory === cat && location.pathname === '/'
                                        ? 'var(--brand-primary)'
                                        : 'var(--text-main)',
                                }}>
                                {cat}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button style={{ ...styles.navLinkBtn, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            More <ChevronDown size={14} />
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

const styles = {
    header: {
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
    },
    topSection: {
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 3rem',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
    },
    logoIcon: {
        width: '36px',
        height: '36px',
        backgroundColor: 'var(--brand-secondary)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontFamily: 'Outfit',
        fontWeight: 700,
        fontSize: '1.4rem',
        color: 'var(--brand-secondary)',
    },
    searchContainer: {
        position: 'relative',
        flex: 1,
        maxWidth: '480px',
        margin: '0 24px',
    },
    searchIcon: {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
    },
    searchInput: {
        width: '100%',
        padding: '12px 16px 12px 42px',
        borderRadius: '99px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        fontSize: '0.9rem',
        color: 'var(--text-main)',
        outline: 'none',
        transition: 'all 0.2s',
    },
    actionsContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    iconButton: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#f8fafc',
        transition: 'background-color 0.2s',
        color: 'var(--text-main)',
    },
    badge: {
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        backgroundColor: 'var(--brand-accent)',
        color: 'white',
        fontSize: '0.65rem',
        fontWeight: 700,
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '1rem',
    },
    btnPrimary: {
        padding: '8px 16px',
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        transition: 'background-color 0.2s',
    },
    btnSecondary: {
        padding: '8px 16px',
        backgroundColor: 'var(--brand-secondary)',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        transition: 'background-color 0.2s',
    },
    btnOutline: {
        padding: '8px 16px',
        border: '1px solid #e2e8f0',
        backgroundColor: 'transparent',
        color: 'var(--text-main)',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        transition: 'background-color 0.2s',
    },
    btnDanger: {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        color: '#ef4444',
        border: 'none',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        cursor: 'pointer',
    },
    mobileMenuBtn: {
        display: 'none', // Hidden on desktop
        background: 'none',
        border: 'none',
        color: 'var(--text-main)',
        cursor: 'pointer',
    },
    bottomNav: {
        borderTop: '1px solid #f1f5f9',
        padding: '0 3rem',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
    },
    navLinks: {
        listStyle: 'none',
        display: 'flex',
        gap: '32px',
        margin: 0,
        padding: '12px 0',
        overflowX: 'auto',
    },
    navLinkBtn: {
        background: 'none',
        border: 'none',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--text-main)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        padding: '4px 0',
    }
};

export default Header;
