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
    getProducts: async (category = null) => {
        const url = category ? `${API_BASE_URL}/products/?category=${encodeURIComponent(category)}` : `${API_BASE_URL}/products/`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    searchProducts: async (query) => {
        const response = await fetch(`${API_BASE_URL}/products/search/?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
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

    editVendorProduct: async (productId, productData) => {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error('Failed to update product');
        return response.json();
    },

    deleteVendorProduct: async (productId) => {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete product');
        return response.json();
    },

    bulkUploadProducts: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        // Remove Content-Type so browser sets it with boundaries for FormData
        const headers = getAuthHeaders();
        delete headers['Content-Type'];

        const response = await fetch(`${API_BASE_URL}/products/bulk/`, {
            method: 'POST',
            headers: headers,
            body: formData
        });
        if (!response.ok) throw new Error('Bulk upload failed');
        return response.json();
    },

    getVendorAnalytics: async () => {
        const response = await fetch(`${API_BASE_URL}/vendors/analytics/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch vendor analytics');
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

    placeOrder: async (orderData) => {
        const response = await fetch(`${API_BASE_URL}/orders/place/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData)
        });
        if (!response.ok) {
            let detail = 'Failed to place order';
            try {
                const errBody = await response.json();
                detail = errBody.detail || errBody.message || detail;
            } catch { }
            throw new Error(detail);
        }
        return response.json();
    },

    getVendorOrders: async () => {
        const response = await fetch(`${API_BASE_URL}/orders/vendor/my-shop-orders/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch vendor orders');
        return response.json();
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update order status');
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
    },

    // ---- ADMIN ----
    // Admin users list (Optional additional methods for admin)
    getAdminUsers: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/users/`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch admin users');
        return response.json();
    },

    // Create new admin account
    createAdmin: async (adminData) => {
        const response = await fetch(`${API_BASE_URL}/admin/create-admin/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(adminData)
        });
        if (!response.ok) throw new Error('Failed to create admin account');
        return response.json();
    },

    getAdminBuyers: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/buyers/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch admin buyers');
        return response.json();
    },

    getAdminVendors: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/vendors/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch admin vendors');
        return response.json();
    },

    getAdminTransactions: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/transactions/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch admin transactions');
        return response.json();
    },

    updateUserStatus: async (username, status) => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${username}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update user status');
        return response.json();
    },

    approveVendor: async (username, approved) => {
        const response = await fetch(`${API_BASE_URL}/admin/vendors/${username}/approve`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ approved })
        });
        if (!response.ok) throw new Error('Failed to update vendor approval');
        return response.json();
    },

    refundOrder: async (orderId) => {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/refund`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to refund order');
        return response.json();
    },

    disputeOrder: async (orderId) => {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/dispute`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to dispute order');
        return response.json();
    },

    getAdminAnalytics: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/analytics/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return response.json();
    },

    getPlatformConfig: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/config/`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch config');
        return response.json();
    },

    updatePlatformConfig: async (configData) => {
        const response = await fetch(`${API_BASE_URL}/admin/config/`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(configData)
        });
        if (!response.ok) throw new Error('Failed to update config');
        return response.json();
    },

    // ---- CATEGORIES ----
    getCategories: async () => {
        const response = await fetch(`${API_BASE_URL}/categories/`);
        if (!response.ok) return [];
        return response.json();
    },

    createCategory: async (categoryData) => {
        const response = await fetch(`${API_BASE_URL}/categories/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) throw new Error('Failed to create category');
        return response.json();
    },

    deleteCategory: async (categoryId) => {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete category');
        return response.json();
    },

    // ---- AI & ACTIVITY TRACKING ----
    trackActivity: async (type, value) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/track/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ type, value })
            });
            if (!response.ok) return null;
            return response.json();
        } catch (e) {
            console.error("Tracking error", e);
            return null;
        }
    },

    getAIRecommendations: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/recommendations/`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) return [];
            return response.json();
        } catch (e) {
            console.error("Recommendation error", e);
            return [];
        }
    },

    getNotifications: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/notifications/`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) return [];
            return response.json();
        } catch (e) {
            console.error("Notification error", e);
            return [];
        }
    }
};
