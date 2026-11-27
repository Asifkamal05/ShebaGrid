import os
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

app = FastAPI()

MODEL_PATH = "./urgency_model" if os.path.exists("./urgency_model") else "csebuetnlp/banglabert"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH, num_labels=5)
model.eval()


class UrgencyRequest(BaseModel):
    text: str
    category: str


@app.post("/predict-urgency")
def predict_urgency(req: UrgencyRequest):
    combined = f"[{req.category}] {req.text}"
    inputs = tokenizer(combined, return_tensors="pt", truncation=True, max_length=128, padding=True)
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=-1)[0]
        urgency = int(torch.argmax(probs).item()) + 1  # Maps 0..4 -> 1..5
        confidence = float(torch.max(probs).item())

    return {
        "urgency": urgency,
        "confidence": confidence,
        "reasons": [f"BanglaBERT predicted urgency {urgency}/5 ({confidence:.0%} confidence)"],
    }