import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
import matplotlib
matplotlib.use('Agg')  # Windows-safe backend
import matplotlib.pyplot as plt
import seaborn as sns
import os

# ── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("FRAUDSHIELD PRO — Week 4: EDA + Feature Engineering")
print("=" * 60)

# ── 1. Load dataset ─────────────────────────────────────────────────────────
print("\n[1/6] Loading dataset...")
df = pd.read_csv(os.path.join(DATA_DIR, "creditcard.csv"))
print(f"  Shape: {df.shape}")
print(f"  Columns: {list(df.columns)}")

# ── 2. Class imbalance check ────────────────────────────────────────────────
print("\n[2/6] Checking class imbalance...")
fraud_count = df['Class'].sum()
total = len(df)
fraud_rate = fraud_count / total * 100
print(f"  Total transactions : {total:,}")
print(f"  Fraud cases        : {fraud_count:,}")
print(f"  Legitimate cases   : {total - fraud_count:,}")
print(f"  Fraud rate         : {fraud_rate:.4f}%")
print(f"  ⚠ Class imbalance ratio: 1:{int((total-fraud_count)/fraud_count)}")

# ── 3. Basic stats ───────────────────────────────────────────────────────────
print("\n[3/6] Dataset statistics...")
print(f"  Missing values: {df.isnull().sum().sum()}")
print(f"  Amount range  : ₹{df['Amount'].min():.2f} — ₹{df['Amount'].max():.2f}")
print(f"  Avg amount    : ₹{df['Amount'].mean():.2f}")
print(f"  Avg fraud amt : ₹{df[df['Class']==1]['Amount'].mean():.2f}")
print(f"  Avg legit amt : ₹{df[df['Class']==0]['Amount'].mean():.2f}")

# ── 4. Feature engineering ───────────────────────────────────────────────────
print("\n[4/6] Engineering features...")

# Time-based features
df['hour'] = (df['Time'] % 86400) // 3600
df['is_night'] = ((df['hour'] >= 22) | (df['hour'] <= 5)).astype(int)
df['is_weekend'] = (df['Time'] // 86400 % 7 >= 5).astype(int)

# Amount-based features
df['amount_log'] = np.log1p(df['Amount'])
df['amount_scaled'] = StandardScaler().fit_transform(df[['Amount']])
df['is_round_amount'] = (df['Amount'] % 10 == 0).astype(int)
df['is_small_amount'] = (df['Amount'] < 10).astype(int)  # card testing pattern
df['is_large_amount'] = (df['Amount'] > 1000).astype(int)

print(f"  Added features: hour, is_night, is_weekend, amount_log,")
print(f"                  amount_scaled, is_round_amount,")
print(f"                  is_small_amount, is_large_amount")

# ── 5. Prepare features and target ───────────────────────────────────────────
print("\n[5/6] Preparing train/val/test split...")

# Drop raw columns we've transformed
drop_cols = ['Time', 'Amount']
feature_cols = [c for c in df.columns if c not in drop_cols + ['Class']]

X = df[feature_cols]
y = df['Class']

print(f"  Features used: {len(feature_cols)}")
print(f"  Feature list : {feature_cols}")

# Split: 70% train, 15% val, 15% test
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.30, random_state=42, stratify=y
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
)

print(f"  Train size : {len(X_train):,} ({y_train.sum()} fraud)")
print(f"  Val size   : {len(X_val):,} ({y_val.sum()} fraud)")
print(f"  Test size  : {len(X_test):,} ({y_test.sum()} fraud)")

# ── 6. Apply SMOTE to training set only ──────────────────────────────────────
print("\n[6/6] Applying SMOTE to balance training set...")
smote = SMOTE(random_state=42)
X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)

print(f"  Before SMOTE: {y_train.sum()} fraud / {len(y_train)-y_train.sum()} legit")
print(f"  After SMOTE : {y_train_bal.sum()} fraud / {(y_train_bal==0).sum()} legit")
print(f"  New train size: {len(X_train_bal):,}")

# ── Save processed data ───────────────────────────────────────────────────────
print("\nSaving processed datasets...")
X_train_bal.to_parquet(os.path.join(DATA_DIR, "X_train.parquet"), index=False)
y_train_bal.to_frame().to_parquet(os.path.join(DATA_DIR, "y_train.parquet"), index=False)
X_val.to_parquet(os.path.join(DATA_DIR, "X_val.parquet"), index=False)
y_val.to_frame().to_parquet(os.path.join(DATA_DIR, "y_val.parquet"), index=False)
X_test.to_parquet(os.path.join(DATA_DIR, "X_test.parquet"), index=False)
y_test.to_frame().to_parquet(os.path.join(DATA_DIR, "y_test.parquet"), index=False)

# Save feature list for use in training script
import json
with open(os.path.join(MODEL_DIR, "feature_cols.json"), "w") as f:
    json.dump(feature_cols, f)

print(f"  Saved to ml/data/ — 6 parquet files")
print(f"  Saved feature list to ml/models/feature_cols.json")

print("\n" + "=" * 60)
print("Week 4 COMPLETE — Ready for model training (Week 5)")
print("=" * 60)