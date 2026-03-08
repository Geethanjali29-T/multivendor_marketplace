
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)

def find_precision():
    dbs = client.list_database_names()
    for db_name in dbs:
        if db_name in ['admin', 'local', 'config']: continue
        db = client[db_name]
        # Check all collections
        for coll_name in db.list_collection_names():
            coll = db[coll_name]
            # Search for anything containing "Precision"
            docs = list(coll.find({"$or": [
                {"name": {"$regex": "Precision", "$options": "i"}},
                {"shop_name": {"$regex": "Precision", "$options": "i"}},
                {"shopName": {"$regex": "Precision", "$options": "i"}},
                {"username": {"$regex": "Precision", "$options": "i"}},
                {"vendor_name": {"$regex": "Precision", "$options": "i"}}
            ]}))
            if docs:
                print(f"FOUND IN {db_name}.{coll_name}:")
                for d in docs:
                    print(f"  {d}")

if __name__ == "__main__":
    find_precision()
