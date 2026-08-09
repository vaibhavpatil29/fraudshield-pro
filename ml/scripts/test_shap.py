import pandas as pd
import numpy as np
import xgboost as xgb
import shap
import json, os, pickle

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models")

print("Loading model and test data...")
xgb_model = xgb.XGBClassifier()
xgb_model.load_model(os.path.join(MODEL_DIR, "xgb_model.json"))

X_test = pd.read_parquet(os.path.join(DATA_DIR, "X_test.parquet"))

with open(os.path.join(MODEL_DIR, "feature_cols.json")) as f:
    feature_cols = json.load(f)

print("Computing SHAP values for 5 sample transactions...")
explainer = shap.TreeExplainer(xgb_model)
sample = X_test[feature_cols].head(5)
shap_values = explainer.shap_values(sample)

print("\nTop 3 SHAP reasons for transaction 1:")
shap_row = shap_values[0]
feature_importance = list(zip(feature_cols, shap_row))
feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)

for feature, value in feature_importance[:3]:
    direction = "increases" if value > 0 else "decreases"
    print(f"  {feature}: {direction} fraud risk by {abs(value):.4f}")

fraud_proba = xgb_model.predict_proba(sample)[0][1]
print(f"\nFraud probability: {fraud_proba:.4f}")
print("\nSHAP working correctly!")