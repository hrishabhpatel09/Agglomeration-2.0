
from db import counters_col


def generate_ticket_id():
    doc = counters_col.find_one_and_update(
        {"_id": "ticket_counter"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )

    if "seq" not in doc:
        counters_col.update_one({"_id": "ticket_counter"}, {"$set": {"seq": 1000}})
        return "TICKET-1000"

    return f"TICKET-{doc['seq']}"
