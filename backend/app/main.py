from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import (
    auth, produce, teams, buyers, negotiations, sales, wallet, notifications, admin, ai_assistant
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FasalDirect: Farmer-first collective produce selling platform backend API",
    version="1.0.0"
)

# Enable CORS for frontend Next.js application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schema on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Register API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(produce.router, prefix=settings.API_V1_STR)
app.include_router(teams.router, prefix=settings.API_V1_STR)
app.include_router(buyers.router, prefix=settings.API_V1_STR)
app.include_router(negotiations.router, prefix=settings.API_V1_STR)
app.include_router(sales.router, prefix=settings.API_V1_STR)
app.include_router(wallet.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(ai_assistant.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": "FasalDirect API",
        "status": "operational",
        "version": "1.0.0",
        "mission": "Empowering smallholder farmers through collective bargaining and smart aggregation"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
