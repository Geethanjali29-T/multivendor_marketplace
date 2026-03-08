import os
import random
from datetime import datetime
from bson.objectid import ObjectId
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables from .env file (local dev only; Vercel uses its own env vars)
load_dotenv()

app = Flask(__name__)

# Permissive CORS for local development and production
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "X-User-Email"]
}}, supports_credentials=True)

@app.before_request
def log_request_info():
    print(f"\n--- INCOMING REQUEST ---")
    print(f"Method: {request.method}")
    print(f"URL: {request.url}")
    print(f"Headers: {dict(request.headers)}")
    if request.is_json and request.content_length:
        try:
            # Only print if body is not too large
            if request.content_length < 10000:
                print(f"Body: {request.get_json(silent=True)}")
        except Exception as e:
            print(f"Could not parse JSON body: {e}")
    print(f"------------------------\n")

# MongoDB connection — use a longer timeout for Vercel cold starts
MONGO_URI = os.environ.get("MONGO_URI")

import certifi

# Lazy global connection reused across serverless invocations
_db = None

def get_db():
    """Return a persistent MongoDB connection, reconnecting if needed."""
    global _db
    if _db is not None:
        return _db
    try:
        client = MongoClient(
            MONGO_URI,
            server_api=ServerApi('1'),
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=15000,  # 15s — enough for cold starts
            connectTimeoutMS=15000,
            socketTimeoutMS=20000
        )
        client.admin.command('ping')
        print("Connected to MongoDB Atlas!")
        _db = client['marketplace_flask_db']
        return _db
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        raise RuntimeError(f"Database unavailable: {e}")

# Initialize connection (optional but recommended for health check)
try:
    get_db()
    print("DB ready.")
except Exception as e:
    print(f"Startup DB error (will retry per-request): {e}")

def get_coll(name):
    """Helper to get a collection, ensuring DB connection."""
    return get_db()[name]

