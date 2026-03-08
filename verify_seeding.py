
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['marketplace_flask_db']

def verify():
    print("--- VENDORS ---")
    vendors = list(db['vendors'].find())
    for v in vendors:
        print(f"Vendor: {v.get('name')} (ID: {v.get('vendor_id')})")
    
    print("\n--- PRODUCTS (Sample) ---")
    products = list(db['products'].find().limit(5))
    for p in products:
        print(f"Product: {p.get('name')} | Vendor: {p.get('vendor_name')}")

    print("\n--- CHECKING FOR PRECISION ---")
    precision_count = db['vendors'].count_documents({"name": {"$regex": "Precision", "$options": "i"}})
    precision_prod_count = db['products'].count_documents({"name": {"$regex": "Precision", "$options": "i"}})
    print(f"Precision Vendors: {precision_count}")
    print(f"Precision Products: {precision_prod_count}")

if __name__ == "__main__":
    verify()
