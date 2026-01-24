import imaplib
import email,os
from db import identifyThread,message_col
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

EMAIL = os.getenv('EMAIL')
PASSWORD = os.getenv('PASSWORD')
IMAP_SERVER = "imap.gmail.com"
MAILBOX = "INBOX"
mailboxes = [
    "INBOX",
    '"[Gmail]/Sent Mail"',
    '"[Gmail]/Spam"'
]

# ---------------------------------------

def extract_body(msg):
    body = ""

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            disposition = str(part.get("Content-Disposition"))

            if "attachment" in disposition:
                continue

            if content_type == "text/plain":
                body = part.get_payload(decode=True).decode(errors="ignore")
                break
            elif content_type == "text/html" and not body:
                body = part.get_payload(decode=True).decode(errors="ignore")
    else:
        body = msg.get_payload(decode=True).decode(errors="ignore")

    return body.strip()


def fetch_emails(limit=10):
    emails = []
    for boxes in mailboxes:
        imap = imaplib.IMAP4_SSL(IMAP_SERVER)
        imap.login(EMAIL, PASSWORD)
        imap.select(boxes)

        status, data = imap.search(None, "ALL")
        print(status)
        mail_ids = data[0].split()

        cnt = limit

        for mail_id in reversed(mail_ids):
            if cnt <= 0:
                break

            _, msg_data = imap.fetch(mail_id, "(RFC822)")
            raw = msg_data[0][1]
            msg = email.message_from_bytes(raw)

            print(msg.get("In-Reply-To"))
            emails.append({
                "Message-ID": msg.get("Message-ID"),
                "In-Reply-To": msg.get("In-Reply-To"),
                "References": msg.get("References"),
                "Subject": msg.get("Subject"),
                "From": msg.get("From"),
                "Date": msg.get("Date"),
                "body": extract_body(msg)
            })

            cnt -= 1

        imap.logout()
    
    return emails


        
emails = fetch_emails(limit=3)

for mail in emails:
    thread_id, ticket_id = identifyThread(email=mail)
    message_doc = {
        "thread_id": thread_id,
        "ticket_id": ticket_id,
        "message_id": mail.get("Message-ID"),
        "in_reply_to": mail.get("In-Reply-To"),
        "subject": mail.get("Subject"),
        "from": mail.get("From"),
        "date": mail.get("Date"),
        "headers": None,
        "raw_body": None,
        "text_body": mail.get("body"),
        "created_at": datetime.utcnow()
    }
    message_col.insert_one(message_doc)
