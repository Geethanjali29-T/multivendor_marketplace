import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import PartnersPage from './pages/PartnersPage';
import VendorDashboard from './pages/VendorDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CartPage from './pages/CartPage';
import BuyerLogin from './pages/BuyerLogin';
import VendorLogin from './pages/VendorLogin';
import VendorSetupPage from './pages/VendorSetupPage';
import ProfilePage from './pages/ProfilePage';
import ShopPage from './pages/ShopPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import AdminLogin from './pages/AdminLogin';
import ChatbotWidget from './components/ChatbotWidget';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import './index.css';

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/buyer/login' ||
    location.pathname === '/vendor/login' ||
    location.pathname === '/admin/login';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Navigate to="/buyer/login" />} />
        <Route path="/register" element={<Navigate to="/buyer/login" />} />
        <Route path="/buyer/login" element={<BuyerLogin />} />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/admin/login" element={
          user?.role?.toUpperCase() === 'ADMIN' ? <Navigate to="/admin" /> : <AdminLogin />
        } />
      </Routes>
    );
  }

  const [activeCategory, setActiveCategory] = useState('All');

  // Admin route should bypass the public layout
  if (location.pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <div className="main-content">
        <main className="page-content">
          <Routes>
            <Route path="/" element={<PartnersPage activeCategory={activeCategory} setActiveCategory={setActiveCategory} />} />
            <Route path="/shop/:username" element={<ShopPage />} />

            {/* Vendor Specific Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['vendor', 'VENDOR']}>
                <VendorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/setup-shop" element={
              <ProtectedRoute allowedRoles={['vendor', 'VENDOR']}>
                <VendorSetupPage />
              </ProtectedRoute>
            } />

            {/* Buyer Specific Routes */}
            <Route path="/buyer/dashboard" element={
              <ProtectedRoute allowedRoles={['buyer', 'BUYER']}>
                <BuyerDashboard />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/product" element={<ProductDetailsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
