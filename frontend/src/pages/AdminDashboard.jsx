import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ products: 0, vendors: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const products = await api.getProducts();
                const vendors = await api.getVendors();
                setStats({ products: products.length, vendors: vendors.length });
            } catch (err) {
                console.error("Failed to load admin stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="admin-loading">Loading Admin Data...</div>;

    return (
        <div className="admin-dashboard-container">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">System Overview and Management</p>

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <h3>Total Products</h3>
                    <div className="stat-value">{stats.products}</div>
                </div>
                <div className="admin-stat-card">
                    <h3>Total Vendors</h3>
                    <div className="stat-value">{stats.vendors}</div>
                </div>
                <div className="admin-stat-card">
                    <h3>Active Users</h3>
                    <div className="stat-value">3 (Mocked)</div>
                </div>
            </div>

            <div className="admin-actions">
                <h2>Quick Actions</h2>
                <button className="admin-btn">Manage Users</button>
                <button className="admin-btn">Review Vendor Applications</button>
                <button className="admin-btn warning">System Settings</button>
            </div>
        </div>
    );
};

export default AdminDashboard;
