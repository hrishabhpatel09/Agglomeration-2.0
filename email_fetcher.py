import imaplib, email
from email.policy import default
from vector_db import add_vector, get_gemini_embeddings
from ticket_identifier import identify_ticket
from db import messages_col,companies_col
from config import EMAIL, PASSWORD, IMAP_SERVER
from severity_and_urgency import analyse
import uuid
import requests
import re,os
from gemini_classification_fallback import classify_email_gemini



def extract_body(msg):
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                return part.get_payload(decode=True).decode(errors="ignore")
    return msg.get_payload(decode=True).decode(errors="ignore")

def extract_domain(from_field):
    if not from_field:
        return None
    
    match = re.search(r'@([\w.-]+\.\w+)', from_field)
    return match.group(1).lower() if match else None

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
                print(extract_domain(msg.get("From")))
                tier = companies_col.find_one({"domain": extract_domain(msg.get("From"))})
                if tier==None:
                    tier="Free"
                else:
                    tier = tier["tier"]

                print(companies_col.find_one({"domain": extract_domain(msg.get("From"))}))
                email_obj = {
                    "message_id": message_id,
                    "subject": msg.get("Subject"),
                    "from": msg.get("From"),
                    "date": msg.get("Date"),
                    "in_reply_to": msg.get("In-Reply-To"),
                    "references": msg.get("References"),
                    "text_body": extract_body(msg),
                    "folder": folder,
                    "tier": tier
                }

                # Sla Time
                response = analyse(email_obj)

                print(type(response))
                for key,val in response.items():
                    email_obj[key] = val

                # print(f"Processing: {email_obj['subject']}")

                # ---------------------------------------------------------
                # Your existing Logic (Thread detection & DB)
                # ---------------------------------------------------------
                thread_id, ticket_id = identify_ticket(email_obj)

                test_payload = requests.get(f"http://localhost:8000/tickets/{ticket_id}/messages")
                # test_payload["name"] = msg.get("From")

                API_URL = "https://602fc9ebe19b.ngrok-free.app/resolve_query"
                prevdata = test_payload.json()
                prevdata["messages"].append(email_obj)

                print(type(prevdata))
                print(prevdata)
                # TODO: Append 60% similarity search:


                response = requests.post(API_URL, json=prevdata)

                response = response.json()
                
                # if(response.is_redirected):
                #     # todo: Update status to redirected to personal agent
                #     pass

                # API_URL2 = "https://602fc9ebe19b.ngrok-free.app/classify_email"
                # classify_response = requests.post(API_URL2, json=email_obj["text_body"]).json()
                email_obj["ai_response"] = response["response"]
                
                classify_response = classify_email_gemini(email_text=email_obj["text_body"],api_key=os.getenv("OPENROUTER_API_KEY"))

                print("\n")
                print("Ye asli hai")
                print(classify_response)

                if classify_response["confidence"] >0.8:
                    email_obj["category"] = classify_response["category"]
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