import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_NAME = "mrm8488/bert-tiny-finetuned-sms-spam-detection"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

model.eval()  # inference mode

def get_label_indices(model):
    """
    Robustly infer spam / non-spam indices
    Works even if labels are named LABEL_0 / LABEL_1
    """

    id2label = model.config.id2label
    label2id = {v.lower(): k for k, v in id2label.items()}

    # Case 1: Explicit labels
    if "spam" in label2id and ("ham" in label2id or "not_spam" in label2id):
        spam_idx = label2id["spam"]
        non_spam_idx = label2id.get("ham", label2id.get("not_spam"))
        return spam_idx, non_spam_idx

    # Case 2: Generic labels (LABEL_0 / LABEL_1)
    # For this specific model: LABEL_1 = spam, LABEL_0 = ham
    if len(id2label) == 2:
        return 1, 0

    raise ValueError(f"Unrecognized label format: {id2label}")

def classify_spam_bert_tiny(
    email_subject: str,
    email_body: str,
    confidence_threshold: float = 0.60
):
    """
    Returns:
    - label: 'spam' or 'non_spam'
    - confidence score
    """

    text = f"{email_subject}. {email_body}"

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=256
    )

    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=1)

    spam_idx, non_spam_idx = get_label_indices(model)

    spam_prob = probs[0][spam_idx].item()
    non_spam_prob = probs[0][non_spam_idx].item()

    confidence = abs(spam_prob - non_spam_prob)

    # Bias toward safety (non-spam)
    if spam_prob > non_spam_prob and spam_prob >= confidence_threshold:
        label = "spam"
    else:
        label = "non_spam"

    return {
        "label": label,
        "confidence": round(confidence, 3),
        "spam_probability": round(spam_prob, 3),
        "non_spam_probability": round(non_spam_prob, 3)
    }

result = classify_spam_bert_tiny(
    email_subject="App crashing during report generation",
    email_body="Our production application crashes while exporting reports. Please help."
)

print(result)