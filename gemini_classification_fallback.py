"""
Gemini Fallback for Email Classification Endpoint

This module provides a fallback function for the /classify_email endpoint
when the Kaggle server is unavailable or fails to respond.

Uses Gemini via OpenRouter API for reliable access.

Requirements:
    pip install requests

Usage:
    from gemini_classification_fallback import classify_email_gemini
    
    result = classify_email_gemini(
        email_text="Our app crashes when uploading files",
        api_key="your_openrouter_api_key"  # Optional if OPENROUTER_API_KEY env var is set
    )
    
    print(result)  # {"category": "Technical Support", "confidence": 0.95}
"""

import os
import json
import re
import requests
from typing import Dict, Any


def build_classification_prompt_gemini(email_text: str) -> str:
    """
    Construct classification prompt for Gemini model.
    Uses the same prompt logic as the Kaggle notebook.
    """
    
    prompt = f"""You are an intelligent email classification system for customer support. Analyze the email and classify it into exactly ONE of the 9 predefined categories.

**Email to Classify:**
{email_text}

**Categories and Examples:**

1. **Technical Support** - Technical issues, errors, bugs, system failures
   Example: "App crashes when...", "Error 500", "Can't sync data"

2. **Access Request** - Permissions, account access, user management
   Example: "Need admin rights", "Create user account", "Grant access to dashboard"

3. **Billing/Invoice** - Payment, invoices, billing inquiries, subscription
   Example: "Send invoice", "Payment confirmation", "Charge on my card"

4. **Feature Request** - New feature suggestions, enhancements
   Example: "Can you add Excel export?", "Add dark mode", "Support for API v2"

5. **Hardware/Infrastructure** - Server issues, infrastructure problems, performance
   Example: "Server down", "Need more RAM", "Slow response times"

6. **How-To/Documentation** - Usage questions, configuration help, documentation
   Example: "How do I configure...?", "Steps to set up", "Where is the manual?"

7. **Data Request** - Data export, reports, historical data
   Example: "Export 6 months data", "Generate report", "Download transaction history"

8. **Complaint/Escalation** - Complaints, dissatisfaction, escalations
   Example: "This is unacceptable", "Manager escalation", "Very disappointed"

9. **General Inquiry** - General questions, business hours, policies
   Example: "What are working hours?", "Do you support X?", "Company location?"

**Instructions:**
1. Read the email carefully
2. Choose the SINGLE MOST APPROPRIATE category from the 9 options above
3. Provide a confidence score between 0 and 1 (0 = not confident, 1 = very confident)
4. Be strict - you MUST select one of these 9 categories, no exceptions

**CRITICAL: Respond ONLY with valid JSON in this exact format:**
{{
  "category": "Category Name",
  "confidence": 0.95
}}

Do not include any text before or after the JSON object."""
    
    return prompt


