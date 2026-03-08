
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['marketplace_flask_db']

def check_products():
    count = db['products'].count_documents({})
    print(f"Total Products: {count}")
    if count > 0:
        sample = db['products'].find_one()
        print(f"Sample Product: {sample}")
    
    # Check other databases too
    dbs = client.list_database_names()
    for db_name in dbs:
        if db_name in ['admin', 'local', 'config']: continue
        print(f"Checking {db_name}...")
        curr_db = client[db_name]
        for coll in curr_db.list_collection_names():
            c = curr_db[coll].count_documents({})
            if c > 0:
                print(f"  {coll}: {c} docs")
                first = curr_db[coll].find_one()
                if isinstance(first, dict):
                    # Check if 'Precision' is in any string value
                    for k, v in first.items():
                        if isinstance(v, str) and 'Precision' in v:
                            print(f"    !!! FOUND 'Precision' in {db_name}.{coll}: field {k} = {v}")

if __name__ == "__main__":
    check_products()
