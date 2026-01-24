import imaplib
import email,os

EMAIL = os.getenv('EMAIL')
PASSWORD = os.getenv('PASSWORD')
IMAP_SERVER = "imap.gmail.com"
MAILBOX = "INBOX"
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
    imap = imaplib.IMAP4_SSL(IMAP_SERVER)
    imap.login(EMAIL, PASSWORD)
    imap.select(MAILBOX)

    status, data = imap.search(None, "ALL")
    print(status)
    mail_ids = data[0].split()

    emails = []
    cnt = limit

    for mail_id in reversed(mail_ids):
        if cnt <= 0:
            break

        _, msg_data = imap.fetch(mail_id, "(RFC822)")
        raw = msg_data[0][1]
        msg = email.message_from_bytes(raw)

        emails.append({
            "message_id": msg.get("Message-ID"),
            "in_reply_to": msg.get("In-Reply-To"),
            "references": msg.get("References"),
            "subject": msg.get("Subject"),
            "from": msg.get("From"),
            "date": msg.get("Date"),
            "body": extract_body(msg)
        })

        cnt -= 1

    imap.logout()
    return emails
