import re
from typing import Dict

def parse_signature(signature: str):
    lines = [line.strip() for line in signature.splitlines() if line.strip()]

    if len(lines) < 4:
        return {
            "name": None,
            "role": None,
            "company": None,
            "phone": None
        }

    name = lines[1]
    role = lines[2]
    company = lines[3]

    phone = None
    if len(lines) >= 5:
        phone_line = lines[4]

        # Extract only the phone number
        phone_match = re.search(r"\+?\d[\d\s\-]{7,}", phone_line)
        if phone_match:
            phone = phone_match.group()

    return {
        "name": name,
        "role": role,
        "company": company,
        "phone": phone
    }

# Example
signature = """Regards,
Rahul Verma
Senior IT Manager
Tata Steel Ltd
Phone: +91-9877777777
"""

print(parse_signature(signature))