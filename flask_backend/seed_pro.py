import os
from pymongo import MongoClient
import random
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/marketplace_flask_db")
client = MongoClient(MONGO_URI)
db = client['marketplace_flask_db']

def seed_pro():
    print("🚀 Starting Professional Data Seeding...")
    
    # Clear existing data
    db.users.delete_many({})
    db.vendors.delete_many({})
    db.products.delete_many({})
    db.categories.delete_many({})
    db.orders.delete_many({})
    db.platform_config.delete_many({})

    # 1. Platform Config
    db.platform_config.insert_one({
        "reviews_enabled": True,
        "recommendations_enabled": True,
        "chatbot_api_key": "MOCK_KEY_12345",
        "return_policy": "Premium 30-day return policy for all TradeLink Gold members. 7-day standard returns for guest checkouts."
    })

    # 2. Categories
    categories = [
        {"name": "Mobiles", "icon": "smartphone", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"},
        {"name": "Fashion", "icon": "shirt", "image": "https://images.unsplash.com/photo-1445205170230-053b830160b0?w=400"},
        {"name": "Electronics", "icon": "cpu", "image": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400"},
        {"name": "Appliances", "icon": "microwave", "image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400"},
        {"name": "Home & Kitchen", "icon": "home", "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400"},
        {"name": "Beauty", "icon": "sparkles", "image": "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=400"},
        {"name": "Sports", "icon": "trophy", "image": "https://images.unsplash.com/photo-1461896704190-321aa21a6564?w=400"},
        {"name": "Toys", "icon": "puzzle", "image": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400"}
    ]
    db.categories.insert_many(categories)

    # 3. Users (1 Admin, 10 Vendors, 20 Buyers)
    # Admin
    db.users.insert_one({
        "username": "admin",
        "email": "admin@tradelink.com",
        "password": generate_password_hash("password"),
        "role": "ADMIN",
        "status": "active"
    })

    vendors = []
    for i in range(1, 9): # 8 vendors for 8 categories
        username = f"vendor{i}"
        email = f"vendor{i}@gmail.com"
        db.users.insert_one({
            "username": username,
            "email": email,
            "password": generate_password_hash("password"),
            "role": "VENDOR",
            "status": "active"
        })
        
        # Vendor Shop Profile
        cat = categories[i-1]["name"]
        vendors.append({
            "vendor_id": f"v_{username}",
            "username": username,
            "name": f"{username.capitalize()} Professional {cat}",
            "category": cat,
            "location": random.choice(["New Delhi", "Mumbai", "Bangalore", "Hydrabad", "Pune"]),
            "description": f"Expert providers of premium {cat} products with over {random.randint(2,10)} years of heritage.",
            "rating": round(random.uniform(4.2, 5.0), 1),
            "approved": True,
            "bannerUrl": categories[i-1]["image"],
            "logoUrl": f"https://api.dicebear.com/7.x/initials/svg?seed={username}",
            "isVisible": True
        })
    db.vendors.insert_many(vendors)

    for i in range(1, 21):
        username = f"buyer{i}"
        db.users.insert_one({
            "username": username,
            "email": f"buyer{i}@example.com",
            "password": generate_password_hash("password"),
            "role": "BUYER",
            "status": "active",
            "address": f"Apartment {i*10}, Prestige Shantiniketan, Bangalore",
            "wishlist": []
        })

    # 4. Products (100+ Records) - High-Quality Visual Dataset mapping
    category_images = {
        "Mobiles": [
            "1511707171634-5f897ff02aa9", # Mobile desk
            "1533228892241-d89710a10264", # Smartphone
            "1512941937669-90a1358b7e9c", # iPhone
            "1598327622308-1f14e8a2c113", # Galaxy
            "1556656793-0117324745ed", # Mobile UI
            "1512499617640-42fbc3844010", # Smartphone close up
            "1616348436168-de43ad0db179", # High tech mobile
            "1523206489230-c712897fd7dc"  # Device set
        ],
        "Fashion": [
            "1525507119028-ed820c31f1ec", # Sneakers
            "1539109136881-3be0616acf4b", # Fashion model
            "1490481651871-ab68ec25d43d", # Clothes on rack
            "1558769134-af27b807936d", # Shoes
            "1445205170230-053b830160b0", # Boutique
            "1441984904996-e0b6ba687e04", # Fashion setup
            "1475180098004-ca77a2f0b4d5", # High fashion
            "1483985988355-763728e1935b"  # Shopping bags
        ],
        "Electronics": [
            "1526406915894-7bcd65f60845", # Headphones
            "1550009158-977ba724fd3a", # Laptop
            "1546868891-912a297e64bc", # Smartwatch
            "1606229365311-d05104a05581", # RGB setup
            "1498049794561-7780e7231661", # Components
            "1585218356534-7546702cd933", # Speakers
            "1516035063543-d6bdc9bc3b62", # Keyboard
            "1544244015-0df4b3ffc6b0"  # Microchip
        ],
        "Appliances": [
            "1556911220-e15b29be8c8f", # Kitchen mixer
            "1584622650111-993a426fbf0a", # Coffee machine
            "1550617931-e17a7b70dce2", # Toaster
            "1574333527902-149021aae2e3", # Washing machine
            "1626738634243-987893a7267d", # Refrigerator
            "1493019330653-2559624538a7", # Oven
            "1527339523375-820c89ddf1ba", # Blender
            "1615332579014-daabc96556e4"  # Vacuum
        ],
        "Home & Kitchen": [
            "1513694203232-719a280e022f", # Room setup
            "1583847268964-b28dc8f51f93", # Desk chair
            "1540932239986-3012807863c5", # Interior
            "1594913785162-e6785b42fbb1", # Kitchenware
            "1524750331447-da99660c136b", # Sofa
            "1551000394-4d6d62886c3d", # Clock
            "1533090161702-dd50e54162ce", # Lamp
            "1586023492824-79b02a7037f5"  # Plants
        ],
        "Beauty": [
            "1596462502278-27bfdc4033c8", # Skincare
            "1522335789203-aa5ae398c251", # Makeup kit
            "1612817288484-6f916006741a", # Essential oil
            "1515688594516-2fca94c57a90", # Perfume
            "1571781926291-c477eb7020fb", # Lipsticks
            "1596249301-4be3a975731b", # Serum
            "1512391652304-429a196ce721", # Lotion
            "1608614917032-9df72d3fcc2c"  # Beauty flatlay
        ],
        "Sports": [
            "1461896704190-321aa21a6564", # Running shoe
            "1517649763962-0c623066013b", # Weights
            "1541534741688-64654b8a1062", # Basketball
            "1530549387602-de74c939929d", # Water bottle
            "1574675451911-dfd28739981a", # Yoga mat
            "1535131749005-0e0593f0b240", # Football
            "1544367562831-9753d730a663", # Biker
            "1518013031131-789a69ed9b1a"  # Tennis
        ],
        "Toys": [
            "1531346878377-a5be20888e57", # Blocks
            "1535572290543-88024248798d", # Stuffed toy
            "1558060370-d640097f3987", # Robot
            "1533519821214-4da97cd2bb7c", # Board game
            "1515488042361-ec02b055ad9c", # Wooden toys
            "1519323465874-f3ca85c7621c", # Puzzle
            "1566579090-21ce4d252443", # Action figure
            "1560948830-14e9953a925f"  # Educational
        ]
    }

    products = []
    product_names = {
        "Mobiles": ["iPhone 15 Pro", "Samsung Galaxy S24", "Google Pixel 8", "OnePlus 12", "Xiaomi 14", "Realme GT 5", "Nothing Phone 2", "Asus ROG Phone 8", "Sony Xperia 1 V", "Motorola Edge 50"],
        "Fashion": ["Slim Fit Denim", "Classic White Tee", "Leather Bomber Jacket", "Summer Linen Shirt", "Running Sneakers", "Formal Blazer", "Cotton Chinos", "Graphic Hoodie", "Silk Scarf", "Designer Handbag"],
        "Electronics": ["Wireless ANC Headphones", "Mechanical RGB Keyboard", "Gaming Mouse", "4K Monitor 27\"", "Laptop Pro 14\"", "Smart Watch V2", "USB-C Hub", "Tablet Air", "Bluetooth Speaker", "Camera Lens 50mm"],
        "Appliances": ["Smart Refrigerator", "Front Load Washer", "Convection Microwave", "Air Purifier Pro", "Dishwasher Ultra", "Induction Cooktop", "Robot Vacuum Cleaner", "Coffee Espresso Machine", "Toaster 4-Slice", "Electric Kettle"],
        "Home & Kitchen": ["Ergonomic Desk Chair", "Memory Foam Pillow", "LED Desk Lamp", "Bohemian Rug", "Ceramic Vase Set", "Cotton Bedspread", "Wall Clock Modern", "Coffee Table", "Storage Bin", "Kitchen Knife Set"],
        "Beauty": ["Moisturizing Cream", "Sunscreen SPF 50", "Eye Shadow Palette", "Matte Lipstick", "Charcoal Face Wash", "Argan Oil Hair Mask", "Night Repair Serum", "Foundation Beige", "Mascara Volume", "Toner Rose Water"],
        "Sports": ["Tennis Racket", "Football Size 5", "Basketball", "Swimming Goggles", "Cricket Bat", "Badminton Shuttlecocks", "Training Jersey", "Sports Water Bottle", "Gym Bag", "Stopwatch"],
        "Toys": ["Building Block Set", "Remote Control Car", "Educational Robot", "Board Game Classic", "Stuffed Bear", "Action Figure Hero", "Wooden Train Set", "Art Easel", "Science Experiment Kit", "Magic Trick Set"]
    }

    for vendor in vendors:
        cat = vendor["category"]
        names = product_names.get(cat, ["Generic Product"])
        image_ids = category_images.get(cat, ["1505740433631-447a17385ad0"])
        for j in range(1, 13): # 12 products per shop = 120 products total
            name = f"{random.choice(names)} {j}"
            price = random.randint(499, 14999)
            img_id = random.choice(image_ids)
            products.append({
                "product_id": f"p_{vendor['username']}_{j}",
                "vendor_id": vendor["vendor_id"],
                "vendor_username": vendor["username"],
                "name": name,
                "price": price,
                "stock": random.randint(10, 500),
                "image": f"https://images.unsplash.com/photo-{img_id}?auto=format&fit=crop&w=600&q=80",
                "description": f"High-quality {name} from {vendor['name']}. Perfect for professionals and enthusiasts.",
                "category": cat,
                "sales_count": random.randint(0, 100)
            })
    db.products.insert_many(products)

    print(f"✅ Seeding Complete!")
    print(f"   - Users: {db.users.count_documents({})}")
    print(f"   - Vendors: {db.vendors.count_documents({})}")
    print(f"   - Products: {db.products.count_documents({})}")
    print(f"   - Categories: {db.categories.count_documents({})}")

if __name__ == "__main__":
    seed_pro()
