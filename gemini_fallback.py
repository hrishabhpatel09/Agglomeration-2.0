"""
Gemini API Fallback for Customer Support Chatbot

This module provides a fallback function using Gemini via OpenRouter API
when the Kaggle server is unavailable. It receives the same inputs
and generates the same output format as the main API.

Requirements:
    pip install requests

Usage:
    from gemini_fallback import generate_response_gemini
    
    response = generate_response_gemini(
        sender_metadata={"name": "John Doe", "email": "john@example.com"},
        ticket_id="TKT-123",
        sla_time="2 hours",
        thread_conversation=[{"role": "user", "message": "Can't login"}],
        previous_solutions=[{"issue": "Login failure", "solution": "Reset password"}],
        api_key="your_openrouter_api_key"
    )
    
    print(response)  # {"is_redirected": false, "response": "...", "solution": "..."}
"""

import os
import json
import re
from typing import Dict, List, Any, Optional

try:
    import requests
except ImportError:
    raise ImportError("requests not installed. Run: pip install requests")


def build_gemini_prompt(
    sender_metadata: Dict[str, Any],
    ticket_id: str,
    sla_time: str,
    thread_conversation: List[Dict[str, str]],
    previous_solutions: List[Dict[str, Any]]
) -> str:
    """Build the prompt for Gemini API"""
    
    customer_name = sender_metadata.get('name', 'Valued Customer')
    customer_email = sender_metadata.get('email', 'N/A')
    
    # Format conversation
    conversation = "\n".join([
        f"{msg['role'].upper()}: {msg['message']}" 
        for msg in thread_conversation
    ])
    
    # Count user and agent messages
    user_messages = [msg for msg in thread_conversation if msg.get('role', '').lower() in ['user', 'query']]
    agent_messages = [msg for msg in thread_conversation if msg.get('role', '').lower() in ['agent', 'response', 'assistant']]
    
    user_message_count = len(user_messages)
    agent_message_count = len(agent_messages)
    has_agent_responses = agent_message_count > 0
    
    # Format previous solutions
    if previous_solutions:
        solutions_text = "\n".join([
            f"- Issue: {sol.get('issue', 'N/A')}\n  Solution: {sol.get('solution', 'N/A')}"
            for sol in previous_solutions
        ])
    else:
        solutions_text = "No previous similar solutions found."
    
    prompt = f"""You are an intelligent customer support AI assistant. Your PRIMARY goal is customer satisfaction. Only provide solutions when you have a PERFECT match - otherwise, redirect to human support for better assistance.

**Customer Information:**
- Name: {customer_name}
- Email: {customer_email}
- Ticket ID: {ticket_id}
- SLA Time: {sla_time}

**Conversation History (User messages: {user_message_count}, Total turns: {len(thread_conversation)}):**
{conversation}

**Analysis:**
- This is an ongoing conversation on the SAME problem
- AI model has already responded: {"YES - " + str(agent_message_count) + " time(s)" if has_agent_responses else "NO - First interaction"}
- If user is asking again after AI responses, previous solutions did NOT work

**Previous Similar Solutions from Database:**
{solutions_text}

**STRICT DECISION RULES:**

**✅ ONLY RESOLVE (is_redirected = FALSE) IF ALL CONDITIONS ARE MET:**

1. **PERFECT Solution Match**: Previous solution EXACTLY matches the customer's problem
   - Issue symptoms are IDENTICAL
   - Solution directly addresses the EXACT problem customer is facing
   - NOT just related or similar - must be PRECISE match

2. **Fresh Query (First Interaction)**: 
   - User has sent only 1-2 messages (current: {user_message_count})
   - NO previous AI responses in thread (current: {"Yes - " + str(agent_message_count) + " responses" if has_agent_responses else "No - Fresh query"})
   - Customer hasn't tried solutions before

3. **Solution Quality**: Complete, clear, and actionable
   - Customer can follow steps without additional help
   - No ambiguity or missing information

4. **NOT Urgent/Critical**: 
   - No keywords: "urgent", "emergency", "critical", "production", "ASAP", "immediately", "not working", "stopped working", "broken"
   - Not affecting business operations or multiple users
   - No server errors (500, 503, 502, API failures) with urgency

5. **NOT Requesting Human**: 
   - Customer hasn't asked to: "talk to human", "speak to agent", "connect me", "escalate", "call me", "real person"

→ If ALL 5 conditions = TRUE, provide the PERFECT solution (is_redirected = FALSE)

**❌ MUST REDIRECT (is_redirected = TRUE) IF ANY OF THESE:**

1. **Explicit Human Request**:
   - "talk to human", "speak to agent", "connect me to support", "I want to speak with someone", "escalate", "call me", "real person", "representative"

2. **Critical/Urgent Issues**:
   - Keywords: "URGENT", "EMERGENCY", "CRITICAL", "production down", "system crashed", "not working", "stopped working", "broken"
   - Affecting multiple users/business operations
   - Server errors (500, 503, 502, API failures) with urgency or affecting users

3. **Persistent/Repeat Issue (MOST IMPORTANT)**:
   - User has sent MORE than 2 messages (current: {user_message_count})
   - AI model already gave responses but user is ASKING AGAIN (current: {"Yes" if has_agent_responses else "No"})
   - Customer says: "still not working", "tried that already", "doesn't work", "same problem", "issue persists", "not resolved"
   - **If user is coming back after AI response = previous solution FAILED → MUST REDIRECT**

4. **Imperfect Solution Match**:
   - Previous solution is SIMILAR but not exact match
   - Solution might work but you're not 100% confident
   - Issue is more complex than the previous solution covers

5. **Default - When in Doubt**:
   - If unsure about solution quality → REDIRECT
   - If solution is partial/incomplete → REDIRECT
   - Better to redirect than provide imperfect solution

**SOLUTION FIELD IS ALWAYS MANDATORY (Never empty):**

- When is_redirected = FALSE: "Issue: [exact query summary]. Solution: [complete step-by-step instructions]"
- When is_redirected = TRUE: "Issue: [issue description]. Reason: [why redirected - explicit request/critical urgency/persistent issue/imperfect match]"

**Response Format:**

**If is_redirected = FALSE (RARE - Only perfect matches on FIRST interaction):**
- Warm greeting: "Hi {customer_name}!"
- Acknowledge the issue
- Provide COMPLETE solution in numbered steps
- Be clear, professional, and confident
- **solution field**: "Issue: [query]. Solution: [detailed perfect steps]"

**If is_redirected = TRUE (PREFERRED - Most cases, especially repeat queries):**
- Empathetic greeting: "Hi {customer_name}, thank you for reaching out"
- Acknowledge the context:
  - If explicit request: "I understand you'd like to speak with our support team directly"
  - If critical/urgent: "I understand this is a critical issue requiring immediate attention"
  - If persistent (AI already responded): "I can see this issue is persisting despite previous attempts to resolve it. Let me connect you with our specialized team for hands-on assistance"
  - If imperfect match: "To ensure you get the most accurate solution for your specific situation"
- State: "Your ticket {ticket_id} has been escalated to our specialized support team"
- Explain: "Our team will respond within {sla_time}"
- Be reassuring and professional
- **solution field**: "Issue: [description]. Reason: [specific redirect reason]"

**CRITICAL: Output ONLY valid JSON, no other text:**
{{
  "is_redirected": true/false,
  "response": "your personalized message here",
  "solution": "MANDATORY - either perfect solution with query summary, or issue description with redirect reason - NEVER EMPTY"
}}"""
    
    return prompt


