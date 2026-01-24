
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")
IMAP_SERVER = os.getenv("IMAP_SERVER")
# MAILBOX = os.getenv("MAILBOX")

MONGO_URI = os.getenv("MONGO_URI")
QDRANT_URL = os.getenv("QDRANT_URL")

TICKET_REGEX = r"(TICKET-\d+)"
SIMILARITY_THRESHOLD = 0.80
