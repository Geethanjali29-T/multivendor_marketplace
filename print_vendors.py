
import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")

client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client['spurtcommerce_portal']

print("--- Vendors ---")
for v in db['vendors'].find():
    print(v)

print("\n--- Products ---")
for p in db['products'].find().limit(5):
    print(p)
