
import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")

client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client['marketplace_flask_db']

print("--- Checking Vendors ---")
vendors = list(db['vendors'].find({"$or": [
    {"name": {"$regex": "Precision", "$options": "i"}},
    {"shop_name": {"$regex": "Precision", "$options": "i"}}
]}))
for v in vendors:
    print(v)

print("\n--- Checking Products ---")
products = list(db['products'].find({"$or": [
    {"name": {"$regex": "Precision", "$options": "i"}},
    {"vendor_name": {"$regex": "Precision", "$options": "i"}}
]}))
for p in products:
    print(p)

print("\n--- Checking All Vendors Count ---")
print(db['vendors'].count_documents({}))

print("\n--- Checking Reviews ---")
reviews = list(db['reviews'].find().limit(10))
for r in reviews:
    print(r)
