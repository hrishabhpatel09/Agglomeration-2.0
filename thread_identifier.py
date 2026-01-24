
import uuid, re
from db import threads_col, messages_col
from ticket_generator import generate_ticket_id
from vector_db import get_gemini_embeddings, search_similar
from config import TICKET_REGEX


def identify_thread(email):
    subject = email.get("subject") or ""
    body = email.get("text_body")
    message_id = email.get("message_id")
    in_reply_to = email.get("in_reply_to")
    references = email.get("references") or ""

    # 1. Ticket in subject
    match = re.search(TICKET_REGEX, subject)
    if match:
        ticket = match.group(1)
        thread = threads_col.find_one({"ticket_id": ticket})
        if thread:
            # Add message_id to thread's message_ids array
            threads_col.update_one(
                {"ticket_id": ticket},
                {"$addToSet": {"message_ids": message_id}}
            )
            return thread["thread_id"], ticket

    # 2. References
    for ref in references.split():
        msg = messages_col.find_one({"message_id": ref})
        if msg:
            # Add message_id to thread's message_ids array
            threads_col.update_one(
                {"thread_id": msg["thread_id"]},
                {"$addToSet": {"message_ids": message_id}}
            )
            return msg["thread_id"], msg["ticket_id"]

    # 3. In reply to
    if in_reply_to:
        msg = messages_col.find_one({"message_id": in_reply_to})
        if msg:
            # Add message_id to thread's message_ids array
            threads_col.update_one(
                {"thread_id": msg["thread_id"]},
                {"$addToSet": {"message_ids": message_id}}
            )
            return msg["thread_id"], msg["ticket_id"]

    print("Generating Embedding: ")  
    # 4. Vector similarity
    vec = get_gemini_embeddings(body)
    sim_match = search_similar(vec)
    if sim_match:
        print("Already in Some thread")
        # Add message_id to thread's message_ids array
        threads_col.update_one(
            {"thread_id": sim_match.payload["thread_id"]},
            {"$addToSet": {"message_ids": message_id}}
        )
        return sim_match.payload["thread_id"], sim_match.payload["ticket_id"]

    # 5. New thread
    ticket_id = generate_ticket_id()
    thread_id = str(uuid.uuid4())

    threads_col.insert_one({
        "ticket_id": ticket_id,
        "thread_id": thread_id,
        "message_ids": [message_id]
    })

    return thread_id, ticket_id
