import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, Store, ShieldCheck, HeartPulse, GraduationCap, Laptop, Car } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside style={styles.sidebar}>
            <div style={styles.logoContainer}>
                <div style={styles.logoIcon}><Zap size={20} color="white" /></div>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 700 }}>TradeLink</h2>
            </div>

            <div style={styles.navSection}>
                <p style={styles.sectionTitle}>EXPLORE CATEGORIES</p>
                <nav style={styles.nav}>
                    <NavLink to="/" style={({ isActive }) => isActive ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem} end>
                        All
                    </NavLink>
                    <NavLink to="/category/electronics" style={styles.navItem}>Electronics</NavLink>
                    <NavLink to="/category/rentals" style={styles.navItem}>Rentals</NavLink>
                    <NavLink to="/category/vehicle-services" style={styles.navItem}>Vehicle Services</NavLink>
                    <NavLink to="/category/healthcare" style={styles.navItem}>Healthcare</NavLink>
                    <NavLink to="/category/grocery" style={styles.navItem}>Grocery</NavLink>
                    <NavLink to="/category/education" style={styles.navItem}>Education</NavLink>
                </nav>
            </div>

            <div style={styles.promoCard}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.05em' }}>PROMOTED</p>
                <h4 style={{ fontFamily: 'Outfit', fontWeight: 600, margin: '8px 0', fontSize: '1.1rem' }}>Join TradeLink Business 2026</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>List your services and scale your local business globally.</p>
                <button style={styles.promoButton}>Learn More</button>
            </div>
        </aside>
    );
};

const styles = {
    sidebar: {
        width: 'var(--sidebar-width)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'var(--bg-color)',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px',
        paddingLeft: '12px',
    },
    logoIcon: {
        width: '32px',
        height: '32px',
        backgroundColor: 'var(--brand-primary)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navSection: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: '0.7rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: '0.05em',
        marginBottom: '16px',
        paddingLeft: '12px',
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    navItem: {
        padding: '12px 16px',
        borderRadius: '12px',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        fontWeight: 500,
        transition: 'all 0.2s',
    },
    navItemActive: {
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
    },
    promoCard: {
        backgroundColor: 'var(--brand-secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 20px',
        color: 'white',
        marginTop: 'auto',
    },
    promoButton: {
        width: '100%',
        padding: '10px 0',
        backgroundColor: 'white',
        color: 'var(--brand-secondary)',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '0.875rem',
    }
};

export default Sidebar;
