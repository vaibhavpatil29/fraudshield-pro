# FraudShield Pro

Real-time payment fraud detection platform.

## Tech Stack
- **Backend**: FastAPI, PostgreSQL, Redis, Kafka (Redpanda)
- **ML**: XGBoost, Isolation Forest, SHAP, MLflow
- **Frontend**: React, TypeScript, Tailwind CSS, Recharts

## Quick Start (Week 1)

### Prerequisites
- Docker Desktop installed and running
- Python 3.11+
- Node.js 20+

### 1. Start all infrastructure
```bash
docker compose up -d
```

### 2. Start backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### 3. Start frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Verify everything works
```bash
make verify
```

Visit http://localhost:8000/health — should return `{"status":"ok"}`
Visit http://localhost:8080 — Redpanda Console (Kafka UI)
Visit http://localhost:5173 — React frontend

## Project Structure
```
fraudshield-pro/
├── backend/          # FastAPI + Python
│   ├── app/
│   │   ├── api/      # Route handlers (Week 2+)
│   │   ├── core/     # Config, DB, Redis connections
│   │   ├── models/   # SQLAlchemy models (Week 2)
│   │   ├── schemas/  # Pydantic request/response schemas
│   │   ├── services/ # Business logic
│   │   └── ml/       # ML inference engine (Week 6)
│   └── alembic/      # Database migrations
├── frontend/         # React + TypeScript
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── services/
├── ml/               # Jupyter notebooks + training scripts
│   ├── notebooks/    # EDA, training (Week 4-5)
│   ├── data/         # Dataset (gitignored)
│   └── models/       # Saved models (gitignored)
└── docker-compose.yml
```

## Build Timeline
16-week solo build — see full schedule in project docs.