def parse_json_from_text(text: str) -> Dict[str, Any]:
    """
    Extract and parse JSON from text with multiple fallback strategies.
    Handles markdown code blocks and plain JSON.
    """
    # Try direct JSON parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Try to extract from markdown code blocks
    json_match = re.search(r'```(?:json)?\s*({.*?})\s*```', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass
    
    # Try to find any JSON object in the text
    json_match = re.search(r'\{[^{}]*"category"[^{}]*"confidence"[^{}]*\}', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass
    
    # Last resort: try to find the first complete JSON object
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass
    
    raise ValueError(f"No valid JSON found in response: {text[:200]}")


def classify_email_gemini(
    email_text: str,
    api_key: str = None,
    max_retries: int = 2,
    timeout: int = 60
) -> Dict[str, Any]:
    """
    Classify email using Gemini via OpenRouter API.
    
    Args:
        email_text: The email content to classify
        api_key: OpenRouter API key (optional if OPENROUTER_API_KEY env var is set)
        max_retries: Number of retry attempts (default: 2, total 3 attempts)
        timeout: Request timeout in seconds (default: 60)
    
    Returns:
        dict: Classification result with category and confidence
              {"category": "Technical Support", "confidence": 0.95}
    
    Raises:
        dict: Error response matching API format:
              - {"error": "timeout", "detail": "...", "email_preview": "..."}
              - {"error": "parsing_error", "detail": "...", "email_preview": "..."}
              - {"error": "model_failure", "detail": "...", "email_preview": "..."}
    
    Example:
        result = classify_email_gemini("App crashes on startup")
        print(result["category"])  # "Technical Support"
        print(result["confidence"])  # 0.92
    """
    
    # Get API key from parameter or environment variable
    if api_key is None:
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError(
                "OpenRouter API key not provided. "
                "Pass api_key parameter or set OPENROUTER_API_KEY environment variable. "
                "Get your key from: https://openrouter.ai/keys"
            )
    
    # Valid categories for validation
    VALID_CATEGORIES = [
        "Technical Support",
        "Access Request",
        "Billing/Invoice",
        "Feature Request",
        "Hardware/Infrastructure",
        "How-To/Documentation",
        "Data Request",
        "Complaint/Escalation",
        "General Inquiry"
    ]
    
    # OpenRouter API endpoint
    api_url = "https://openrouter.ai/api/v1/chat/completions"
    
    # Build prompt
    prompt = build_classification_prompt_gemini(email_text)
    
    # Retry loop
    for attempt in range(max_retries + 1):
        try:
            print(f"🔍 Gemini Attempt {attempt + 1}/{max_retries + 1}: Classifying email...")
            
            # Prepare request
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/your-repo",  # Optional
                "X-Title": "Email Classification"  # Optional
            }
            
            payload = {
                "model": "google/gemini-2.5-flash-preview-09-2025",  # OpenRouter's Gemini model
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.2,
                "max_tokens": 256
            }
            
            # Make API request
            response = requests.post(
                api_url,
                headers=headers,
                json=payload,
                timeout=timeout
            )
            
            # Check for HTTP errors
            if response.status_code != 200:
                raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")
            
            # Parse response
            response_data = response.json()
            
            # Extract generated text
            if "choices" not in response_data or len(response_data["choices"]) == 0:
                raise ValueError(f"No choices in OpenRouter response: {response_data}")
            
            generated_text = response_data["choices"][0]["message"]["content"]
            
            print(f"📝 Gemini raw output: {generated_text[:150]}...")
            
            # Parse JSON from response
            result = parse_json_from_text(generated_text)
            
            # Validate required fields
            if "category" not in result or "confidence" not in result:
                raise ValueError(f"Missing required fields in response. Got keys: {result.keys()}")
            
            # Validate category is one of the 9 valid options
            if result["category"] not in VALID_CATEGORIES:
                raise ValueError(
                    f"Invalid category '{result['category']}'. "
                    f"Must be one of: {', '.join(VALID_CATEGORIES)}"
                )
            
            # Validate confidence is between 0 and 1
            confidence = float(result["confidence"])
            if not 0 <= confidence <= 1:
                raise ValueError(f"Confidence {confidence} must be between 0 and 1")
            
            # Return successful result
            classification_result = {
                "category": result["category"],
                "confidence": confidence
            }
            
            print(f"✅ Gemini classification: {classification_result['category']} (confidence: {classification_result['confidence']:.2f})")
            return classification_result
        
        except requests.exceptions.Timeout:
            print(f"⏱️ Gemini attempt {attempt + 1} timed out")
            if attempt == max_retries:
                return {
                    "error": "timeout",
                    "detail": f"Gemini classification exceeded {timeout}s timeout after {max_retries + 1} attempts",
                    "email_preview": email_text[:100]
                }
        
        except (json.JSONDecodeError, ValueError) as e:
            print(f"⚠️ Gemini attempt {attempt + 1} parsing/validation failed: {str(e)}")
            if attempt == max_retries:
                return {
                    "error": "parsing_error",
                    "detail": f"Failed to parse valid classification from Gemini after {max_retries + 1} attempts: {str(e)}",
                    "email_preview": email_text[:100]
                }
        
        except Exception as e:
            print(f"❌ Gemini attempt {attempt + 1} failed: {str(e)}")
            if attempt == max_retries:
                return {
                    "error": "model_failure",
                    "detail": f"Gemini classification failed after {max_retries + 1} attempts: {str(e)}",
                    "email_preview": email_text[:100]
                }
        
        # Wait briefly before retry (if not last attempt)
        if attempt < max_retries:
            import time
            time.sleep(1)


def classify_email_gemini_from_request(request_dict: Dict[str, Any], api_key: str = None) -> Dict[str, Any]:
    """
    Convenience wrapper that accepts request dictionary matching API format.
    
    Args:
        request_dict: Dictionary with "email_text" key
                     Example: {"email_text": "Server is down"}
        api_key: OpenRouter API key (optional if OPENROUTER_API_KEY env var is set)
    
    Returns:
        dict: Classification result {"category": "...", "confidence": 0.95}
              or error dict {"error": "...", "detail": "...", "email_preview": "..."}
    
    Example:
        request = {"email_text": "Need admin access"}
        result = classify_email_gemini_from_request(request)
    """
    if "email_text" not in request_dict:
        return {
            "error": "parsing_error",
            "detail": "Missing 'email_text' field in request",
            "email_preview": None
        }
    
    return classify_email_gemini(
        email_text=request_dict["email_text"],
        api_key=api_key
    )


# Example usage and testing
if __name__ == "__main__":
    print("=" * 70)
    print("Testing Gemini Classification Fallback (OpenRouter)")
    print("=" * 70)
    
    # Test cases for all 9 categories
    test_cases = [
        {
            "name": "Technical Support",
            "email_text": "Our application crashes when we try to upload files larger than 10MB. We're getting Error 500 on all endpoints."
        },
        {
            "name": "Access Request",
            "email_text": "Hi, I need admin rights to the dashboard. Can you please create a user account for our new team member?"
        },
        {
            "name": "Billing/Invoice",
            "email_text": "Can you send me the invoice for last month? I need the payment confirmation for our accounting department."
        },
        {
            "name": "Feature Request",
            "email_text": "Can you add an Excel export feature to the reports section? It would be really helpful for our data analysis."
        },
        {
            "name": "Hardware/Infrastructure",
            "email_text": "The server has been down for the past 2 hours. We need more RAM allocated to our instance."
        },
        {
            "name": "How-To/Documentation",
            "email_text": "How do I configure the SSL certificate for my domain? Where can I find the documentation for API integration?"
        },
        {
            "name": "Data Request",
            "email_text": "I need to export the last 6 months of transaction data. Can you generate a report with all user activities?"
        },
        {
            "name": "Complaint/Escalation",
            "email_text": "This is completely unacceptable! I've been waiting for 3 days with no response. I need to speak with a manager immediately."
        },
        {
            "name": "General Inquiry",
            "email_text": "What are your working hours? Do you provide support on weekends? What is your company's refund policy?"
        }
    ]
    
    print("\n⚠️  Set OPENROUTER_API_KEY environment variable or pass api_key parameter")
    print("    Get your key from: https://openrouter.ai/keys\n")
    
    # Check if API key is available
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("❌ OPENROUTER_API_KEY not found in environment variables")
        print("   Set it with: export OPENROUTER_API_KEY='your_key_here'")
        print("\nExample usage:")
        print("   result = classify_email_gemini('Server is down', api_key='your_key')")
        print("   print(result)")
    else:
        print("✅ API key found, running tests...\n")
        
        for i, test in enumerate(test_cases, 1):
            print(f"\n{'='*70}")
            print(f"Test {i}/{len(test_cases)}: Expected Category = {test['name']}")
            print(f"{'='*70}")
            print(f"Email: {test['email_text'][:80]}...")
            
            result = classify_email_gemini(test['email_text'])
            
            if "error" in result:
                print(f"\n❌ Error: {result['error']}")
                print(f"   Detail: {result['detail']}")
            else:
                print(f"\n✅ Result:")
                print(f"   Category:   {result['category']}")
                print(f"   Confidence: {result['confidence']:.2f}")
                print(f"   Match: {'✓' if result['category'] == test['name'] else '✗'}")
        
        print(f"\n{'='*70}")
        print("Testing complete!")
        print(f"{'='*70}")
