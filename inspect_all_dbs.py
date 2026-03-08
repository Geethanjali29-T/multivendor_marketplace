
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)

def inspect_all():
    try:
        dbs = client.list_database_names()
        print(f"Databases: {dbs}")
        for db_name in dbs:
            if db_name in ['admin', 'local', 'config']: continue
            db = client[db_name]
            colls = db.list_collection_names()
            print(f"\n--- Database: {db_name} ---")
            print(f"Collections: {colls}")
            for coll_name in colls:
                count = db[coll_name].count_documents({})
                print(f"  {coll_name}: {count} docs")
                if count > 0:
                    doc = db[coll_name].find_one()
                    print(f"    Sample: {doc}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_all()
