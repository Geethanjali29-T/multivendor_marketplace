import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
    }

    if (!user) {
        if (allowedRoles && allowedRoles.includes('admin')) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && (!user.role || !allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase()))) {
        // user is logged in but doesn't have the right role
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
