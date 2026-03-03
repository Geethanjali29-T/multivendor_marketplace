import os
import dns.resolver
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Use Google DNS to bypass local ISP / Windows DNS resolution issues to MongoDB Atlas
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8']

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Enable CORS for all domains on all routes explicitly
CORS(app, resources={r"/*": {"origins": "*"}})

# Retrieve your MongoDB Atlas connection string from environment variables
MONGO_URI = os.environ.get("MONGO_URI")

import certifi
import mongomock

# Create a new client and connect to the server
try:
    client = MongoClient(
        MONGO_URI, 
        server_api=ServerApi('1'),
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=3000 # Short timeout so it falls back quickly
    )
    # Send a ping to confirm a successful connection
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
    db = client['marketplace_flask_db']
    collection = db['test_collection']
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    print("FALLING BACK TO IN-MEMORY MONGOMOCK DATABASE...")
    client = mongomock.MongoClient()
    db = client['marketplace_flask_db']
    collection = db['test_collection']

@app.route("/", methods=["GET"])
def index():
    """Health check endpoint."""
    if client:
        return jsonify({"status": "success", "message": "Flask app running and connected to MongoDB Atlas!"}), 200
    return jsonify({"status": "warning", "message": "Flask app running, but NOT connected to MongoDB Atlas."}), 200

