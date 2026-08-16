from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from app.core.config import settings
from app.core.database import engine, Base
from app.models.user import User, RefreshToken
from app.models.transaction import Transaction, FraudAlert
from app.models.rule import Rule
from app.api.routes.auth import router as auth_router
from app.api.routes.transactions import router as transactions_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.rules import router as rules_router
from app.api.routes.ml import router as ml_router
from app.services.kafka_producer import close_producer
from app.services.scoring_consumer import start_scoring_consumer

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create all database tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created/verified")

    # Start Kafka scoring consumer
    consumer_task = asyncio.create_task(start_scoring_consumer())
    yield

    # Shutdown
    consumer_task.cancel()
    await close_producer()

app = FastAPI(
    title="FraudShield Pro",
    version="1.0.0",
    description="Real-time payment fraud detection platform",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # temporarily allow all for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(transactions_router)
app.include_router(alerts_router)
app.include_router(rules_router)
app.include_router(ml_router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "fraudshield-pro"}