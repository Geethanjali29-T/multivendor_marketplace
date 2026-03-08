
import os as o
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
m = o.environ.get("MONGO_URI")
c = MongoClient(m, server_api=ServerApi('1'))
d = c['spurtcommerce_portal']
print("VENDORS:")
for v in d['vendors'].find():
    print(f"ID={v.get('_id')} NAME={v.get('name')} USER={v.get('username')}")

print("\nPRODUCTS:")
for p in d['products'].find().limit(5):
    print(f"ID={p.get('_id')} NAME={p.get('name')} CAT={p.get('category')} VENDOR={p.get('vendor_name')}")
