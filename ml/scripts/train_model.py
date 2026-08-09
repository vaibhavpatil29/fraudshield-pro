import pandas as pd
import numpy as np
import json, os, time
import xgboost as xgb
from sklearn.ensemble import IsolationForest
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_auc_score, f1_score, precision_score, recall_score
)
import pickle

# ── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("FRAUDSHIELD PRO — Week 5: Model Training")
print("=" * 60)

# ── 1. Load processed data ───────────────────────────────────────────────────
print("\n[1/5] Loading processed datasets...")
X_train = pd.read_parquet(os.path.join(DATA_DIR, "X_train.parquet"))
y_train = pd.read_parquet(os.path.join(DATA_DIR, "y_train.parquet")).squeeze()
X_val   = pd.read_parquet(os.path.join(DATA_DIR, "X_val.parquet"))
y_val   = pd.read_parquet(os.path.join(DATA_DIR, "y_val.parquet")).squeeze()
X_test  = pd.read_parquet(os.path.join(DATA_DIR, "X_test.parquet"))
y_test  = pd.read_parquet(os.path.join(DATA_DIR, "y_test.parquet")).squeeze()

print(f"  Train: {X_train.shape} | Val: {X_val.shape} | Test: {X_test.shape}")

with open(os.path.join(MODEL_DIR, "feature_cols.json")) as f:
    feature_cols = json.load(f)
print(f"  Features: {len(feature_cols)}")

# ── 2. Train XGBoost ─────────────────────────────────────────────────────────
print("\n[2/5] Training XGBoost classifier...")
start = time.time()

xgb_model = xgb.XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=1,  # SMOTE already balanced — no need to adjust
    eval_metric="auc",
    early_stopping_rounds=20,
    random_state=42,
    n_jobs=-1,
    verbosity=0
)

xgb_model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=50
)

xgb_time = time.time() - start
print(f"  Training time: {xgb_time:.1f}s")
print(f"  Best iteration: {xgb_model.best_iteration}")

# ── 3. Train Isolation Forest ────────────────────────────────────────────────
print("\n[3/5] Training Isolation Forest (anomaly detection)...")
start = time.time()

# Train only on legitimate transactions (unsupervised)
X_legit = X_train[y_train == 0].sample(n=50000, random_state=42)

iso_model = IsolationForest(
    n_estimators=200,
    contamination=0.001,
    random_state=42,
    n_jobs=-1
)
iso_model.fit(X_legit)

iso_time = time.time() - start
print(f"  Training time: {iso_time:.1f}s")

# ── 4. Evaluate models ───────────────────────────────────────────────────────
print("\n[4/5] Evaluating on test set...")

# XGBoost predictions
xgb_proba = xgb_model.predict_proba(X_test)[:, 1]
xgb_pred  = (xgb_proba >= 0.5).astype(int)

# Isolation Forest predictions (convert to 0-1 score)
iso_scores = iso_model.decision_function(X_test)
iso_proba  = 1 - (iso_scores - iso_scores.min()) / (iso_scores.max() - iso_scores.min())

# Combined score: 70% XGBoost + 30% Isolation Forest
combined_proba = 0.7 * xgb_proba + 0.3 * iso_proba
combined_pred  = (combined_proba >= 0.5).astype(int)

print("\n  --- XGBoost Results ---")
print(f"  AUC-ROC  : {roc_auc_score(y_test, xgb_proba):.4f}")
print(f"  F1 Score : {f1_score(y_test, xgb_pred):.4f}")
print(f"  Precision: {precision_score(y_test, xgb_pred):.4f}")
print(f"  Recall   : {recall_score(y_test, xgb_pred):.4f}")

print("\n  --- Combined Model Results (XGB 70% + IsoForest 30%) ---")
print(f"  AUC-ROC  : {roc_auc_score(y_test, combined_proba):.4f}")
print(f"  F1 Score : {f1_score(y_test, combined_pred):.4f}")
print(f"  Precision: {precision_score(y_test, combined_pred):.4f}")
print(f"  Recall   : {recall_score(y_test, combined_pred):.4f}")

print("\n  Confusion Matrix (Combined):")
cm = confusion_matrix(y_test, combined_pred)
print(f"  True Negatives  (correct legit) : {cm[0][0]:,}")
print(f"  False Positives (wrong fraud)   : {cm[0][1]:,}")
print(f"  False Negatives (missed fraud)  : {cm[1][0]:,}")
print(f"  True Positives  (caught fraud)  : {cm[1][1]:,}")

# ── 5. Save models ───────────────────────────────────────────────────────────
print("\n[5/5] Saving models...")

xgb_model.save_model(os.path.join(MODEL_DIR, "xgb_model.json"))

with open(os.path.join(MODEL_DIR, "iso_model.pkl"), "wb") as f:
    pickle.dump(iso_model, f)

# Save normalization params for Isolation Forest scores
iso_params = {
    "min_score": float(iso_scores.min()),
    "max_score": float(iso_scores.max())
}
with open(os.path.join(MODEL_DIR, "iso_params.json"), "w") as f:
    json.dump(iso_params, f)

print(f"  Saved: ml/models/xgb_model.json")
print(f"  Saved: ml/models/iso_model.pkl")
print(f"  Saved: ml/models/iso_params.json")

print("\n" + "=" * 60)
print("Week 5 COMPLETE — Models trained and saved!")
print("Ready for Week 6: SHAP explainability + inference API")
print("=" * 60)