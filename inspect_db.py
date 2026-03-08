
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['marketplace_flask_db']

def inspect():
    colls = db.list_collection_names()
    print(f"Collections: {colls}")
    for coll_name in colls:
        coll = db[coll_name]
        count = coll.count_documents({})
        print(f"\n--- {coll_name} ({count} docs) ---")
        docs = list(coll.find().limit(5))
        for d in docs:
            print(d)

if __name__ == "__main__":
    inspect()
