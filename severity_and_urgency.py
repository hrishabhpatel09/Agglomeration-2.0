from langgraph.graph import StateGraph
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import re
import time

# Load environment variables from .env file
load_dotenv()

# Initialize OpenRouter client
# Ensure OPENROUTER_API_KEY is set in your .env file
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY"),
)

def clean_json_text(text):
    """Clean markdown code blocks from string."""
    pattern = r"```(?:json)?\s*(.*?)\s*```"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1)
    return text.strip()

def build_prompt(subject, body, tier, role):
    return f"""
You are an AI support triage system.

Classify the email into EXACTLY ONE severity.

Severity definitions:
P1 (Critical): Production down, all users affected, severe business impact.
P2 (High): Major feature broken, blocking work.
P3 (Medium): Minor issue, workaround exists.
P4 (Low): Feature request or general inquiry.

SLA mapping:
P1 → 1 hour
P2 → 4 hours
P3 → 24 hours
P4 → 72 hours

You MUST consider:
- Customer tier: {tier}
- Sender role: {role}
- Email tone and urgency
- Business impact
- Time sensitivity

Return ONLY valid JSON in this format:
{{
  "severity": "P1 | P2 | P3 | P4",
  "reasoning": "short explanation"
}}

Subject:
{subject}

Body:
{body}
"""

def classify_with_deepseek(state):
    subject = state.get("subject", "")
    body = state.get("body", "")
    tier = state.get("customer_tier", "Standard")
    role = state.get("sender_role", "User")

    prompt = build_prompt(subject, body, tier, role)
    
    max_retries = 3
    base_delay = 5

    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="deepseek/deepseek-chat", # Defaulting to V3 (Chat)
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that outputs only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0,
                response_format={"type": "json_object"} # Ensure JSON output
            )

            # Extract content
            content = response.choices[0].message.content
            cleaned_text = clean_json_text(content)
            
            try:
                data = json.loads(cleaned_text)
            except json.JSONDecodeError:
                # If standard loading fails, try to just find the JSON object in text
                match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
                if match:
                    data = json.loads(match.group(0))
                else:
                    raise

            severity = data.get("severity", "P3").upper()
            if severity not in ["P1", "P2", "P3", "P4"]:
                severity = "P3"

            return {
                "severity": severity,
                "reasoning": data.get("reasoning", "No reasoning provided.")
            }

        except Exception as e:
            print(f"DeepSeek Error (Attempt {attempt+1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(base_delay * (attempt + 1))
                continue
            
            return {
                "severity": "P3",
                "reasoning": f"Fallback severity due to AI error: {str(e)}"
            }
    
def apply_sla(state):
    sla_map = {
        "P1": 1,
        "P2": 4,
        "P3": 24,
        "P4": 72
    }

    severity = state.get("severity", "P3")

    if severity not in sla_map:
        severity = "P3"  # ultimate safety

    return {
        "severity": severity,
        "sla_hours": sla_map[severity],
        "reasoning": state.get("reasoning", "")
    }

graph = StateGraph(dict)

graph.add_node("classify", classify_with_deepseek)
graph.add_node("sla", apply_sla)

graph.set_entry_point("classify")
graph.add_edge("classify", "sla")
graph.set_finish_point("sla")


import re

def getBodyWithoutSignature(body: str):
    """
    Returns email body with signature removed.
    """

    signature = getSignature(body)

    if not signature:
        return body.strip()

    # Remove signature from body
    body_without_signature = body[: body.rfind(signature)]
    return body_without_signature.strip()


def getSignature(body: str):
    """
    Extracts signature from email body.
    Signature is assumed to start with Thanks/Regards/etc. in the last paragraph.
    """

    signature_pattern = re.compile(
        r"(?:\n|\r\n|\r)(?:thanks|thank you|regards|best regards|warm regards|sincerely)[\s\S]*$",
        re.IGNORECASE
    )

    match = signature_pattern.search(body)

    if match:
        return match.group().strip()

    return None

def analyse(msg):
    severity_graph = graph.compile()

    result = severity_graph.invoke({
        "subject": msg["subject"],
        "body": getBodyWithoutSignature(msg["text_body"]),
        "customer_tier": msg["tier"],
        "sender_role": msg["from"]
    })

    print(result)
    return result
