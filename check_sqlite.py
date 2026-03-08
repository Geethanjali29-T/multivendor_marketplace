
import sqlite3
import os

db_path = 'flask_backend/marketplace.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Tables: {tables}")
    for table in tables:
        t_name = table[0]
        try:
            cursor.execute(f"SELECT * FROM {t_name} LIMIT 5;")
            rows = cursor.fetchall()
            print(f"Table {t_name}: {rows}")
        except:
            pass
    conn.close()
else:
    print("marketplace.db not found")
