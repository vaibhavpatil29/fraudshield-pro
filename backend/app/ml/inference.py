import xgboost as xgb
import pickle
import json
import numpy as np
import os
from typing import Optional

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

# ── Load models once at startup ──────────────────────────────────────────────
print("Loading ML models...")
_xgb_model = xgb.XGBClassifier()
_xgb_model.load_model(os.path.join(MODEL_DIR, "xgb_model.json"))

with open(os.path.join(MODEL_DIR, "iso_model.pkl"), "rb") as f:
    _iso_model = pickle.load(f)

with open(os.path.join(MODEL_DIR, "iso_params.json")) as f:
    _iso_params = json.load(f)

with open(os.path.join(MODEL_DIR, "feature_cols.json")) as f:
    _feature_cols = json.load(f)

print(f"Models loaded. Features: {len(_feature_cols)}")

# ── SHAP explainer ───────────────────────────────────────────────────────────
import shap
_explainer = shap.TreeExplainer(_xgb_model)

def _get_shap_reasons(features: dict, shap_values: np.ndarray, top_n: int = 3) -> list:
    """Convert SHAP values to plain-English reasons."""
    feature_shap = list(zip(_feature_cols, shap_values))
    feature_shap.sort(key=lambda x: abs(x[1]), reverse=True)

    reasons = []
    for feature, value in feature_shap[:top_n]:
        direction = "increases" if value > 0 else "decreases"

        # Human-readable feature names
        labels = {
            "amount_log"     : "Transaction amount",
            "amount_scaled"  : "Transaction amount vs average",
            "is_night"       : "Transaction time (night)",
            "is_small_amount": "Very small amount (card testing pattern)",
            "is_large_amount": "Unusually large amount",
            "is_round_amount": "Round number amount",
            "hour"           : "Transaction hour",
        }
        label = labels.get(feature, feature)

        reasons.append({
            "feature"  : feature,
            "label"    : label,
            "shap_value": round(float(value), 4),
            "direction": direction,
            "impact"   : "high" if abs(value) > 0.3 else "medium" if abs(value) > 0.1 else "low"
        })
    return reasons

def score_transaction(transaction: dict) -> dict:
    """
    Score a single transaction.
    Returns fraud_score (0-1) + shap_reasons.
    """
    import pandas as pd

    # Build feature vector — fill missing features with 0
    feature_vector = {col: 0.0 for col in _feature_cols}

    # Map transaction fields to features
    if "amount" in transaction:
        amount = float(transaction["amount"])
        feature_vector["amount_log"]      = np.log1p(amount)
        feature_vector["amount_scaled"]   = (amount - 88.35) / 250.12
        feature_vector["is_round_amount"] = 1 if amount % 10 == 0 else 0
        feature_vector["is_small_amount"] = 1 if amount < 10 else 0
        feature_vector["is_large_amount"] = 1 if amount > 1000 else 0

    from datetime import datetime
    hour = datetime.now().hour
    feature_vector["hour"]       = hour
    feature_vector["is_night"]   = 1 if (hour >= 22 or hour <= 5) else 0
    feature_vector["is_weekend"] = 1 if datetime.now().weekday() >= 5 else 0

    df = pd.DataFrame([feature_vector])[_feature_cols]

    # XGBoost score
    xgb_proba = float(_xgb_model.predict_proba(df)[0][1])

    # Isolation Forest score
    iso_raw   = float(_iso_model.decision_function(df)[0])
    iso_min   = _iso_params["min_score"]
    iso_max   = _iso_params["max_score"]
    iso_proba = 1 - (iso_raw - iso_min) / (iso_max - iso_min)
    iso_proba = float(np.clip(iso_proba, 0, 1))

    # Combined score
    fraud_score = round(0.7 * xgb_proba + 0.3 * iso_proba, 4)

    # SHAP reasons
    shap_values = _explainer.shap_values(df)[0]
    reasons     = _get_shap_reasons(feature_vector, shap_values)

    return {
        "fraud_score"  : fraud_score,
        "xgb_score"    : round(xgb_proba, 4),
        "iso_score"    : round(iso_proba, 4),
        "is_fraud"     : fraud_score >= 0.5,
        "shap_reasons" : reasons
    }