import asyncio
from app.core.database import engine, Base
from app.models.user import User, RefreshToken
from app.models.transaction import Transaction, FraudAlert
from app.models.rule import Rule

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully!")
    
    from sqlalchemy import text
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'"))
        tables = result.fetchall()
        print("Tables in database:")
        for t in tables:
            print(f"  - {t[0]}")

asyncio.run(create_tables())