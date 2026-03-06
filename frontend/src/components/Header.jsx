import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingBag, Zap, ChevronDown, Menu, X, User, Bell } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';

const Header = ({ activeCategory, setActiveCategory }) => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const location = useLocation();
    const navigate = useNavigate();
    const isBusinessPage = location.pathname === '/';

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    const allCategories = ['All', 'Mobiles', 'Fashion', 'Electronics', 'Appliances', 'Home & Kitchen', 'Beauty', 'Sports', 'Toys'];
    const visibleCategoriesCount = 7;
    const displayedCategories = showAllCategories ? allCategories : allCategories.slice(0, visibleCategoriesCount);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (user) {
            const fetchNotifs = async () => {
                const data = await api.getNotifications();
                setNotifications(data);
            };
            fetchNotifs();
            const interval = setInterval(fetchNotifs, 30000); // Polling every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = e.currentTarget.search.value.trim();
        if (query) {
            api.trackActivity('search', query);
            navigate(`/?search=${encodeURIComponent(query)}`);
        } else {
            navigate(`/`);
        }
    };

    return (
        <header style={styles.header}>
            {/* Top Bar: Amazon-style utility with Myntra-style precision */}
            <div style={styles.topSection}>
                <div style={styles.contentContainer}>
                    {/* Brand Logo - Minimalist & Bold */}
                    <Link to="/" style={styles.logoContainer}>
                        <div style={styles.logoText}>
                            TRADE<span style={{ color: 'var(--brand-secondary)' }}>LINK</span>
                        </div>
                        <div style={styles.logoTagline}>Premium Marketplace</div>
                    </Link>

                    {/* Search Bar - Wide, Functional, Modern Glow */}
                    <form
                        style={styles.searchContainer}
                        onSubmit={handleSearchSubmit}
                    >
                        <div style={styles.searchWrapper}>
                            <input
                                name="search"
                                type="text"
                                placeholder="Search premium products, brands and boutiques..."
                                style={styles.searchInput}
                                defaultValue={new URLSearchParams(location.search).get('search') || ''}
                            />
                            <button type="submit" style={styles.searchBtn}>
                                <Search size={20} color="white" />
                            </button>
                        </div>
                    </form>

                    {/* Right Actions - Clean Myntra Style */}
                    <div style={styles.actionsContainer}>
                        {user ? (
                            <div style={styles.userGroup} ref={profileRef}>
                                <div
                                    style={styles.actionItem}
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                >
                                    <div style={styles.avatarCircle}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={styles.actionLabel}>Profile</span>
                                        <span style={styles.userName}>{user.username}</span>
                                    </div>
                                    <ChevronDown size={14} style={{
                                        color: 'var(--text-muted)',
                                        transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                                        transition: 'transform 0.2s'
                                    }} />
                                </div>

                                {isProfileDropdownOpen && (
                                    <div style={styles.profileDropdown} className="fade-in card">
                                        <div style={styles.dropdownHeader}>
                                            <div style={styles.dropdownUserTitle}>Welcome, {user.username}</div>
                                            <div style={styles.dropdownUserSub}>Membership: Gold Tier</div>
                                        </div>
                                        <div style={styles.dropdownSection}>
                                            {user.role?.toUpperCase() === 'ADMIN' && (
                                                <Link to="/admin" style={styles.dropdownItem}>Admin Console</Link>
                                            )}
                                            {user.role?.toUpperCase() === 'VENDOR' && (
                                                <Link to="/dashboard" style={styles.dropdownItem}>Merchant Dashboard</Link>
                                            )}
                                            <Link to="/buyer/dashboard" style={styles.dropdownItem}>Order Tracking</Link>
                                            <Link to="/profile" style={styles.dropdownItem}>Account Settings</Link>
                                            <div style={styles.dropdownDivider}></div>
                                            <button onClick={logout} style={styles.dropdownLogoutBtn}>Secure Sign Out</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" style={styles.loginCardBtn}>
                                <User size={18} />
                                <span>Sign In</span>
                            </Link>
                        )}

                        {/* AI Notifications */}
                        {user && (
                            <div style={styles.userGroup} ref={notifRef}>
                                <div style={styles.actionItem} onClick={() => setIsNotifOpen(!isNotifOpen)}>
                                    <div style={styles.iconWrapper}>
                                        <Bell size={22} color="white" />
                                        {notifications.length > 0 && <span style={styles.badge}>{notifications.length}</span>}
                                    </div>
                                    <div style={{ display: 'none' }}>Notification</div>
                                </div>

                                {isNotifOpen && (
                                    <div style={styles.notifDropdown} className="fade-in card">
                                        <div style={styles.dropdownHeader}>
                                            <div style={styles.dropdownUserTitle}>Notifications</div>
                                            <div style={styles.dropdownUserSub}>AI-Powered personalized alerts</div>
                                        </div>
                                        <div style={styles.notifScrollArea}>
                                            {notifications.length > 0 ? (
                                                notifications.map(n => (
                                                    <div key={n.id} style={styles.notifItem} onClick={() => {
                                                        if (n.productId) navigate(`/?search=${n.productId}`);
                                                        setIsNotifOpen(false);
                                                    }}>
                                                        <div style={styles.notifIconBox}>
                                                            <Zap size={14} color="var(--brand-primary)" />
                                                        </div>
                                                        <div style={styles.notifBody}>
                                                            <div style={styles.notifTitle}>{n.title}</div>
                                                            <div style={styles.notifMsg}>{n.message}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={styles.emptyNotif}>
                                                    All caught up! ✨
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <Link to="/cart" style={styles.actionItem}>
                            <div style={styles.iconWrapper}>
                                <ShoppingBag size={22} color="white" />
                                {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={styles.actionLabel}>Luxury</span>
                                <span style={styles.actionText}>Bag</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tier 2: Categories */}
            <nav style={styles.bottomNav}>
                <div style={styles.contentContainer}>
                    <ul style={styles.navLinks}>
                        {allCategories.map((cat, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => {
                                        if (setActiveCategory) setActiveCategory(cat);
                                        if (location.pathname !== '/') navigate('/');
                                    }}
                                    style={{
                                        ...styles.navLinkBtn,
                                        fontWeight: activeCategory === cat ? 700 : 500,
                                        color: activeCategory === cat ? '#2874f0' : '#212121'
                                    }}>
                                    {cat}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </header>
    );
};

const styles = {
    header: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--bg-header)',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
    },
    topSection: {
        height: '72px',
        display: 'flex',
        alignItems: 'center',
    },
    contentContainer: {
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
    },
    logoContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textDecoration: 'none',
        transition: 'opacity 0.2s',
    },
    logoText: {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '24px',
        fontWeight: 800,
        color: '#ffffff',
        letterSpacing: '1px',
    },
    logoTagline: {
        fontSize: '10px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginTop: '-4px',
    },
    searchContainer: {
        flex: 1,
        maxWidth: '700px',
        margin: '0 40px',
    },
    searchWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-md)',
        padding: '2px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        transition: 'all 0.3s ease',
    },
    searchInput: {
        width: '100%',
        padding: '10px 16px',
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '14px',
        color: '#ffffff',
        outline: 'none',
    },
    searchBtn: {
        backgroundColor: 'var(--brand-primary)',
        borderRadius: 'var(--radius-sm)',
        width: '40px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: 'none',
        margin: '2px',
    },
    actionsContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
    },
    actionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#ffffff',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'opacity 0.2s',
    },
    actionLabel: {
        fontSize: '10px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    actionText: {
        fontSize: '15px',
        fontWeight: 600,
        color: '#ffffff',
    },
    userName: {
        fontSize: '14px',
        fontWeight: 700,
        color: '#ffffff',
    },
    avatarCircle: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '14px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    loginCardBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 20px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '14px',
        textDecoration: 'none',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.2s',
    },
    iconWrapper: {
        position: 'relative',
        display: 'flex',
    },
    badge: {
        position: 'absolute',
        top: '-12px',
        right: '-12px',
        backgroundColor: 'var(--brand-secondary)',
        color: '#0f172a',
        fontSize: '11px',
        fontWeight: 800,
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: '2px solid var(--bg-header)',
    },
    userGroup: {
        position: 'relative',
    },
    profileDropdown: {
        position: 'absolute',
        top: 'calc(100% + 15px)',
        right: '0',
        minWidth: '240px',
        padding: '0',
        zIndex: 100,
    },
    dropdownHeader: {
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-light)',
        backgroundColor: '#f8fafc',
    },
    dropdownUserTitle: {
        fontWeight: 700,
        fontSize: '14px',
        color: 'var(--text-main)',
    },
    dropdownUserSub: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginTop: '2px',
    },
    dropdownSection: {
        padding: '8px 0',
    },
    dropdownItem: {
        display: 'block',
        padding: '10px 20px',
        fontSize: '14px',
        color: 'var(--text-main)',
        textDecoration: 'none',
        transition: 'background-color 0.2s',
    },
    dropdownDivider: {
        height: '1px',
        backgroundColor: 'var(--border-light)',
        margin: '8px 0',
    },
    dropdownLogoutBtn: {
        width: '100%',
        textAlign: 'left',
        padding: '10px 20px',
        backgroundColor: 'transparent',
        border: 'none',
        color: 'var(--brand-danger)',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '14px',
    },
    notifDropdown: {
        position: 'absolute',
        top: 'calc(100% + 15px)',
        right: '-60px',
        width: '320px',
        padding: '0',
        zIndex: 100,
    },
    notifScrollArea: {
        maxHeight: '400px',
        overflowY: 'auto',
    },
    notifItem: {
        display: 'flex',
        gap: '12px',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-light)',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    notifIconBox: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    notifBody: {
        flex: 1,
    },
    notifTitle: {
        fontSize: '13px',
        fontWeight: 700,
        color: 'var(--text-main)',
        marginBottom: '2px',
    },
    notifMsg: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        lineHeight: '1.4',
    },
    emptyNotif: {
        padding: '32px 20px',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-muted)',
    },
    bottomNav: {
        backgroundColor: '#ffffff',
        height: '42px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
    },
    navLinks: {
        listStyle: 'none',
        display: 'flex',
        gap: '32px',
        margin: 0,
        padding: 0,
        width: '101%',
    },
    navLinkBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '13px',
        cursor: 'pointer',
        padding: '8px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        transition: 'all 0.2s',
    }
};

export default Header;
