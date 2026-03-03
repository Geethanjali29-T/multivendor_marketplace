import { auth } from '../firebase';

const API_BASE_URL = 'http://localhost:5000/api';

// Utility for getting the auth token based on Firebase OR JWT
const getAuthHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };

    // 1. Check if Firebase Google Auth is Active
    const user = auth.currentUser;
    if (user && user.email) {
        headers['X-User-Email'] = user.email;
        return headers;
    }

    // 2. Fallback to LocalStorage JWT
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

export const api = {
    // ---- AUTHENTICATION ----

    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/users/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error('Invalid email or password');
        return response.json();
    },

    register: async (userData) => {
        // expected: {uid, email, username, role, password}
        const response = await fetch(`${API_BASE_URL}/users/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Registration failed');
        return response.json();
    },

    getUserProfileByEmail: async (email) => {
        const response = await fetch(`${API_BASE_URL}/users/profile/${email}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

    updateUserProfile: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/users/profile/`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    },

    // ---- PRODUCTS ----
    getProducts: async () => {
        const response = await fetch(`${API_BASE_URL}/products/`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    // ---- VENDORS (Partners) ----
    // Assuming a vendors list endpoint exists based on usual patterns 
    getVendors: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/vendors/`);
            if (!response.ok) return [];
            return response.json();
        } catch (e) {
            console.error("Vendor fetch error", e);
            return [];
        }
    },

    getMyShop: async () => {
        const response = await fetch(`${API_BASE_URL}/vendors/my-shop/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Shop not found');
        return response.json();
    },

    setupVendorProfile: async (shopData) => {
        const response = await fetch(`${API_BASE_URL}/vendors/setup/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(shopData)
        });
        if (!response.ok) throw new Error('Failed to create shop profile');
        return response.json();
    },

    addVendorProduct: async (productData) => {
        const response = await fetch(`${API_BASE_URL}/products/add/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to add product');
        }
        return response.json();
    },

    // ---- ORDERS ----
    getUserOrders: async () => {
        const response = await fetch(`${API_BASE_URL}/orders/my-orders/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch buyer orders');
        return response.json();
    },

    getVendorOrders: async () => {
        const response = await fetch(`${API_BASE_URL}/orders/vendor/my-shop-orders/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch vendor orders');
        return response.json();
    },

    // ---- CHATBOT ----
    sendChatMessage: async (message) => {
        const response = await fetch(`${API_BASE_URL}/chat/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    }
};
