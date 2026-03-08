
import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")

client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client['UserLogins']

print(f"--- Collections in UserLogins ---")
colls = db.list_collection_names()
print(colls)
for coll_name in colls:
    count = db[coll_name].count_documents({})
    print(f"  {coll_name}: {count} docs")
    if count > 0:
        docs = list(db[coll_name].find().limit(5))
        for d in docs:
            print(f"    {d}")
        
        # Search for Precision
        precision_doc = db[coll_name].find_one({"$or": [
            {"name": {"$regex": "Precision", "$options": "i"}},
            {"shop_name": {"$regex": "Precision", "$options": "i"}},
            {"username": {"$regex": "Precision", "$options": "i"}},
            {"shopName": {"$regex": "Precision", "$options": "i"}}
        ]})
        if precision_doc:
            print(f"!!! FOUND PRECISION in {coll_name}: {precision_doc}")
