
import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")

client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

print("--- Databases ---")
dbs = client.list_database_names()
print(dbs)

for db_name in dbs:
    print(f"\n--- Collections in {db_name} ---")
    db = client[db_name]
    colls = db.list_collection_names()
    print(colls)
    for coll_name in colls:
        count = db[coll_name].count_documents({})
        print(f"  {coll_name}: {count} docs")
        if count > 0:
            doc = db[coll_name].find_one({"$or": [
                {"name": {"$regex": "Precision", "$options": "i"}},
                {"shop_name": {"$regex": "Precision", "$options": "i"}},
                {"username": {"$regex": "Precision", "$options": "i"}}
            ]})
            if doc:
                print(f"    FOUND in {coll_name}: {doc}")