@app.route("/", methods=["GET"])
def index():
    """Health check endpoint."""
    try:
        get_db().command('ping')
        return jsonify({"status": "ok", "message": "Flask connected to MongoDB!"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 503

# ==========================================
# DATABASE SEEDING
# ==========================================
def seed_database():
    try:
        db_conn = get_db()
    except Exception:
        return
        
    users_coll = db_conn['users']
    products_coll = db_conn['products']
    vendors_coll = db_conn['vendors']

    categories_coll = db_conn['categories']
    config_coll = db_conn['platform_config']

    # We will wipe and reseed if the user count is very small, to ensure the new rich data is applied
    if users_coll.count_documents({}) <= 3:
        print("Seeding database with rich dynamic data...")
        users_coll.delete_many({})
        vendors_coll.delete_many({})
        products_coll.delete_many({})
        categories_coll.delete_many({})
        
        # seeding configs
        if config_coll.count_documents({}) == 0:
            config_coll.insert_one({
                "reviews_enabled": True,
                "recommendations_enabled": True,
                "chatbot_api_key": "",
                "return_policy": "Default 7-day return policy for all items."
            })
            
        # seeding categories
        categories_coll.insert_many([
            {"category_id": "c_mobi", "name": "Mobiles", "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"},
            {"category_id": "c_fash", "name": "Fashion", "image_url": "https://images.unsplash.com/photo-1445205170230-053b830160b0?w=400"},
            {"category_id": "c_elec", "name": "Electronics", "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400"},
            {"category_id": "c_appl", "name": "Appliances", "image_url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400"},
            {"category_id": "c_home", "name": "Home & Kitchen", "image_url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400"},
            {"category_id": "c_beau", "name": "Beauty", "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=400"},
            {"category_id": "c_spor", "name": "Sports", "image_url": "https://images.unsplash.com/photo-1461896704190-321aa21a6564?w=400"},
            {"category_id": "c_toys", "name": "Toys", "image_url": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400"}
        ])

        # create users
        users_coll.insert_many([
            {"username": "admin", "password": "password", "role": "admin", "email": "admin@example.com"},
            {"username": "vendor1", "password": "password", "role": "vendor", "email": "vendor@example.com"},
            {"username": "buyer1", "password": "password", "role": "buyer", "email": "buyer@example.com"}
        ])
        
        # create vendors (Realistic Multi-Vendor Marketplace Partners)
        vendors_list = [
            {"vendor_id": "v_edu_1", "username": "vendor_edu", "name": "YES Germany Delhi", "shop_name": "YES Germany Delhi", "category": "Education", "rating": 4.8, "location": "New Delhi", "description": "Premier German Education Consultant. Providing German Language Classes.", "approved": True},
            {"vendor_id": "v_health_1", "username": "vendor_health", "name": "Apollo Health & Grocery", "shop_name": "Apollo Health & Grocery", "category": "Healthcare", "rating": 4.6, "location": "Green Park", "description": "Verified healthcare products and premium daily groceries.", "approved": True},
            {"vendor_id": "v_auto_1", "username": "vendor_auto", "name": "Speedy Wheels Service", "shop_name": "Speedy Wheels Service", "category": "Vehicle Services", "rating": 4.7, "location": "Noida", "description": "Expert vehicle servicing and specialized rentals for travelers.", "approved": True},
            {"vendor_id": "v_tech_1", "username": "vendor_tech", "name": "Tech Haven", "shop_name": "Tech Haven", "category": "Electronics", "rating": 4.9, "location": "Cyber City", "description": "Latest gadgets, laptops, and smart home devices.", "approved": True},
            {"vendor_id": "v_food_1", "username": "vendor_food", "name": "Fresh Mart", "shop_name": "Fresh Mart", "category": "Grocery", "rating": 4.5, "location": "South Extension", "description": "Organic produce and daily essentials delivered fast.", "approved": True},
            {"vendor_id": "v_fashion_1", "username": "vendor_fashion", "name": "Urban Style Boutique", "shop_name": "Urban Style Boutique", "category": "Fashion", "rating": 4.8, "location": "Connaught Place", "description": "Trendy apparel for men and women.", "approved": True},
            {"vendor_id": "v_home_1", "username": "vendor_home", "name": "Cozy Home Decor", "shop_name": "Cozy Home Decor", "category": "Home Goods", "rating": 4.7, "location": "Gurgaon", "description": "Premium furniture and interior decorations.", "approved": True},
            {"vendor_id": "v_book_1", "username": "vendor_book", "name": "The Reading Nook", "shop_name": "The Reading Nook", "category": "Books", "rating": 4.9, "location": "Hauz Khas", "description": "Bestsellers, academic books, and rare finds.", "approved": True}
        ]
        vendors_coll.insert_many(vendors_list)
        
        # create reviews list to be used for products
        def get_reviews(category):
            reviews = [
                {"user": "buyer1", "rating": 5, "comment": f"Excellent {category} product! Highly recommended.", "date": "2024-03-01"},
                {"user": "buyer2", "rating": 4, "comment": f"Good quality {category} item, but took a bit to arrive.", "date": "2024-03-02"}
            ]
            return reviews

        # create products
        products_list = [
            {"product_id": "p1", "vendor_id": "v_edu_1", "vendor_username": "vendor_edu", "vendor_name": "YES Germany Delhi", "name": "A1 German Language Course", "category": "Education", "price": 14999.99, "stock": 50, "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400", "rating": 4.8, "reviews": get_reviews("Education")},
            {"product_id": "p2", "vendor_id": "v_edu_1", "vendor_username": "vendor_edu", "vendor_name": "YES Germany Delhi", "name": "University Admissions Counseling", "category": "Education", "price": 29999.99, "stock": 20, "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400", "rating": 4.9, "reviews": get_reviews("Counseling")},
            {"product_id": "p3", "vendor_id": "v_health_1", "vendor_username": "vendor_health", "vendor_name": "Apollo Health & Grocery", "name": "Premium First Aid Kit", "category": "Healthcare", "price": 4500.00, "stock": 200, "image": "https://images.unsplash.com/photo-1584308666744-24d5e478ce13?w=400", "rating": 4.7, "reviews": get_reviews("Healthcare")},
            {"product_id": "p6", "vendor_id": "v_tech_1", "vendor_username": "vendor_tech", "vendor_name": "Tech Haven", "name": "Mechanical Keyboard Pro", "category": "Electronics", "price": 12900.99, "stock": 45, "image": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400", "rating": 4.9, "reviews": get_reviews("Tech")},
            {"product_id": "p9", "vendor_id": "v_fashion_1", "vendor_username": "vendor_fashion", "vendor_name": "Urban Style Boutique", "name": "Classic Denim Jacket", "category": "Fashion", "price": 5999.99, "stock": 40, "image": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400", "rating": 4.7, "reviews": get_reviews("Fashion")},
            {"product_id": "p11", "vendor_id": "v_home_1", "vendor_username": "vendor_home", "vendor_name": "Cozy Home Decor", "name": "Ergonomic Office Chair", "category": "Home & Kitchen", "price": 14900.99, "stock": 25, "image": "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400", "rating": 4.6, "reviews": get_reviews("Home")}
        ]
        products_coll.insert_many(products_list)
        print("Database seeded completely with unique dynamic data.")

seed_database()

import jwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

SECRET_KEY = os.environ.get('SECRET_KEY', 'my_tradelink_super_secret_jwt_key')

def get_current_user():
    """Helper to extract user from headers auth token."""
    # First check if it's a Firebase Google auth header
    email = request.headers.get("X-User-Email")
    users_coll = get_coll('users')
    if email:
        return users_coll.find_one({"email": email})
        
    # Then check for standard JWT Token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return users_coll.find_one({"email": data['email']})
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
    
    users_coll = get_coll('users')
    # If already synced or registered, just return ok (prevents duplicate error when Google syncing)
    if users_coll.find_one({"email": email}):
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

    users_coll.insert_one(user_doc)
    return jsonify({"message": "User registered successfully!"}), 201

@app.route("/api/users/login/", methods=["POST"])
def login_user():
    """Manual standard Email & Password JWT Login. Accepts email OR username."""
    data = request.json or {}
    identifier = data.get("email")  # Could be email or username
    password = data.get("password")
    
    if not identifier or not password:
        return jsonify({"detail": "Please provide email/username and password"}), 400
    
    users_coll = get_coll('users')
    # Try matching by email first, then by username
    user = users_coll.find_one({"email": identifier})
    if not user:
        user = users_coll.find_one({"username": identifier})
        
    if not user or "password" not in user or not check_password_hash(user["password"], password):
        return jsonify({"detail": "Invalid credentials"}), 401
        
    # Generate JWT Token
    token = jwt.encode({
        "email": user["email"],
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
    users_coll = get_coll('users')
    user = users_coll.find_one({"email": email})
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
    for field in ["username", "phone", "address", "addresses", "wishlist", "payment_methods"]:
        if field in data:
            updated_data[field] = data[field]
        
    users_coll = get_coll('users')
    users_coll.update_one(
        {"email": user["email"]},
        {"$set": updated_data}
    )
    return jsonify({"message": "Profile updated successfully"}), 200

# ==========================================
# AI & ACTIVITY TRACKING
# ==========================================

@app.route("/api/users/track/", methods=["POST"])
def track_activity():
    """Track user searches and product views for AI recommendations."""
    user = get_current_user()
    if not user:
        return jsonify({"detail": "Unauthorized"}), 401
        
    data = request.json or {}
    activity_type = data.get("type") # 'search' or 'view'
    value = data.get("value") # search query or product category
    
    if not activity_type or not value:
        return jsonify({"detail": "Invalid data"}), 400
        
    users_coll = get_coll('users')
    # Maintain a list of recent activities in the user document
    users_coll.update_one(
        {"email": user["email"]},
        {
            "$push": {
                "activity_log": {
                    "type": activity_type,
                    "value": value,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
        }
    )
    
    # Cap the log at 50 items to prevent document bloat
    users_coll.update_one(
        {"email": user["email"]},
        {"$push": {"activity_log": {"$each": [], "$slice": -50}}}
    )
    
    return jsonify({"status": "tracked"}), 200

@app.route("/api/users/recommendations/", methods=["GET"])
def get_ai_recommendations():
    """AI-driven product recommendations based on user history."""
    try:
        user = get_current_user()
        if not user:
            return jsonify([]), 200
            
        # 1. Analyze activity log to find preferred categories
        log = user.get("activity_log", [])
        products_coll = get_coll('products')
        
        if not log:
            # Fallback: general popular items
            products = list(products_coll.find().sort("sales_count", -1).limit(10))
            return jsonify([convert_id(p) for p in products]), 200
            
        category_weights = {}
        for entry in log:
            val = entry.get("value")
            if not val: continue # Skip malformed entries
            
            if entry.get("type") == "search":
                # Heuristic: search is higher intent than view
                category_weights[val] = category_weights.get(val, 0) + 2
            else:
                category_weights[val] = category_weights.get(val, 0) + 1
                
        # Sort categories by weight
        sorted_cats = sorted(category_weights.items(), key=lambda x: x[1], reverse=True)
        top_cats = [c[0] for c in sorted_cats[:3]]
        
        # 2. Fetch products from top categories
        recommendations = list(products_coll.find({"category": {"$in": top_cats}}).limit(12))
        
        # Randomize order slightly for "ALIVE" feel
        random.shuffle(recommendations)
        
        return jsonify([convert_id(p) for p in recommendations]), 200
    except Exception as e:
        print(f"Error in get_ai_recommendations: {e}")
        return jsonify([]), 200 # Fail gracefully with empty list

@app.route("/api/users/notifications/", methods=["GET"])
def get_user_notifications():
    """Personalized AI notifications (Price drops, recommendations)."""
    try:
        user = get_current_user()
        if not user:
             return jsonify([]), 200
             
        notifications = []
        products_coll = get_coll('products')
        
        # Logic 1: Find price drops for previously viewed items
        log = user.get("activity_log", [])
        viewed_pids = [entry["value"] for entry in log if entry.get("type") == "view" and entry.get("value", "").startswith("p_")]
        
        # In a real app we'd compare price history, here we mock a recurring drop
        if viewed_pids:
            sample_pid = viewed_pids[-1]
            prod = products_coll.find_one({"product_id": sample_pid})
            if prod:
                notifications.append({
                    "id": f"notif_{sample_pid}",
                    "type": "price_drop",
                    "title": "Price Drop Alert! 🎉",
                    "message": f"Good news! '{prod['name']}' is now only ${prod['price']}. Buy it before it's gone!",
                    "productId": sample_pid,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
        # Logic 2: Category highlights
        if log:
            top_cat = log[-1].get("value")
            if top_cat:
                notifications.append({
                    "id": f"notif_cat_{top_cat}",
                    "type": "recommendation",
                    "title": f"New in {top_cat}",
                    "message": f"Check out the latest arrivals in {top_cat} curated just for you.",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
        return jsonify(notifications), 200
    except Exception as e:
        print(f"Error in get_user_notifications: {e}")
        return jsonify([]), 200

@app.route("/api/vendors/my-shop/", methods=["GET", "PUT"])
def get_my_shop():
    """Get or update the shop details for the logged-in vendor."""
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "VENDOR":
         return jsonify({"detail": "Unauthorized"}), 401
    
    vendors_coll = get_coll('vendors')
    if request.method == "PUT":
        # Update shop data
        data = request.json or {}
        vendors_coll.update_one(
            {"username": user["username"]},
            {"$set": data},
            upsert=True
        )
        updated = vendors_coll.find_one({"username": user["username"]})
        return jsonify(convert_id(updated)), 200
         
    vendor = vendors_coll.find_one({"username": user["username"]})
    if not vendor:
        return jsonify({"detail": "Not found"}), 404
        
    return jsonify(convert_id(vendor)), 200

@app.route("/api/products/", methods=["GET"])
def products_mock():
    """Get products from MongoDB with optional category filter."""
    category = request.args.get("category")
    query = {}
    if category:
        query["category"] = category
    products_coll = get_coll('products')
    products = list(products_coll.find(query))
    return jsonify([convert_id(p) for p in products]), 200

@app.route("/api/products/search/", methods=["GET"])
def search_products():
    """Basic search across products."""
    q = request.args.get("q", "")
    if not q: return jsonify([]), 200
    
    # Enhanced search with category awareness
    search_filter = {
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": f"^{q}$", "$options": "i"}}, # Exact category match
            {"vendor_name": {"$regex": q, "$options": "i"}}
        ]
    }
    
    # If q exactly matches a category, prioritize that category
    products_coll = get_coll('products')
    exact_cat = products_coll.find_one({"category": {"$regex": f"^{q}$", "$options": "i"}})
    if exact_cat:
        search_filter = {"category": exact_cat['category']}

    products = list(products_coll.find(search_filter))
    return jsonify([convert_id(p) for p in products]), 200

@app.route("/api/vendors/", methods=["GET"])
def vendors_mock():
    """Get vendors from MongoDB."""
    vendors_coll = get_coll('vendors')
    vendors = list(vendors_coll.find({}))
    return jsonify([convert_id(v) for v in vendors]), 200

@app.route("/api/orders/my-orders/", methods=["GET"])
def buyer_orders_mock():
    """Get orders for the logged-in buyer."""
    user = get_current_user()
    if not user:
         return jsonify({"detail": "Unauthorized"}), 401
         
    orders_coll = get_coll('orders')
    orders = list(orders_coll.find({"buyer_username": user["username"]}))
    return jsonify([convert_id(o) for o in orders]), 200

@app.route("/api/orders/vendor/my-shop-orders/", methods=["GET"])
def vendor_orders_mock():
    """Get orders for the logged-in vendor."""
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "VENDOR":
         return jsonify({"detail": "Unauthorized"}), 401
         
    orders_coll = get_coll('orders')
    orders = list(orders_coll.find({"vendor_username": user["username"]}))
    return jsonify([convert_id(o) for o in orders]), 200

@app.route("/api/orders/place/", methods=["POST"])
def place_order():
    """Place a new order, splitting by vendor if necessary."""
    user = get_current_user()
    if not user:
        return jsonify({"detail": "Unauthorized"}), 401
    
    data = request.json or {}
    items = data.get("items", [])
    shipping_address = data.get("shipping_address", "Default Address")
    payment_method = data.get("payment_method", "COD")
    
    if not items:
        return jsonify({"detail": "No items to order"}), 400
        
    # Group items by vendor
    vendor_groups = {}
    for item in items:
        # Frontend sends 'vendor' key for the vendor_username
        v_username = item.get("vendor") 
        if not v_username:
            # Fallback: try to find vendor_username from product DB
            p_id = item.get("product_id")
            if p_id:
                try:
                    products_coll = get_coll('products')
                    q = {"_id": ObjectId(p_id)} if len(p_id) == 24 else {"product_id": p_id}
                    prod = products_coll.find_one(q)
                    if prod: v_username = prod.get('vendor_username')
                except: pass
        
        v_username = v_username or "unknown_vendor"
        if v_username not in vendor_groups:
            vendor_groups[v_username] = []
        vendor_groups[v_username].append(item)
        
    created_orders = []
    for v_username, v_items in vendor_groups.items():
        total = sum(float(i.get("price", 0)) * int(i.get("quantity", 1)) for i in v_items)
        
        # 1. Deduct Stock & Increment Sales Count
        for i in v_items:
            p_id = i.get("product_id")
            qty = int(i.get("quantity", 1))
            if p_id:
                try:
                    q_prod = {"_id": ObjectId(p_id)} if len(p_id) == 24 else {"product_id": p_id}
                    get_coll('products').update_one(q_prod, {"$inc": {"stock": -qty, "sales_count": qty}})
                except Exception as e:
                    print(f"Error updating stock for {p_id}: {e}")

        # 2. Create Order Document
        order_doc = {
            "buyer_username": user["username"],
            "vendor_username": v_username,
            "items": v_items,
            "total_amount": total,
            "shipping_address": shipping_address,
            "payment_method": payment_method,
            "payment_status": data.get("payment_status", "PENDING"),
            "razorpay_payment_id": data.get("razorpay_payment_id", ""),
            "status": "Pending",
            "created_at": datetime.utcnow().isoformat()
        }
        result = get_coll('orders').insert_one(order_doc)
        created_orders.append(str(result.inserted_id))
        
    return jsonify({"message": "Order placed successfully", "order_ids": created_orders}), 201

# ==========================================
# ADMIN ENDPOINTS
# ==========================================

@app.route("/api/admin/users/", methods=["GET"])
def get_admin_users_list():
    """Get all users for management."""
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN":
         return jsonify({"detail": "Unauthorized"}), 401
    
    users_coll = get_coll('users')
    # Exclude passwords
    users = list(users_coll.find({}, {"password": 0}))
    return jsonify([convert_id(u) for u in users]), 200

@app.route("/api/admin/create-admin", methods=['POST'])
def create_admin():
    user = get_current_user()
    if not user or user.get('role') not in ["ADMIN", "admin"]:
        return jsonify({"error": "Admin privileges required"}), 403

    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify({"error": "Username, email, and password are required"}), 400

    users_coll = get_coll('users')

    if users_coll.find_one({"username": username}) or users_coll.find_one({"email": email}):
        return jsonify({"error": "User with this username or email already exists"}), 409

    hashed_password = generate_password_hash(password)
    new_admin = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "role": "ADMIN" # Ensure role is explicitly set to ADMIN
    }

    users_coll.insert_one(new_admin)
    return jsonify({"message": "Admin user created successfully."}), 201

@app.route("/api/admin/buyers/", methods=["GET"])
def get_admin_buyers():
    """Admin endpoint to get all buyers."""
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN":
         return jsonify({"detail": "Unauthorized"}), 401
    
    users_coll = get_coll('users')
    # Exclude passwords from response
    buyers = list(users_coll.find({"role": {"$regex": "^buyer$", "$options": "i"}}, {"password": 0}))
    return jsonify([convert_id(b) for b in buyers]), 200

@app.route("/api/admin/vendors/", methods=["GET"])
def get_admin_vendors():
    """Admin endpoint to get all vendors from the vendors collection."""
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN":
         return jsonify({"detail": "Unauthorized"}), 401
         
    vendors_coll = get_coll('vendors')
    vendors = list(vendors_coll.find({}))
    return jsonify([convert_id(v) for v in vendors]), 200

@app.route("/api/admin/transactions/", methods=["GET"])
def get_admin_transactions():
    """Admin endpoint to get all orders/transactions."""
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN":
         return jsonify({"detail": "Unauthorized"}), 401
         
    orders_coll = get_coll('orders')
    orders = list(orders_coll.find({}))
    return jsonify([convert_id(o) for o in orders]), 200

# ----- USER MANAGEMENT & OVERSIGHT -----
@app.route("/api/admin/users/<username>/status", methods=["PUT"])
def admin_user_status(username):
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN": return jsonify({"detail": "Unauthorized"}), 401
    status = request.json.get("status", "active")
    users_coll = get_coll('users')
    users_coll.update_one({"username": username}, {"$set": {"status": status}})
    return jsonify({"message": f"User status updated to {status}"}), 200

@app.route("/api/admin/vendors/<username>/approve", methods=["PUT"])
def admin_vendor_approve(username):
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN": return jsonify({"detail": "Unauthorized"}), 401
    approved = request.json.get("approved", True)
    vendors_coll = get_coll('vendors')
    vendors_coll.update_one({"username": username}, {"$set": {"approved": approved}})
    return jsonify({"message": f"Vendor approval status updated to {approved}"}), 200

@app.route("/api/admin/users/<username>/orders", methods=["GET"])
def admin_user_orders(username):
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN": return jsonify({"detail": "Unauthorized"}), 401
    orders_coll = get_coll('orders')
    orders = list(orders_coll.find({"buyer_username": username}))
    return jsonify([convert_id(o) for o in orders]), 200

@app.route("/api/admin/orders/<order_id>/refund", methods=["PUT"])
def admin_refund_order(order_id):
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN": return jsonify({"detail": "Unauthorized"}), 401
    orders_coll = get_coll('orders')
    try:
        query = {"_id": ObjectId(order_id)} if len(order_id) == 24 else {"order_id": order_id}
        orders_coll.update_one(query, {"$set": {"refund_status": "Refunded", "status": "Refunded"}})
        return jsonify({"message": "Order refunded"}), 200
    except:
        return jsonify({"detail": "Invalid ID"}), 400

@app.route("/api/admin/orders/<order_id>/dispute", methods=["PUT"])
def admin_dispute_order(order_id):
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN": return jsonify({"detail": "Unauthorized"}), 401
    orders_coll = get_coll('orders')
    try:
        query = {"_id": ObjectId(order_id)} if len(order_id) == 24 else {"order_id": order_id}
        orders_coll.update_one(query, {"$set": {"dispute_status": "In Dispute", "status": "Disputed"}})
        return jsonify({"message": "Order marked as disputed"}), 200
    except:
        return jsonify({"detail": "Invalid ID"}), 400

# ----- PLATFORM CONFIG -----
@app.route("/api/admin/config/", methods=["GET"])
def get_platform_config():
    config_coll = get_coll('platform_config')
    config = config_coll.find_one({})
    if not config:
        config = {
            "reviews_enabled": True, "recommendations_enabled": True, 
            "chatbot_api_key": "", "return_policy": "Default 7-day policy."
        }
        config_coll.insert_one(config)
    return jsonify(convert_id(config)), 200

@app.route("/api/admin/config/", methods=["PUT"])
def update_platform_config():
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN": return jsonify({"detail": "Unauthorized"}), 401
    data = request.json or {}
    updated_data = {
        "reviews_enabled": data.get("reviews_enabled", True),
        "recommendations_enabled": data.get("recommendations_enabled", True),
        "chatbot_api_key": data.get("chatbot_api_key", ""),
        "return_policy": data.get("return_policy", "")
    }
    config_coll = get_coll('platform_config')
    config_coll.update_one({}, {"$set": updated_data}, upsert=True)
    return jsonify({"message": "Configuration updated successfully"}), 200

# ----- ANALYTICS -----
@app.route("/api/admin/analytics/", methods=["GET"])
def get_analytics():
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN": return jsonify({"detail": "Unauthorized"}), 401
    
    orders_coll = get_coll('orders')
    orders = list(orders_coll.find({}))
    total_rev = sum(o.get("total_amount", 0) for o in orders if o.get("status") not in ["Refunded", "Cancelled"])
    
    # Calculate daily sales (last 7 days)
    # Mocking for now but based on real order counts
    vendor_split = {}
    for o in orders:
        if o.get("status") not in ["Refunded", "Cancelled"]:
            v_name = o.get("vendor_username", "Unknown")
            vendor_split[v_name] = vendor_split.get(v_name, 0) + o.get("total_amount", 0)
    
    vendor_metrics = [{"vendor": k, "revenue": v} for k, v in vendor_split.items()]
    active_users = get_coll('users').count_documents({}) # Real count
    total_products = get_coll('products').count_documents({})
    total_vendors = get_coll('vendors').count_documents({})

    return jsonify({
        "total_revenue": total_rev,
        "vendor_revenue": vendor_metrics,
        "active_users": active_users,
        "total_products": total_products,
        "total_vendors": total_vendors,
        "daily_sales": [
            {"date": "Mon", "sales": total_rev * 0.1},
            {"date": "Tue", "sales": total_rev * 0.15},
            {"date": "Wed", "sales": total_rev * 0.12},
            {"date": "Thu", "sales": total_rev * 0.2},
            {"date": "Fri", "sales": total_rev * 0.18},
            {"date": "Sat", "sales": total_rev * 0.25}
        ]
    }), 200

# ----- CATEGORIES -----
from bson.objectid import ObjectId

@app.route("/api/categories/", methods=["GET"])
def get_categories():
    categories_coll = get_coll('categories')
    categories = list(categories_coll.find({}))
    return jsonify([convert_id(c) for c in categories]), 200

@app.route("/api/categories/", methods=["POST"])
def create_category():
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN": return jsonify({"detail": "Unauthorized"}), 401
    data = request.json or {}
    category_doc = {
        "name": data.get("name", "New Category"),
        "image_url": data.get("image_url", ""),
        "description": data.get("description", "")
    }
    categories_coll = get_coll('categories')
    result = categories_coll.insert_one(category_doc)
    return jsonify({"message": "Category created", "id": str(result.inserted_id)}), 201

@app.route("/api/categories/<cat_id>", methods=["DELETE"])
def delete_category(cat_id):
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "ADMIN": return jsonify({"detail": "Unauthorized"}), 401
    try:
        categories_coll = get_coll('categories')
        categories_coll.delete_one({"_id": ObjectId(cat_id)})
        return jsonify({"message": "Category deleted"}), 200
    except:
        return jsonify({"detail": "Invalid ID"}), 400

@app.route("/api/chat/", methods=["POST"])
def chat():
    """Gemini-powered chatbot or mock fallback."""
    try:
        data = request.json or {}
        user_msg = data.get("message", "")
        
        # 1. Fetch config to get API KEY
        config_coll = get_coll('config')
        config = config_coll.find_one({}) or {}
        api_key = config.get("chatbot_api_key", "")
        
        if api_key and api_key.strip():
            import requests
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{
                    "parts": [{"text": f"You are a helpful assistant for TradeLink Multi-Vendor Marketplace. Your goal is to help buyers find products, track orders, and answer platform questions concisely. User prompt: {user_msg}"}]
                }]
            }
            try:
                response = requests.post(url, json=payload, timeout=10)
                if response.status_code == 200:
                    result = response.json()
                    ai_text = result['candidates'][0]['content']['parts'][0]['text']
                    return jsonify({"response": ai_text}), 200
            except Exception as e:
                print(f"AI API Error: {str(e)}")
        
        # 2. Mock Fallback
        msg = user_msg.lower()
        response = "I'm a simple assistant. Ask me about our vendors, products, or your orders!"
        if "vendor" in msg:
            response = "We have many top-tier vendors including Tech Haven and Fresh Farms! Check out the homepage to see them."
        elif "product" in msg or "buy" in msg:
            response = "You can browse products from our featured partners on their respective store pages."
        elif "order" in msg:
            response = "You can view your most recent orders by navigating to your Dashboard if you are logged in."
            
        return jsonify({"response": response}), 200
    except Exception as e:
        return jsonify({"response": "I'm having a bit of trouble connecting to my brain. Try again?"}), 200

# ==========================================
# VENDOR SETUP ENDPOINTS
# ==========================================

@app.route("/api/vendors/setup/", methods=["POST"])
def setup_vendor_profile():
    """Endpoint for a vendor to create/update their public shop profile."""
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "VENDOR":
         return jsonify({"detail": "Unauthorized. Must be a vendor."}), 401
         
    data = request.json or {}
    
    # Store vendor details using their username to link auth with shop
    # Support both snake_case (frontend) and standard/camelCase keys
    vendor_doc = {
        "vendor_id": f"v_{user['username']}", 
        "username": user['username'],
        "name": data.get("shop_name") or data.get("name") or f"{user['username']}'s Shop",
        "category": data.get("category", "General"),
        "location": data.get("location", "Online"),
        "phone": data.get("phone", ""),
        "gstin": data.get("gstin", ""),
        "website": data.get("website", ""),
        "description": data.get("description", ""),
        "logo_image": data.get("logo_image") or data.get("logoUrl", ""),
        "banner_image": data.get("banner_image") or data.get("bannerUrl", ""),
        "shop_photo": data.get("shop_photo") or data.get("shopPhotoUrl", ""),
        "returnPolicy": data.get("returnPolicy", "Standard 7-day return policy."),
        "isVisible": data.get("isVisible", True),
        "rating": 5.0
    }
    
    # Update if exists, otherwise insert
    vendors_coll = get_coll('vendors')
    vendors_coll.update_one(
        {"username": user['username']},
        {"$set": vendor_doc},
        upsert=True
    )
    
    return jsonify({"message": "Shop profile created/updated successfully!"}), 201

@app.route("/api/products/add/", methods=["POST"])
def add_product():
    """Endpoint for a vendor to add a new product to their shop."""
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "VENDOR":
         return jsonify({"detail": "Unauthorized. Must be a vendor."}), 401
         
    # Make sure vendor profile actually exists
    vendors_coll = get_coll('vendors')
    vendor = vendors_coll.find_one({"username": user['username']})
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
        "images": data.get("images", []),
        "variants": data.get("variants", []),
        "description": data.get("description", ""),
        "sales_count": 0
    }
    
    products_coll = get_coll('products')
    products_coll.insert_one(product_doc)
    return jsonify({"message": "Product added successfully!"}), 201

@app.route("/api/products/<product_id>", methods=["PUT"])
def edit_product(product_id):
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "VENDOR": return jsonify({"detail": "Unauthorized."}), 401
    
    data = request.json or {}
    updated_data = {
        "name": data.get("name"),
        "price": float(data.get("price", 0.0)),
        "stock": int(data.get("stock", 0)),
        "image": data.get("image"),
        "images": data.get("images", []),
        "variants": data.get("variants", []),
        "description": data.get("description")
    }
    # Remove None values
    updated_data = {k: v for k, v in updated_data.items() if v is not None}
    
    # Ensure they own the product
    products_coll = get_coll('products')
    result = products_coll.update_one(
        {"_id": ObjectId(product_id), "vendor_username": user["username"]},
        {"$set": updated_data}
    )
    if result.matched_count == 0:
        return jsonify({"detail": "Product not found or unauthorized"}), 404
        
    return jsonify({"message": "Product updated successfully!"}), 200

@app.route("/api/products/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "VENDOR": return jsonify({"detail": "Unauthorized."}), 401
    
    products_coll = get_coll('products')
    result = products_coll.delete_one({"_id": ObjectId(product_id), "vendor_username": user["username"]})
    if result.deleted_count == 0:
        return jsonify({"detail": "Product not found or unauthorized"}), 404
        
    return jsonify({"message": "Product deleted"}), 200

import csv
import io
@app.route("/api/products/bulk/", methods=["POST"])
def bulk_upload_products():
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "VENDOR": return jsonify({"detail": "Unauthorized."}), 401
    
    vendor = get_coll('vendors').find_one({"username": user['username']})
    if not vendor: return jsonify({"detail": "Setup shop first."}), 400
    
    if 'file' not in request.files: return jsonify({"detail": "No file part"}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({"detail": "No selected file"}), 400
    
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.DictReader(stream)
        products_to_insert = []
        for row in csv_input:
            products_to_insert.append({
                "vendor_id": vendor["vendor_id"],
                "vendor_username": user["username"],
                "name": row.get("name", "Imported Product"),
                "price": float(row.get("price", 0.0)),
                "stock": int(row.get("stock", 0)),
                "image": row.get("image", ""),
                "images": [row.get("image", "")],
                "variants": [],
                "description": row.get("description", ""),
                "sales_count": 0
            })
        if products_to_insert:
            products_coll = get_coll('products')
            products_coll.insert_many(products_to_insert)
        return jsonify({"message": f"{len(products_to_insert)} products imported successfully!"}), 201
    except Exception as e:
        return jsonify({"detail": f"Error parsing CSV: {str(e)}"}), 400

# ----- VENDOR ORDER MANAGEMENT -----
@app.route("/api/orders/<order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "VENDOR": return jsonify({"detail": "Unauthorized."}), 401
    
    status = request.json.get("status")
    if not status: return jsonify({"detail": "Status required"}), 400
    
    orders_coll = get_coll('orders')
    result = orders_coll.update_one(
        {"_id": ObjectId(order_id), "vendor_username": user["username"]},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        return jsonify({"detail": "Order not found or unauthorized"}), 404
        
    return jsonify({"message": f"Order status updated to {status}"}), 200

# ----- VENDOR ANALYTICS -----
@app.route("/api/vendors/analytics/", methods=["GET"])
def get_vendor_analytics():
    user = get_current_user()
    if not user or str(user.get("role", "")).upper() != "VENDOR": return jsonify({"detail": "Unauthorized."}), 401
    
    pipeline = [
        {"$match": {"vendor_username": user["username"], "status": {"$nin": ["Cancelled", "Refunded"]}}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}, "order_count": {"$sum": 1}}}
    ]
    
    orders_coll = get_coll('orders')
    stats_cursor = list(orders_coll.aggregate(pipeline))
    stats = stats_cursor[0] if stats_cursor else {"total_revenue": 0, "order_count": 0}
    
    # Get low stock products
    products_coll = get_coll('products')
    low_stock = list(products_coll.find({"vendor_username": user["username"], "stock": {"$lt": 10}}, {"name": 1, "stock": 1}))
    total_products = products_coll.count_documents({"vendor_username": user["username"]})
    
    rev = stats.get("total_revenue", 0)
    return jsonify({
        "total_revenue": rev,
        "order_count": stats.get("order_count", 0),
        "total_products": total_products,
        "low_stock_alerts": [convert_id(p) for p in low_stock],
        "daily_sales": [
            {"date": "Mon", "sales": rev * 0.05},
            {"date": "Tue", "sales": rev * 0.2},
            {"date": "Wed", "sales": rev * 0.1},
            {"date": "Thu", "sales": rev * 0.15},
            {"date": "Fri", "sales": rev * 0.3},
            {"date": "Sat", "sales": rev * 0.2}
        ]
    }), 200

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
        coll = get_coll('test_collection')
        result = coll.insert_one(data)
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
        coll = get_coll('test_collection')
        items = list(coll.find({}, {'_id': 0})) 
        return jsonify({"items": items}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# REVIEWS & RATINGS
# ==========================================

@app.route("/api/reviews/", methods=["POST"])
def post_review():
    """Submit a review for a product."""
    user = get_current_user()
    if not user:
        return jsonify({"detail": "Unauthorized"}), 401
    
    data = request.json or {}
    product_id = data.get("product_id")
    rating = data.get("rating")
    comment = data.get("comment", "")
    
    if not product_id or rating is None:
        return jsonify({"detail": "Product ID and rating are required"}), 400
    
    reviews_coll = get_coll('reviews')
    review_doc = {
        "user_email": user["email"],
        "username": user["username"],
        "product_id": product_id,
        "rating": float(rating),
        "comment": comment,
        "verified": True, 
        "created_at": datetime.utcnow().isoformat()
    }
    
    reviews_coll.insert_one(review_doc)
    
    # Update product average rating
    try:
        all_reviews = list(reviews_coll.find({"product_id": product_id}))
        if all_reviews:
            avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
            get_coll('products').update_one(
                {"product_id": product_id},
                {"$set": {"rating": round(avg_rating, 1), "review_count": len(all_reviews)}}
            )
            
            # 2. Update vendor average rating
            prod = get_coll('products').find_one({"product_id": product_id})
            if prod and "vendor_username" in prod:
                v_username = prod["vendor_username"]
                v_products = list(get_coll('products').find({"vendor_username": v_username}))
                valid_ratings = [p["rating"] for p in v_products if "rating" in p]
                if valid_ratings:
                    v_avg = sum(valid_ratings) / len(valid_ratings)
                    get_coll('vendors').update_one(
                        {"username": v_username},
                        {"$set": {"rating": round(v_avg, 1)}}
                    )
    except Exception as e:
        print(f"Error updating rating: {e}")
    
    return jsonify({"message": "Review submitted successfully"}), 201

@app.route("/api/reviews/product/<product_id>", methods=["GET"])
def get_product_reviews(product_id):
    """Get all reviews for a specific product."""
    reviews_coll = get_coll('reviews')
    reviews = list(reviews_coll.find({"product_id": product_id}).sort("created_at", -1))
    return jsonify([convert_id(r) for r in reviews]), 200

@app.route("/api/reviews/vendor/<vendor_username>", methods=["GET"])
def get_vendor_reviews(vendor_username):
    """Get all reviews for products owned by a vendor."""
    products_coll = get_coll('products')
    vendor_products = list(products_coll.find({"vendor_username": vendor_username}))
    vendor_pids = [p["product_id"] for p in vendor_products]
    
    reviews_coll = get_coll('reviews')
    reviews = list(reviews_coll.find({"product_id": {"$in": vendor_pids}}).sort("created_at", -1))
    return jsonify([convert_id(r) for r in reviews]), 200

if __name__ == "__main__":
    # Run the Flask app on port 5000, listening on all interfaces
    app.run(debug=True, port=5000, host='0.0.0.0')
