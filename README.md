# TradeLink: Local Commerce & Multi-Vendor Marketplace

TradeLink is a premium, mobile-responsive multi-vendor marketplace platform designed to bridge local businesses with global digital standards. Built with a modern tech stack (React & Flask), it features a dynamic storefront, personalized AI assistance, and robust management dashboards for Admins, Vendors, and Buyers.

---

## 🚀 Quick Start Guide

This guide will help you get the entire ecosystem running on your local machine.

### 📋 Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.9+)
- **MongoDB** (Local instance or MongoDB Atlas Cloud URI)

---

## 🛠️ 1. Backend Setup (Flask API)

The backend handles authentication, product catalogs, order processing, and communication.

1. **Navigate to the backend directory:**
   ```bash
   cd flask_backend
   ```

2. **Set up a Virtual Environment:**
   ```bash
   python -m venv venv
   # Activate on Windows:
   .\venv\Scripts\activate
   # Activate on macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in the `flask_backend/` folder:
   ```env
   MONGO_URI="your_mongodb_connection_string"
   SECRET_KEY="your_secret_jwt_key"
   DEBUG=True
   ```

5. **Seed the Database (Optional but Recommended):**
   To populate the store with professional categories, products, and test accounts:
   ```bash
   python seed_pro.py
   ```

6. **Start the Server:**
   ```bash
   python app.py
   ```
   *The API will be live at `http://localhost:5000`.*

---

## 💻 2. Frontend Setup (React Storefront)

The frontend is a high-performance React application powered by Vite.

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

---

## 🔐 3. Access & Demo Credentials

If you ran the `seed_pro.py` script, use these default accounts to explore the features:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `password` |
| **Vendor** | `vendor1` | `password` |
| **Buyer** | `buyer1` | `password` |

---

## ✨ Key Features

- **📱 Fully Mobile Responsive**: Optimized for every device, from mobile to desktop.
- **🤖 AI Chatbot Integration**: Real-time customer support powered by interactive AI.
- **🏬 Vendor Storefronts**: Personalized shop pages with custom category management.
- **🛍️ Buyer Experience**: Advanced search, flexible cart, and intuitive checkout flow.
- **🛡️ Secure Dashboards**: Dedicated roles for Admin, Vendor, and Buyer with protected routes.
- **💳 Multi-Payment Support**: Integrated with Test Mode for Razorpay.

---

## 📂 Project Structure

- `/frontend`: React application, components, and styles.
- `/flask_backend`: Flask API, database models, and seeding logic.
- `Installation_Guide.md`: More detailed installation notes.
- `README.md`: This file!

---

## 💡 Troubleshooting

- **CORS Errors**: Ensure the Flask backend has `flask-cors` installed and configured correctly.
- **Empty Dashboards**: Verify that the backend is running and that you have seeded the data using `seed_pro.py`.
- **Port Conflicts**: If port 5173 or 5000 is taken, Vite/Flask will suggest an alternative; update the API base URL in `frontend/src/services/api.js` if necessary.
