
import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.environ.get("MONGO_URI")

client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

print("DATABASES:", client.list_database_names())

# Force check marketplace_flask_db
db = client['marketplace_flask_db']
print("COLLECTIONS IN marketplace_flask_db:", db.list_collection_names())
