<div align="center">

# 🛡️ FraudShield Pro

### Real-time Payment Fraud Detection Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://python.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-AUC--ROC%200.97-FF6600?style=flat-square)](https://xgboost.readthedocs.io)
[![Kafka](https://img.shields.io/badge/Kafka-Redpanda-E34F26?style=flat-square)](https://redpanda.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**FraudShield Pro** is a production-grade, real-time payment fraud detection platform that automatically scores every transaction using machine learning, explains why it was flagged using SHAP, and routes alerts to analysts via a live React dashboard — all in under 100ms.

[Live Demo](#) · [Architecture](#architecture) · [Quick Start](#quick-start) · [API Docs](#api-documentation)

![FraudShield Dashboard](https://via.placeholder.com/1200x600/1e293b/6366f1?text=FraudShield+Pro+Dashboard)

</div>

---

## ✨ What it does

When a payment is submitted:

1. **Transaction is saved** to PostgreSQL and published to Kafka instantly (async — no waiting for scoring)
2. **User behavioral profile** is updated in Redis — avg spend, known merchants, known devices
3. **ML engine** scores the transaction using XGBoost + Isolation Forest (AUC-ROC: 0.97)
4. **SHAP explains** why — "Amount 4× above user average", "New device detected", "Transaction at 3am"
5. **Rule engine** applies business rules — "flag if amount > ₹50,000", "block if amount > ₹1,00,000"
6. **Fraud alert** created automatically if flagged or blocked
7. **Dashboard updates** in real time — analyst sees the alert, SHAP reasons, and can mark it True/False positive

**The entire pipeline runs in under 2 seconds.**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                              │
│   React Dashboard (Port 5173)     Live Alerts · Charts · Rules │
└──────────────────────┬──────────────────────────────────────────┘
                       │ REST API + Poll
┌──────────────────────▼──────────────────────────────────────────┐
│                       BACKEND TIER                              │
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │  FastAPI        │    │  Kafka Consumer  │                   │
│  │  (Port 8000)    │    │  (Scoring Engine)│                   │
│  │                 │    │                  │                   │
│  │  POST /txn ─────┼────► txn.raw topic   │                   │
│  │  GET /alerts    │    │  ↓               │                   │
│  │  GET /stats     │    │  ML Inference    │                   │
│  │  POST /rules    │    │  (XGB + IsoForest│                   │
│  └────────┬────────┘    │  + SHAP)         │                   │
│           │              │  ↓               │                   │
│           │              │  Rule Engine     │                   │
│           │              │  ↓               │                   │
│           │              │  Alert Created   │                   │
│           │              └──────────────────┘                   │
└───────────┼──────────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────────┐
│                       STORAGE TIER                               │
│                                                                  │
│  PostgreSQL (Port 5433)    Redis (Port 6379)    Redpanda (Kafka) │
│  users · transactions      user behavioral      txn.raw topic    │
│  fraud_alerts · rules      profiles (hot)       txn.scored topic │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://docker.com/products/docker-desktop) (required)
- Python 3.11+
- Node.js 20+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/vaibhav29v/fraudshield-pro.git
cd fraudshield-pro
```

### 2. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, and Redpanda (Kafka) as Docker containers.

### 3. Set up the backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python create_tables.py
uvicorn app.main:app --reload --port 8000
```

### 4. Set up the frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

### 5. Set up the ML environment

```bash
# In a new terminal
cd ml
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Download dataset (requires Kaggle API key)
python scripts/download_dataset.py

# Train models
python scripts/eda_and_features.py
python scripts/train_model.py

# Copy trained models to backend
cp models/ ../backend/app/ml/models/
```

### 6. Open the dashboard

Visit `http://localhost:5173` and log in with your registered credentials.

---

## 🗄️ Database Schema

```sql
users              — analyst accounts with role-based access (analyst/admin)
transactions       — every payment with amount, merchant, device, fraud_score, shap_reasons
fraud_alerts       — flagged transactions awaiting analyst review
rules              — configurable fraud detection rules (field/operator/value/action)
refresh_tokens     — JWT refresh token store with rotation
```

---

## 🤖 ML Pipeline

### Dataset
- **Kaggle Credit Card Fraud Detection** — 284,807 transactions, 492 fraud cases
- Severe class imbalance: **0.17% fraud rate (1:577 ratio)**

### Feature Engineering
| Feature | Description |
|---|---|
| `amount_log` | Log-transformed transaction amount |
| `amount_scaled` | Z-score vs dataset mean |
| `is_night` | Transaction between 10pm–5am |
| `is_small_amount` | Amount < ₹10 (card testing pattern) |
| `is_large_amount` | Amount > ₹1,000 |
| `is_round_amount` | Round number (suspicious pattern) |
| `hour` | Hour of transaction |
| `V1–V28` | PCA-transformed bank features |

### Class Imbalance Handling
- **SMOTE** oversampling on training set
- Before: 344 fraud vs 199,020 legitimate
- After: 199,020 vs 199,020 (balanced)
- Primary metrics: **F1 Score + AUC-ROC** (not accuracy)

### Model Performance
| Metric | XGBoost | Combined (XGB 70% + IsoForest 30%) |
|---|---|---|
| AUC-ROC | **0.9705** | 0.9680 |
| Recall | **0.8378** | 0.8378 |
| F1 Score | 0.2805 | **0.4092** |
| True Positives | 62/74 | 62/74 |
| False Negatives | 12/74 | 12/74 |

> Recall of 84% means the system catches 84 out of every 100 fraud cases.

### Explainability
Every fraud decision includes SHAP values translated into plain English:
```json
{
  "fraud_score": 0.82,
  "shap_reasons": [
    { "label": "Transaction amount", "direction": "increases", "impact": "high" },
    { "label": "New device detected", "direction": "increases", "impact": "high" },
    { "label": "Transaction hour (night)", "direction": "increases", "impact": "medium" }
  ]
}
```

---

## ⚙️ Rule Engine

Analysts can configure fraud rules without writing code:

| Field | Operator | Value | Action |
|---|---|---|---|
| `amount` | `greater_than` | 50000 | `flag` |
| `amount` | `greater_than` | 100000 | `block` |
| `amount` | `less_than` | 10 | `flag` (card testing) |
| `fraud_score` | `greater_than` | 0.6 | `flag` |
| `fraud_score` | `greater_than` | 0.85 | `block` |

Rules are evaluated **after** ML scoring. The final transaction status is determined by the highest-priority triggered rule or the ML score threshold.

---

## 🔌 API Documentation

Full Swagger UI available at `http://localhost:8000/docs`

### Authentication
```bash
# Register
POST /auth/register
{ "email": "analyst@company.com", "password": "secure123", "full_name": "Analyst Name" }

# Login
POST /auth/login
→ Returns access_token + refresh_token

# All other endpoints require: Authorization: Bearer <access_token>
```

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/transactions` | Submit a transaction for scoring |
| `GET` | `/transactions` | List transactions (filterable by status) |
| `GET` | `/transactions/stats/summary` | Dashboard statistics |
| `GET` | `/alerts` | List fraud alerts |
| `PATCH` | `/alerts/{id}` | Mark alert as true/false positive |
| `GET` | `/rules` | List fraud rules |
| `POST` | `/rules` | Create a new rule (admin only) |
| `POST` | `/ml/score` | Score a transaction directly |

---

## 🧪 Transaction Simulator

The built-in simulator fires realistic transactions at the API for demo and testing:

```bash
# From backend directory (venv activated)
python -m app.services.simulator
```

Or use the **Simulator** page in the dashboard — configure total transactions and fraud rate, then click Run.

Injected fraud patterns:
- **High amount** — ₹55,000–₹1,50,000 from unknown merchants
- **Card testing** — multiple transactions under ₹10
- **Account takeover** — new device + high amount + suspicious merchant

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **API** | FastAPI (Python) | Async, fast, auto-generates Swagger docs |
| **Streaming** | Kafka (Redpanda) | Decouples API from ML — no blocking on scoring |
| **ML** | XGBoost + Isolation Forest | Fast inference, explainable, handles imbalance |
| **Explainability** | SHAP | Per-prediction feature attribution in plain English |
| **Cache** | Redis | Sub-millisecond user profile reads |
| **Database** | PostgreSQL | Transactions, alerts, rules, users |
| **Frontend** | React + Recharts | Live dashboard with charts and alert management |
| **Auth** | JWT (access + refresh tokens) | Stateless, role-based, secure |
| **Infrastructure** | Docker Compose | One command to start all services |
| **ML Tracking** | MLflow | Experiment tracking, model versioning |

---

## 📁 Project Structure

```
fraudshield-pro/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # FastAPI route handlers
│   │   │   ├── auth.py          # Register, login, refresh, /me
│   │   │   ├── transactions.py  # Transaction CRUD + stats
│   │   │   ├── alerts.py        # Alert management
│   │   │   ├── rules.py         # Rule CRUD
│   │   │   └── ml.py            # Direct ML scoring endpoint
│   │   ├── core/                # Config, DB, Redis, JWT, dependencies
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── kafka_producer.py    # Publishes txns to Kafka
│   │   │   ├── scoring_consumer.py  # Kafka consumer + ML + rules
│   │   │   ├── rule_engine.py       # Business rule evaluation
│   │   │   ├── user_profile.py      # Redis behavioral profiling
│   │   │   └── simulator.py         # Transaction simulator
│   │   └── ml/
│   │       ├── inference.py         # XGBoost + IsoForest + SHAP
│   │       └── models/              # Trained model files
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── pages/               # Dashboard, Alerts, Transactions, Rules, Simulator
│       ├── components/          # Layout, sidebar, nav
│       ├── services/            # Axios API client with JWT interceptor
│       └── store/               # Zustand (auth + theme)
├── ml/
│   ├── scripts/
│   │   ├── download_dataset.py      # Kaggle dataset download
│   │   ├── eda_and_features.py      # EDA + SMOTE + feature engineering
│   │   └── train_model.py           # XGBoost + IsoForest training
│   └── notebooks/               # Jupyter EDA notebooks
└── docker-compose.yml
```

---

## 📊 Key Design Decisions

**Why Kafka instead of direct HTTP calls to ML?**
Decoupling. The ingestion API never waits for scoring — it publishes to Kafka and returns in <10ms. If the ML engine is slow or temporarily down, transactions queue up and get scored when it recovers. Zero data loss.

**Why XGBoost instead of a neural network?**
Three reasons: (1) XGBoost inference is 3–5ms vs 20–50ms for a neural network. (2) SHAP works natively with tree models — every prediction is explainable. (3) XGBoost handles the 1:577 class imbalance via `scale_pos_weight`. Neural networks would need more data and tuning for the same result.

**Why Isolation Forest alongside XGBoost?**
XGBoost learns from labeled historical fraud. Isolation Forest catches novel fraud patterns that don't match training data — no labels needed. The combination (70% XGB + 30% IsoForest) is more robust than either alone.

**Why Redis for user profiles?**
Every transaction scoring call reads the user's profile (avg amount, known devices, etc.). PostgreSQL would add 5–10ms per read. Redis reads in <1ms and never becomes a bottleneck.

---

## 🔐 Security

- JWT Bearer authentication on all API endpoints
- Role-based access: `analyst` (review alerts) vs `admin` (manage rules)
- Refresh token rotation — compromised tokens auto-invalidate
- bcrypt password hashing (cost factor 12)
- CORS configured to allow only the frontend origin
- API rate limiting via slowapi (100 req/min per IP)

---

## 🎓 Project Context

Built as a final year B.Tech Computer Science major project demonstrating:
- **Full-stack development** — Python backend + React frontend
- **Machine learning** — training, evaluation, class imbalance handling, explainability
- **System design** — event-driven architecture, async processing, horizontal scalability
- **Production engineering** — JWT auth, Docker, CI/CD, monitoring

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built by <strong>Vaibhav</strong> · B.Tech Computer Science · 2026<br/>
  <a href="https://linkedin.com/in/vaibhav29v">LinkedIn</a> ·
  <a href="https://github.com/vaibhav29">GitHub</a>
</div>