# ==========================================
# DATABASE SEEDING
# ==========================================
def seed_database():
    if db is None: return
    users_coll = db['users']
    products_coll = db['products']
    vendors_coll = db['vendors']

    # We will wipe and reseed if the user count is very small, to ensure the new rich data is applied
    if users_coll.count_documents({}) <= 3:
        print("Seeding database with rich dynamic data...")
        users_coll.delete_many({})
        vendors_coll.delete_many({})
        products_coll.delete_many({})

        # create users
        users_coll.insert_many([
            {"username": "admin", "password": "password", "role": "admin", "email": "admin@example.com"},
            {"username": "vendor1", "password": "password", "role": "vendor", "email": "vendor@example.com"},
            {"username": "buyer1", "password": "password", "role": "buyer", "email": "buyer@example.com"}
        ])
        
        # create vendors (Realistic Multi-Vendor Marketplace Partners)
        vendors_coll.insert_many([
            {"vendor_id": "v_edu_1", "name": "YES Germany Delhi", "category": "Education", "rating": 4.8, "location": "New Delhi", "description": "Premier German Education Consultant. Providing German Language Classes."},
            {"vendor_id": "v_health_1", "name": "Apollo Health & Grocery", "category": "Healthcare", "rating": 4.6, "location": "Green Park", "description": "Verified healthcare products and premium daily groceries."},
            {"vendor_id": "v_auto_1", "name": "Speedy Wheels Service", "category": "Vehicle Services", "rating": 4.7, "location": "Noida", "description": "Expert vehicle servicing and specialized rentals for travelers."},
            {"vendor_id": "v_tech_1", "name": "Tech Haven", "category": "Electronics", "rating": 4.9, "location": "Cyber City", "description": "Latest gadgets, laptops, and smart home devices."},
            {"vendor_id": "v_food_1", "name": "Fresh Mart", "category": "Grocery", "rating": 4.5, "location": "South Extension", "description": "Organic produce and daily essentials delivered fast."},
            {"vendor_id": "v_fashion_1", "name": "Urban Style Boutique", "category": "Fashion", "rating": 4.8, "location": "Connaught Place", "description": "Trendy apparel for men and women."},
            {"vendor_id": "v_home_1", "name": "Cozy Home Decor", "category": "Home Goods", "rating": 4.7, "location": "Gurgaon", "description": "Premium furniture and interior decorations."},
            {"vendor_id": "v_book_1", "name": "The Reading Nook", "category": "Books", "rating": 4.9, "location": "Hauz Khas", "description": "Bestsellers, academic books, and rare finds."}
        ])
        
        # create products
        products_coll.insert_many([
            # Education
            {"product_id": "p1", "vendor_id": "v_edu_1", "name": "A1 German Language Course", "price": 149.99, "stock": 50, "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400"},
            {"product_id": "p2", "vendor_id": "v_edu_1", "name": "University Admissions Counseling", "price": 299.99, "stock": 20, "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400"},
            
            # Healthcare
            {"product_id": "p3", "vendor_id": "v_health_1", "name": "Premium First Aid Kit", "price": 45.00, "stock": 200, "image": "https://images.unsplash.com/photo-1584308666744-24d5e478ce13?w=400"},
            {"product_id": "p4", "vendor_id": "v_health_1", "name": "Organic Multivitamins", "price": 24.50, "stock": 150, "image": "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=400"},
            
            # Auto
            {"product_id": "p5", "vendor_id": "v_auto_1", "name": "Full Synthetic Oil Change", "price": 89.99, "stock": 100, "image": "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400"},
            
            # Tech
            {"product_id": "p6", "vendor_id": "v_tech_1", "name": "Mechanical Keyboard Pro", "price": 129.99, "stock": 45, "image": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400"},
            {"product_id": "p7", "vendor_id": "v_tech_1", "name": "Noise Cancelling Headphones", "price": 199.99, "stock": 30, "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"},
            
            # Food
            {"product_id": "p8", "vendor_id": "v_food_1", "name": "Farm Fresh Produce Box", "price": 34.99, "stock": 80, "image": "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400"},
            
            # Fashion
            {"product_id": "p9", "vendor_id": "v_fashion_1", "name": "Classic Denim Jacket", "price": 59.99, "stock": 40, "image": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400"},
            {"product_id": "p10", "vendor_id": "v_fashion_1", "name": "Summer Floral Dress", "price": 45.00, "stock": 60, "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400"},
            
            # Home Goods
            {"product_id": "p11", "vendor_id": "v_home_1", "name": "Ergonomic Office Chair", "price": 149.99, "stock": 25, "image": "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400"},
            {"product_id": "p12", "vendor_id": "v_home_1", "name": "Ceramic Table Lamp", "price": 34.50, "stock": 50, "image": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400"},
            
            # Books
            {"product_id": "p13", "vendor_id": "v_book_1", "name": "The Great Gatsby - Hardcover", "price": 18.99, "stock": 100, "image": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"},
            {"product_id": "p14", "vendor_id": "v_book_1", "name": "Introduction to Algorithms", "price": 75.00, "stock": 15, "image": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400"}
        ])
        print("Database seeded completely with new dynamic data.")

if client:
    seed_database()

import jwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

SECRET_KEY = os.environ.get('SECRET_KEY', 'my_tradelink_super_secret_jwt_key')

def get_current_user():
    """Helper to extract user from headers auth token."""
    # First check if it's a Firebase Google auth header
    email = request.headers.get("X-User-Email")
    if email:
        return db['users'].find_one({"email": email})
        
    # Then check for standard JWT Token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return db['users'].find_one({"email": data['email']})
        except:
            return None
    return None

def convert_id(doc):
    """Helper to convert MongoDB _id to string for JSON serialization."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@app.route("/api/users/register/", methods=["POST"])
def register_user():
    """Registration endpoint for BOTH JWT and Firebase Sync."""
    data = request.json or {}
    email = data.get("email")
    username = data.get("username")
    uid = data.get("uid") # Only present if Google Firebase Login
    
    # If already synced or registered, just return ok (prevents duplicate error when Google syncing)
    if db['users'].find_one({"email": email}):
        return jsonify({"message": "User already registered or synced"}), 200
        
    role = data.get("role", "buyer").upper()
    if role not in ["BUYER", "VENDOR", "ADMIN"]:
        role = "BUYER"
        
    user_doc = {
        "email": email,
        "username": username,
        "role": role,
    }
    
    # If it's a manual JWT sign up, hash the password
    if not uid and data.get("password"):
        user_doc["password"] = generate_password_hash(data.get("password"))
    
    # If it's a Google synched event, assign UID
    if uid:
        user_doc["uid"] = uid

    db['users'].insert_one(user_doc)
    return jsonify({"message": "User registered successfully!"}), 201

@app.route("/api/users/login/", methods=["POST"])
def login_user():
    """Manual standard Email & Password JWT Login."""
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"detail": "Please provide email and password"}), 400
        
    user = db['users'].find_one({"email": email})
    if not user or "password" not in user or not check_password_hash(user["password"], password):
        return jsonify({"detail": "Invalid credentials"}), 401
        
    # Generate JWT Token for manual users
    token = jwt.encode({
        "email": email,
        "role": user.get("role", "BUYER"),
        "exp": datetime.utcnow() + timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")
    
    user = convert_id(user)
    user.pop("password", None)
    
    return jsonify({
        "token": token,
        "user": user
    }), 200

@app.route("/api/users/profile/<email>", methods=["GET"])
def profile_mock(email):
    """Profile endpoint based on Firebase email or JWT decoded email."""
    user = db['users'].find_one({"email": email})
    if not user:
        return jsonify({"detail": "Not found"}), 404
    
    user = convert_id(user)
    user.pop("password", None)
    return jsonify(user), 200

@app.route("/api/users/profile/", methods=["PUT"])
def update_profile():
    """Update basic profile details."""
    user = get_current_user()
    if not user:
         return jsonify({"detail": "Unauthorized"}), 401
         
    data = request.json or {}
    updated_data = {}
    if "username" in data:
        updated_data["username"] = data["username"]
        
    db['users'].update_one(
        {"email": user["email"]},
        {"$set": updated_data}
    )
    return jsonify({"message": "Profile updated successfully"}), 200

@app.route("/api/vendors/my-shop/", methods=["GET"])
def get_my_shop():
    """Get the shop details for the logged-in vendor."""
    user = get_current_user()
    if not user or user.get("role") != "VENDOR":
         return jsonify({"detail": "Unauthorized"}), 401
         
    vendor = db['vendors'].find_one({"username": user["username"]})
    if not vendor:
        return jsonify({"detail": "Not found"}), 404
        
    return jsonify(convert_id(vendor)), 200

@app.route("/api/products/", methods=["GET"])
def products_mock():
    """Get products from MongoDB."""
    products = list(db['products'].find({}))
    return jsonify([convert_id(p) for p in products]), 200

@app.route("/api/vendors/", methods=["GET"])
def vendors_mock():
    """Get vendors from MongoDB."""
    vendors = list(db['vendors'].find({}))
    return jsonify([convert_id(v) for v in vendors]), 200

@app.route("/api/orders/my-orders/", methods=["GET"])
def buyer_orders_mock():
    """Get orders for the logged-in buyer."""
    user = get_current_user()
    if not user:
         return jsonify({"detail": "Unauthorized"}), 401
         
    orders = list(db['orders'].find({"buyer_username": user["username"]}))
    return jsonify([convert_id(o) for o in orders]), 200

@app.route("/api/orders/vendor/my-shop-orders/", methods=["GET"])
def vendor_orders_mock():
    """Get orders for the logged-in vendor."""
    user = get_current_user()
    if not user or user.get("role") != "vendor":
         return jsonify({"detail": "Unauthorized"}), 401
         
    orders = list(db['orders'].find({"vendor_username": user["username"]}))
    return jsonify([convert_id(o) for o in orders]), 200

@app.route("/api/chat/", methods=["POST"])
def chat_mock():
    """Basic mock response for the Chatbot."""
    data = request.json or {}
    msg = data.get("message", "").lower()
    
    response = "I'm a simple assistant. Ask me about our vendors, products, or your orders!"
    if "vendor" in msg:
        response = "We have many top-tier vendors including Tech Haven and Fresh Farms! Check out the homepage to see them."
    elif "product" in msg or "buy" in msg:
        response = "You can browse products from our featured partners on their respective store pages."
    elif "order" in msg:
        response = "You can view your most recent orders by navigating to your Dashboard if you are logged in."
        
    return jsonify({"response": response}), 200

# ==========================================
# VENDOR SETUP ENDPOINTS
# ==========================================

@app.route("/api/vendors/setup/", methods=["POST"])
def setup_vendor_profile():
    """Endpoint for a vendor to create/update their public shop profile."""
    user = get_current_user()
    if not user or user.get("role") != "VENDOR":
         return jsonify({"detail": "Unauthorized. Must be a vendor."}), 401
         
    data = request.json or {}
    
    # Store vendor details using their username to link auth with shop
    vendor_doc = {
        "vendor_id": f"v_{user['username']}",  # Unique ID for the URL/System
        "username": user['username'],
        "name": data.get("name", f"{user['username']}'s Shop"),
        "category": data.get("category", "General"),
        "location": data.get("location", "Online"),
        "phone": data.get("phone", ""),
        "gstin": data.get("gstin", ""),
        "website": data.get("website", ""),
        "description": data.get("description", ""),
        "rating": 5.0 # New shops start at 5 stars!
    }
    
    # Update if exists, otherwise insert
    db['vendors'].update_one(
        {"username": user['username']},
        {"$set": vendor_doc},
        upsert=True
    )
    
    return jsonify({"message": "Shop profile created successfully!"}), 201

@app.route("/api/products/add/", methods=["POST"])
def add_product():
    """Endpoint for a vendor to add a new product to their shop."""
    user = get_current_user()
    if not user or user.get("role") != "VENDOR":
         return jsonify({"detail": "Unauthorized. Must be a vendor."}), 401
         
    # Make sure vendor profile actually exists
    vendor = db['vendors'].find_one({"username": user['username']})
    if not vendor:
        return jsonify({"detail": "Please create your shop profile first."}), 400
        
    data = request.json or {}
    
    product_doc = {
        "vendor_id": vendor["vendor_id"],
        "vendor_username": user["username"],
        "name": data.get("name", "New Product"),
        "price": float(data.get("price", 0.0)),
        "stock": int(data.get("stock", 0)),
        "image": data.get("image", "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"),
        "description": data.get("description", "")
    }
    
    db['products'].insert_one(product_doc)
    return jsonify({"message": "Product added successfully!"}), 201

# ==========================================
# EXAMPLES (Original testing endpoints)
# ==========================================

@app.route("/items", methods=["POST"])
def add_item():
    """Endpoint to insert an item into MongoDB."""
    if not collection:
        return jsonify({"error": "Database not connected"}), 500
        
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    try:
        result = collection.insert_one(data)
        return jsonify({
            "message": "Data inserted successfully", 
            "id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/items", methods=["GET"])
def get_items():
    """Endpoint to fetch all items from MongoDB."""
    if not collection:
        return jsonify({"error": "Database not connected"}), 500
        
    try:
        items = list(collection.find({}, {'_id': 0})) 
        return jsonify({"items": items}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Run the Flask app on port 5000
    app.run(debug=True, port=5000)
