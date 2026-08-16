import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "FasalDirect"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fasaldirect_super_secure_jwt_secret_key_2026_india")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database configuration - PostgreSQL default, SQLite fallback for development
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fasaldirect.db")
    
    # Platform settings
    DEFAULT_COMPATIBILITY_THRESHOLD: float = 75.0
    DEFAULT_PLATFORM_FEE_PERCENT: float = 2.0
    BASE_TRANSPORT_RATE_PER_KM_PER_KG: float = 0.008  # ₹0.008 per km per kg (~₹8 per km per ton)
    
    # Weights for Smart Team Opportunity Engine
    WEIGHT_CROP_MATCH: float = 0.30
    WEIGHT_VARIETY_MATCH: float = 0.15
    WEIGHT_GRADE_MATCH: float = 0.15
    WEIGHT_DATE_WINDOW: float = 0.15
    WEIGHT_PROXIMITY: float = 0.15
    WEIGHT_QUANTITY_FIT: float = 0.10
    
    class Config:
        case_sensitive = True

settings = Settings()
