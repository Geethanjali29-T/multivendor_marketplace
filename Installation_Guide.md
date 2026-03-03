# TradeLink Installation & Setup Guide

Welcome to the TradeLink local commerce and multi-vendor marketplace platform! This guide covers everything you need to run the application locally on your machine.

The application is structured into two main parts:
1. **Frontend:** Built with React JS and Vite (`/frontend`)
2. **Backend:** Built with Python and Flask targeting MongoDB (`/flask_backend`)

---

## Prerequisites
Before you begin, ensure you have the following installed on your machine:

- **Node.js:** v16+ (Recommended to have npm installed with this)
- **Python:** 3.8+ 
- **MongoDB Database:** (A connection string to MongoDB URI via Atlas, or a local MongoDB running)

---

## 1. Backend Setup (Flask & Python)

The robust API engine powers user authentication, cart management, vendor catalogs, and data serving.

### Step 1: Navigate to backend folder
Open your terminal (PowerShell or Command Prompt) and set up the Python environment:
```powershell
# Go into the root folder first, then into backend
cd C:\multivendor_marketplace\flask_backend
```

### Step 2: Set up a Virtual Environment
It is recommended to use a virtual environment so the python dependencies are kept isolated.
```powershell
# Create it
python -m venv venv

# Activate it (Windows)
.\venv\Scripts\activate
```
*(You should see `(venv)` appear at the beginning of your terminal line).*

### Step 3: Install Requirements
Install all necessary Python modules defined in our updated requirements:
```powershell
pip install -r requirements.txt
```
*Note: This brings in `Flask`, `PyJWT`, `pymongo`, `Werkzeug`, `python-dotenv`, and `flask-cors`.*

### Step 4: Environment Variables
Create a file named `.env` in the `flask_backend` folder, and populate your secure keys:
```text
MONGO_URI="your_mongodb_connection_string"
SECRET_KEY="replace_with_a_secure_random_key_for_jwts"
```
*(If you do not have a MongoDB URI yet, head over to MongoDB Atlas online and get your free connection string).*

### Step 5: Start the Server
With the virtual environment activated, run:
```powershell
python app.py
```
*The Flask API is now running on `http://localhost:5000`! Leave this terminal window running.*

---

## 2. Frontend Setup (React & Vite)

The responsive user interface that vendors, admins, and buyers interact with.

### Step 1: Open a NEW Terminal
Leave the backend terminal running, and open a secondary terminal window.

### Step 2: Navigate to frontend folder
```powershell
cd C:\multivendor_marketplace\frontend
```

### Step 3: Install Dependencies
Download and install all required Node modules:
```powershell
npm install
```

### Step 4: Environment Variables (Optional)
If you are using Firebase for Google Authentication, ensure your `.env` contains:
```text
VITE_FIREBASE_API_KEY="your_api_key_here"
VITE_FIREBASE_AUTH_DOMAIN="your_domain_here"
VITE_FIREBASE_PROJECT_ID="your_project_id"
```
*(A `.env` config already exists with test configuration variables from your setup).*

### Step 5: Start the Frontend App
Run the Vite development server:
```powershell
npm run dev
```

*The frontend application is now active at `http://localhost:5173`!*

---

## 3. Usage & Access

1. Open your browser and navigate to `http://localhost:5173`
2. You should see the custom Loading Screen followed by the main TradeLink Ecosystem Dashboard.
3. You can register manually or via Google Auth.
4. Try registering a user with the role `vendor` to unlock the "Shop Setup" and dashboard features!

---

**Troubleshooting:**
- **"Connection Refused" when logging in:** Ensure your Flask backend is running on port 5000.
- **Port 5000 is occupied (Windows):** Run `netstat -ano | findstr :5000` and kill the PID, or change the backend port.
- **Data not saving / Endless Loading:** Check that your MongoDB connection string inside the `flask_backend/.env` is valid and that your network/IP is whitelisted in MongoDB Atlas.
