
import os
import json
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")

client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

def search_recursive(doc, query):
    if isinstance(doc, str):
        return query.lower() in doc.lower()
    if isinstance(doc, dict):
        return any(search_recursive(v, query) for v in doc.values())
    if isinstance(doc, list):
        return any(search_recursive(v, query) for v in doc)
    return False

print("--- Searching for 'Precision' in ALL DATABASES ---")
dbs = client.list_database_names()
print(f"Databases found: {dbs}")
for db_name in dbs:
    print(f"Checking DB: {db_name}")
    db = client[db_name]
    try:
        colls = db.list_collection_names()
    except Exception as e:
        print(f"  Could not list collections in {db_name}: {e}")
        continue
        
    for coll_name in colls:
        print(f"  Checking Coll: {coll_name}")
        coll = db[coll_name]
        try:
            docs = list(coll.find({}))
            found_count = 0
            for doc in docs:
                if search_recursive(doc, "Precision"):
                    print(f"!!! FOUND in {db_name}.{coll_name}: {doc}")
                    found_count += 1
                    if found_count > 5:
                        print("  (More than 5 found, skipping rest of collection...)")
                        break
        except Exception as e:
            print(f"    Error reading {coll_name}: {e}")
