from pymongo import MongoClient
client = MongoClient("mongodb://localhost:27017/")
db = client.omniparse
chunk = db.document_chunks.find_one()
print(chunk)
