import re
from typing import Dict

def parse_signature_with_phone(signature: str) -> Dict:
    """
    Assumes signature format:
    Line 1: Regards / Thanks
    Line 2: Name
    Line 3: Role / Designation
    Line 4: Company Name
    Line 5: Phone number (optional)
    """

    # Normalize and remove empty lines
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
        phone_candidate = lines[4]
        # Simple phone regex (international + local)
        if re.search(r"\+?\d[\d\s\-]{7,}", phone_candidate):
            phone = phone_candidate

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

print(parse_signature_with_phone(signature))