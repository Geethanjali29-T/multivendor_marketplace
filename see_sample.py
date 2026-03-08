
import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
m = os.environ.get("MONGO_URI")
c = MongoClient(m, server_api=ServerApi('1'))
d = c['spurtcommerce_portal']
v = d['vendors'].find_one()
print("VENDOR SAMPLE:", v)
p = d['products'].find_one()
print("PRODUCT SAMPLE:", p)
