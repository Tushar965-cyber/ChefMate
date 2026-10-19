"""
ChefMate - Intent Classification Model Training
Implements Step 7 of the PRD:
- Loads training_data.json
- Vectorizes natural language input (TF-IDF)
- Trains an intent classifier (MultinomialNB / Logistic Regression)
- Evaluates accuracy and outputs classification metrics
- Saves the trained model and vocabulary locally for chatbot inference
"""

import json
import math
import os
import pickle
import re
from collections import Counter, defaultdict
from typing import Dict, List, Tuple, Any

_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(_DIR, "data", "training_data.json") if os.path.exists(os.path.join(_DIR, "data", "training_data.json")) else os.path.join(_DIR, "training_data.json")
MODEL_PATH = os.path.join(_DIR, "intent_model.pkl")



def tokenize(text: str) -> List[str]:
    """Simple lowercase regex tokenizer."""
    return re.findall(r"\b[a-z]{2,}\b", text.lower())


# ─────────────────────────────────────────────────────────────────────────────
# Pure Python Fallback TF-IDF + Naive Bayes Classifier
# Runs without external dependencies if scikit-learn is not installed.
# ─────────────────────────────────────────────────────────────────────────────

class LocalNaiveBayesClassifier:
    """A clean, self-contained TF-IDF + Multinomial Naive Bayes classifier."""

    def __init__(self):
        self.classes: List[str] = []
        self.vocab: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.class_priors: Dict[str, float] = {}
        self.feature_probs: Dict[str, Dict[str, float]] = {}

    def fit(self, texts: List[str], labels: List[str]):
        self.classes = sorted(list(set(labels)))
        doc_count = len(texts)
        doc_freq = Counter()

        # Build vocabulary & document frequencies
        tokenized_docs = [tokenize(t) for t in texts]
        for tokens in tokenized_docs:
            for term in set(tokens):
                doc_freq[term] += 1

        self.vocab = {term: idx for idx, term in enumerate(sorted(doc_freq.keys()))}
        for term, df in doc_freq.items():
            # Smooth IDF
            self.idf[term] = math.log((1.0 + doc_count) / (1.0 + df)) + 1.0

        # Class counts
        label_counts = Counter(labels)
        for c in self.classes:
            self.class_priors[c] = math.log(label_counts[c] / doc_count)

        # Word counts per class with TF-IDF weights
        class_term_weights = defaultdict(lambda: Counter())
        class_total_weights = defaultdict(float)

        for tokens, label in zip(tokenized_docs, labels):
            tf = Counter(tokens)
            doc_len = len(tokens) or 1
            for term, count in tf.items():
                tfidf = (count / doc_len) * self.idf.get(term, 1.0)
                class_term_weights[label][term] += tfidf
                class_total_weights[label] += tfidf

        # Calculate feature log probabilities with Laplace smoothing
        vocab_size = len(self.vocab)
        self.feature_probs = {}
        for c in self.classes:
            self.feature_probs[c] = {}
            denom = class_total_weights[c] + vocab_size
            for term in self.vocab:
                num = class_term_weights[c][term] + 1.0
                self.feature_probs[c][term] = math.log(num / denom)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "classes": self.classes,
            "vocab": self.vocab,
            "idf": self.idf,
            "class_priors": self.class_priors,
            "feature_probs": self.feature_probs,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "LocalNaiveBayesClassifier":
        inst = cls()
        inst.classes = data["classes"]
        inst.vocab = data["vocab"]
        inst.idf = data["idf"]
        inst.class_priors = data["class_priors"]
        inst.feature_probs = data["feature_probs"]
        return inst

    def predict_one(self, text: str) -> str:
        tokens = tokenize(text)
        if not tokens:
            return "ask_recipe"

        best_score = -float("inf")
        best_class = self.classes[0]

        for c in self.classes:
            score = self.class_priors[c]
            for t in tokens:
                if t in self.vocab:
                    score += self.feature_probs[c].get(t, -10.0)
            if score > best_score:
                best_score = score
                best_class = c

        return best_class

    def predict(self, texts: List[str]) -> List[str]:
        return [self.predict_one(t) for t in texts]


# ─────────────────────────────────────────────────────────────────────────────
# Training Routine
# ─────────────────────────────────────────────────────────────────────────────

def train_and_evaluate():
    print(f"Loading training data from: {DATA_PATH}")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Training data not found at {DATA_PATH}")

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    texts = [item["text"] for item in data]
    labels = [item["intent"] for item in data]

    print(f"Total samples: {len(texts)}")
    print(f"Unique intents ({len(set(labels))}): {sorted(list(set(labels)))}\n")

    # Simple 80/20 train-test split without external dependencies
    indices = list(range(len(texts)))
    # Deterministic split (every 5th sample goes to test set)
    train_idx = [i for i in indices if i % 5 != 0]
    test_idx = [i for i in indices if i % 5 == 0]

    train_texts = [texts[i] for i in train_idx]
    train_labels = [labels[i] for i in train_idx]
    test_texts = [texts[i] for i in test_idx]
    test_labels = [labels[i] for i in test_idx]

    # Try scikit-learn first; fall back to local model if unavailable
    sklearn_available = False
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.naive_bayes import MultinomialNB
        from sklearn.pipeline import Pipeline
        from sklearn.metrics import classification_report, accuracy_score

        sklearn_available = True
        print("[Engine] Using scikit-learn Pipeline (TfidfVectorizer + MultinomialNB)")
        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
            ("clf", MultinomialNB(alpha=0.5)),
        ])

        pipeline.fit(train_texts, train_labels)
        preds = pipeline.predict(test_texts)
        acc = accuracy_score(test_labels, preds)

        print(f"Validation Accuracy: {acc * 100:.2f}%\n")
        print("Classification Report:")
        print(classification_report(test_labels, preds, zero_division=0))

        # Save model
        with open(MODEL_PATH, "wb") as f:
            pickle.dump({"type": "sklearn", "model": pipeline}, f)

    except ImportError:
        print("[Engine] scikit-learn not found. Using built-in TF-IDF + Naive Bayes Classifier.")
        model = LocalNaiveBayesClassifier()
        model.fit(train_texts, train_labels)

        preds = model.predict(test_texts)
        correct = sum(1 for p, t in zip(preds, test_labels) if p == t)
        acc = (correct / len(test_labels)) * 100.0

        print(f"Validation Accuracy: {acc:.2f}%\n")
        print("Test Evaluation Details:")
        for text, actual, pred in zip(test_texts[:10], test_labels[:10], preds[:10]):
            mark = "[OK]" if actual == pred else "[X] "
            print(f"  {mark} [{actual}] -> Predicted: [{pred}] | \"{text}\"")

        # Save model
        with open(MODEL_PATH, "wb") as f:
            pickle.dump({"type": "local", "model": model.to_dict()}, f)

    print(f"\nTrained intent model successfully saved to: {MODEL_PATH}")


def load_model():
    """Loads the trained model for chatbot predictions."""
    if not os.path.exists(MODEL_PATH):
        train_and_evaluate()

    with open(MODEL_PATH, "rb") as f:
        pkg = pickle.load(f)
        if pkg.get("type") == "local":
            return LocalNaiveBayesClassifier.from_dict(pkg["model"])
        return pkg["model"]


def predict_intent(text: str) -> str:
    """Predicts the intent of a single user input string."""
    model = load_model()
    if hasattr(model, "predict_one"):
        return model.predict_one(text)
    else:
        return model.predict([text])[0]


if __name__ == "__main__":
    train_and_evaluate()
