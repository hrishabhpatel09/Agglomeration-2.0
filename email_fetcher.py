import imaplib, email
from email.policy import default
from vector_db import add_vector, get_gemini_embeddings
from thread_identifier import identify_thread
from db import messages_col
from config import EMAIL, PASSWORD, IMAP_SERVER
import uuid,time


def extract_body(msg):
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                return part.get_payload(decode=True).decode(errors="ignore")
    return msg.get_payload(decode=True).decode(errors="ignore")


def fetch_emails(limit=3):
    # NOTE: Check your provider's specific folder names
    MAILBOXES = ["INBOX", "[Gmail]/Sent Mail"] 
    
    imap = imaplib.IMAP4_SSL(IMAP_SERVER)
    imap.login(EMAIL, PASSWORD)

    for folder in MAILBOXES:
        try:
            # FIX 1: Wrap folder name in quotes to handle spaces (e.g. "Sent Mail")
            status, _ = imap.select(f'"{folder}"')
            
            if status != "OK":
                print(f"Could not select folder: {folder}")
                continue
                
            print(f"Scanning folder: {folder}...")
            _, data = imap.search(None, "ALL")
            
            # FIX 2: Safety check to prevent crashing on empty folders (Spam)
            if not data or data[0] is None or len(data[0]) == 0:
                print(f"  > No emails found in {folder}")
                continue

            ids = data[0].split()[-limit:]

            for i in ids:
                _, msg_data = imap.fetch(i, "(RFC822)")
                
                # Safety check: ensure fetch actually returned data
                if not msg_data or msg_data[0] is None:
                    continue

                msg = email.message_from_bytes(msg_data[0][1], policy=default)

                message_id = msg.get("Message-ID") or str(uuid.uuid4())

                email_obj = {
                    "message_id": message_id,
                    "subject": msg.get("Subject"),
                    "from": msg.get("From"),
                    "date": msg.get("Date"),
                    "in_reply_to": msg.get("In-Reply-To"),
                    "references": msg.get("References"),
                    "text_body": extract_body(msg),
                    "folder": folder 
                }

                # print(f"Processing: {email_obj['subject']}")

                # ---------------------------------------------------------
                # Your existing Logic (Thread detection & DB)
                # ---------------------------------------------------------
                thread_id, ticket_id = identify_thread(email_obj)

                print(f"Saving in DB: {email_obj.get("message_id")}")
                messages_col.replace_one(
                    {"message_id": email_obj.get("message_id")},
                    {
                        **email_obj,
                        "thread_id": thread_id,
                        "ticket_id": ticket_id
                    },
                    upsert=True
                )

                # Only embed if there is body text to avoid API errors
                if email_obj["text_body"]:
                    vec = get_gemini_embeddings(email_obj["text_body"])
                    add_vector(vec, {
                        "thread_id": thread_id,
                        "ticket_id": ticket_id,
                        "message_id": message_id
                    }, message_id)
        
        except Exception as e:
            print(f"Error processing folder {folder}: {e}")

    imap.logout()