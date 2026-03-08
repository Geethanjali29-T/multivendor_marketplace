
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['marketplace_flask_db']

def list_vendors():
    vendors = list(db['vendors'].find({}))
    print(f"Total Vendors: {len(vendors)}")
    for v in vendors:
        print(f"ID: {v.get('_id')}, Name: {v.get('name')}, Username: {v.get('username')}, Category: {v.get('category')}")

if __name__ == "__main__":
    list_vendors()