def parse_json_from_text(text: str) -> Dict[str, Any]:
    """Extract and parse JSON from Gemini response"""
    try:
        # Try direct JSON parse
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        json_match = re.search(r'```(?:json)?\s*({.*?})\s*```', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        
        # Try to find JSON object in text
        json_match = re.search(r'\{[^{}]*"is_redirected"[^{}]*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        
        # Last attempt: find any JSON-like structure
        json_match = re.search(r'\{.*?\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        
        raise ValueError(f"No valid JSON found in response: {text[:200]}...")


def generate_response_gemini(
    sender_metadata: Dict[str, Any],
    ticket_id: str,
    sla_time: str,
    thread_conversation: List[Dict[str, str]],
    previous_solutions: List[Dict[str, Any]] = None,
    api_key: Optional[str] = None,
    model_name: str = "google/gemini-2.5-flash-preview-09-2025",
    max_retries: int = 2
) -> Dict[str, Any]:
    """
    Generate customer support response using Gemini via OpenRouter API as fallback.
    
    Args:
        sender_metadata: Customer metadata dict with name, email, account_id, etc.
        ticket_id: Unique ticket identifier
        sla_time: SLA deadline (e.g., "2 hours", "4:30 PM")
        thread_conversation: List of conversation messages with role and message
        previous_solutions: List of similar past solutions from database
        api_key: OpenRouter API key (optional, uses OPENROUTER_API_KEY env variable if not provided)
        model_name: OpenRouter model to use (default: google/gemini-2.5-flash-preview-09-2025)
        max_retries: Maximum retry attempts for JSON parsing failures
        
    Returns:
        Dictionary with keys: is_redirected (bool), response (str), solution (str)
        
    Raises:
        ValueError: If API key not provided or JSON parsing fails after retries
        Exception: For API errors or other failures
        
    Example:
        >>> response = generate_response_gemini(
        ...     sender_metadata={"name": "John Doe", "email": "john@example.com"},
        ...     ticket_id="TKT-123",
        ...     sla_time="2 hours",
        ...     thread_conversation=[{"role": "user", "message": "Can't login"}],
        ...     previous_solutions=[{"issue": "Login failure", "solution": "Reset password"}],
        ...     api_key="your_openrouter_api_key"
        ... )
        >>> print(response["is_redirected"])
        False
    """
    
    # Get API key
    if api_key is None:
        api_key = os.getenv("OPENROUTER_API_KEY")
    
    if not api_key:
        raise ValueError(
            "OpenRouter API key not provided. Either pass api_key parameter or set OPENROUTER_API_KEY environment variable.\n"
            "Get your API key from: https://openrouter.ai/keys"
        )
    
    # Handle None previous_solutions
    if previous_solutions is None:
        previous_solutions = []
    
    # Build prompt
    prompt = build_gemini_prompt(
        sender_metadata=sender_metadata,
        ticket_id=ticket_id,
        sla_time=sla_time,
        thread_conversation=thread_conversation,
        previous_solutions=previous_solutions
    )
    
    # OpenRouter API endpoint
    api_url = "https://openrouter.ai/api/v1/chat/completions"
    
    # Request headers
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/your-repo",
        "X-Title": "Customer Support Chatbot"
    }
    
    # Request body
    request_body = {
        "model": model_name,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.3,
        "max_tokens": 1024
    }
    
    # Retry logic
    for attempt in range(max_retries + 1):
        try:
            print(f"🤖 Gemini Attempt {attempt + 1}/{max_retries + 1}: Generating response...")
            
            # Make API request
            response = requests.post(
                api_url,
                headers=headers,
                json=request_body,
                timeout=30
            )
            
            # Check for API errors
            if response.status_code != 200:
                raise Exception(
                    f"OpenRouter API error (Status {response.status_code}): {response.text}"
                )
            
            # Parse response
            response_data = response.json()
            
            # Extract generated text
            if "choices" not in response_data or not response_data["choices"]:
                raise Exception("No choices in OpenRouter response")
            
            generated_text = response_data["choices"][0]["message"]["content"]
            print(f"📝 Raw Gemini output: {generated_text[:200]}...")
            
            # Parse JSON from generated text
            result = parse_json_from_text(generated_text)
            
            # Validate required fields
            required_fields = ['is_redirected', 'response', 'solution']
            if not all(key in result for key in required_fields):
                raise ValueError(f"Missing required fields. Found: {list(result.keys())}, Required: {required_fields}")
            
            # Ensure correct types
            result['is_redirected'] = bool(result['is_redirected'])
            result['response'] = str(result['response'])
            result['solution'] = str(result['solution'])
            
            print(f"✅ Successfully generated response (redirected: {result['is_redirected']})")
            return result
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"⚠️ Attempt {attempt + 1} JSON parsing failed: {str(e)}")
            if attempt == max_retries:
                raise ValueError(
                    f"Failed to parse valid JSON after {max_retries + 1} attempts. "
                    f"Last error: {str(e)}"
                )
        
        except Exception as e:
            print(f"❌ Attempt {attempt + 1} failed: {str(e)}")
            if attempt == max_retries:
                raise Exception(
                    f"OpenRouter API failed after {max_retries + 1} attempts. "
                    f"Error: {str(e)}"
                )
            import time
            time.sleep(1)


def generate_response_gemini_from_request(request_data: Dict[str, Any], api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Convenience function that accepts the same request format as the main API.
    Perfect for drop-in replacement when Kaggle endpoint is unavailable.
    
    Args:
        request_data: Dictionary with keys: sender_metadata, ticket_id, sla_time, 
                     thread_conversation, previous_solutions
        api_key: OpenRouter API key (optional, uses OPENROUTER_API_KEY env var)
        
    Returns:
        Dictionary with keys: is_redirected (bool), response (str), solution (str)
        
    Example:
        >>> request = {
        ...     "sender_metadata": {"name": "John", "email": "john@example.com"},
        ...     "ticket_id": "TKT-123",
        ...     "sla_time": "2 hours",
        ...     "thread_conversation": [{"role": "user", "message": "Help!"}],
        ...     "previous_solutions": []
        ... }
        >>> response = generate_response_gemini_from_request(request, api_key="sk-or-v1-...")
    """
    return generate_response_gemini(
        sender_metadata=request_data["sender_metadata"],
        ticket_id=request_data["ticket_id"],
        sla_time=request_data["sla_time"],
        thread_conversation=request_data["thread_conversation"],
        previous_solutions=request_data.get("previous_solutions", []),
        api_key=api_key
    )


# Example usage and testing
if __name__ == "__main__":
    # Example 1: Login issue with perfect match
    print("=" * 70)
    print("TEST 1: Login Issue (Should Resolve)")
    print("=" * 70)
    
    test_request_1 = {
        "sender_metadata": {
            "name": "Sarah Johnson",
            "email": "sarah.j@example.com",
            "account_id": "ACC78901"
        },
        "ticket_id": "TKT-2026-12345",
        "sla_time": "2 hours",
        "thread_conversation": [
            {
                "role": "user",
                "message": "I can't log into my account. It says my password is incorrect but I'm sure it's right."
            }
        ],
        "previous_solutions": [
            {
                "issue": "Login failure - incorrect password error",
                "solution": "Clear browser cache and cookies, then use the 'Forgot Password' feature to reset. Check if Caps Lock is on. If using autofill, try typing password manually."
            }
        ]
    }
    
    try:
        result_1 = generate_response_gemini_from_request(test_request_1)
        print(f"\n✅ Result 1:")
        print(f"  is_redirected: {result_1['is_redirected']}")
        print(f"  response: {result_1['response'][:100]}...")
        print(f"  solution: {result_1['solution'][:100]}...")
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    print("\n" + "=" * 70)
    print("TEST 2: Critical API Issue (Should Redirect)")
    print("=" * 70)
    
    # Example 2: Critical API issue - should redirect
    test_request_2 = {
        "sender_metadata": {
            "name": "Michael Chen",
            "email": "m.chen@company.com",
            "account_id": "ACC45678"
        },
        "ticket_id": "TKT-2026-67890",
        "sla_time": "4 hours",
        "thread_conversation": [
            {
                "role": "user",
                "message": "Our company's API integration stopped working this morning. We're getting 500 errors on all endpoints."
            },
            {
                "role": "user",
                "message": "This is urgent as it's affecting our production system. We have 200+ users unable to access services."
            }
        ],
        "previous_solutions": [
            {
                "issue": "API rate limit exceeded",
                "solution": "Check API rate limits in dashboard. Upgrade plan or implement request throttling."
            },
            {
                "issue": "API key expired",
                "solution": "Regenerate API key from account settings > API Management."
            }
        ]
    }
    
    try:
        result_2 = generate_response_gemini_from_request(test_request_2)
        print(f"\n✅ Result 2:")
        print(f"  is_redirected: {result_2['is_redirected']}")
        print(f"  response: {result_2['response'][:100]}...")
        print(f"  solution: {result_2['solution'][:100]}...")
    except Exception as e:
        print(f"\n❌ Error: {e}")
