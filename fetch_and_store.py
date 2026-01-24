
from vector_db import init_qdrant
from email_fetcher import fetch_emails

if __name__ == "__main__":
    init_qdrant()
    fetch_emails(limit=8)