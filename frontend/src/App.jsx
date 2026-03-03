import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import PartnersPage from './pages/PartnersPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import CartPage from './pages/CartPage';
import AuthPages from './pages/AuthPages';
import VendorSetupPage from './pages/VendorSetupPage';
import ProfilePage from './pages/ProfilePage';
import ChatbotWidget from './components/ChatbotWidget';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import './index.css';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/signup';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPages />} />
        <Route path="/register" element={<AuthPages />} />
        <Route path="/signup" element={<AuthPages />} />
      </Routes>
    );
  }

  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="app-container">
      <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <div className="main-content">
        <main className="page-content">
          <Routes>
            <Route path="/" element={<PartnersPage activeCategory={activeCategory} />} />

            {/* Vendor Only Route */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/setup-shop" element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorSetupPage />
              </ProtectedRoute>
            } />

            {/* Admin Only Route */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            <Route path="/cart" element={<CartPage />} />
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
