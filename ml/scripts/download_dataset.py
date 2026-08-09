"""
Download the Kaggle Credit Card Fraud dataset.
Setup: pip install kaggle, save API key to ~/.kaggle/kaggle.json
Run:   python ml/scripts/download_dataset.py
"""
import subprocess, os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(DATA_DIR, exist_ok=True)
subprocess.run(["kaggle", "datasets", "download", "-d", "mlg-ulb/creditcardfraud",
                "-p", DATA_DIR, "--unzip"], check=True)
print("Done: ml/data/creditcard.csv — 284,807 transactions, 492 fraud cases")
