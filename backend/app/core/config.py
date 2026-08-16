from pydantic_settings import BaseSettings
from typing import List, Union

class Settings(BaseSettings):
    APP_NAME: str = "FraudShield Pro"
    DEBUG: bool = False
    DATABASE_URL: str = "postgresql://fraudshield:password@localhost:5432/fraudshield"
    REDIS_URL: str = "redis://localhost:6379"
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:19092"
    KAFKA_TOPIC_RAW: str = "txn.raw"
    KAFKA_TOPIC_SCORED: str = "txn.scored"
    KAFKA_SASL_USERNAME: str = ""
    KAFKA_SASL_PASSWORD: str = ""
    KAFKA_SECURITY_PROTOCOL: str = "PLAINTEXT"
    SECRET_KEY: str = "change-this-in-production-use-32-char-min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()