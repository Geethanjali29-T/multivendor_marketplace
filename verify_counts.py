from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def verify():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/multivendor_marketplace")
    client = MongoClient(mongo_uri)
    db = client.get_database()
    
    products_count = db.products.count_documents({})
    vendors_count = db.vendors.count_documents({})
    users_count = db.users.count_documents({})
    categories_count = db.categories.count_documents({})
    
    print(f"Products: {products_count}")
    print(f"Vendors: {vendors_count}")
    print(f"Users: {users_count}")
    print(f"Categories: {categories_count}")

if __name__ == "__main__":
    verify()
