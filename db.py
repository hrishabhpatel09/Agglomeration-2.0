
from pymongo import MongoClient
from config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client.email_system

threads_col = db.threads
messages_col = db.messages
counters_col = db.counters

threads_col.create_index("ticket_id", unique=True)
messages_col.create_index(
    "message_id",
    unique=True,
    partialFilterExpression={"message_id": {"$exists": True}}
)
