
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)

def deep_search(query):
    try:
        dbs = client.list_database_names()
        for db_name in dbs:
            if db_name in ['admin', 'local', 'config']: continue
            db = client[db_name]
            for coll_name in db.list_collection_names():
                coll = db[coll_name]
                # Search in all fields
                results = list(coll.find({"$or": [
                    {k: {"$regex": query, "$options": "i"}} for k in ["name", "description", "category", "shop_name", "vendor_name", "title"]
                ]}))
                if results:
                    print(f"FOUND in {db_name}.{coll_name}:")
                    for r in results:
                        print(r)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    deep_search("Precision")
