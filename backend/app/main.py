import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from .config import settings
from .database import engine, Base, SessionLocal
from .seed_data import seed_all

# Routers
from .routers.auth import router as auth_router
from .routers.farms import router as farms_router
from .routers.crops import router as crops_router
from .routers.requests import router as requests_router
from .routers.approvals import router as approvals_router
from .routers.assignments import router as assignments_router
from .routers.projects import router as projects_router
from .routers.tasks import router as tasks_router
from .routers.activities import activities_router, inputs_router
from .routers.harvest import router as harvest_router
from .routers.delivery import router as delivery_router
from .routers.compensation import router as compensation_router
from .routers.feedback import router as feedback_router
from .routers.notifications import router as notifications_router
from .routers.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables and seed data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Rent-a-Farm API",
    description="Backend REST API and Agronomic Intelligence Service for Rent-a-Farm Mobile Application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads & photographs
uploads_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

# Include Routers
prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=prefix)
app.include_router(farms_router, prefix=prefix)
app.include_router(crops_router, prefix=prefix)
app.include_router(requests_router, prefix=prefix)
app.include_router(approvals_router, prefix=prefix)
app.include_router(assignments_router, prefix=prefix)
app.include_router(projects_router, prefix=prefix)
app.include_router(tasks_router, prefix=prefix)
app.include_router(activities_router, prefix=prefix)
app.include_router(inputs_router, prefix=prefix)
app.include_router(harvest_router, prefix=prefix)
app.include_router(delivery_router, prefix=prefix)
app.include_router(compensation_router, prefix=prefix)
app.include_router(feedback_router, prefix=prefix)
app.include_router(notifications_router, prefix=prefix)
app.include_router(admin_router, prefix=prefix)

@app.get("/")
def root():
    return {
        "service": "Rent-a-Farm Core API",
        "tagline": "Your Land. Your Crops. Your Harvest.",
        "version": "1.0.0",
        "status": "ONLINE",
        "documentation": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "HEALTHY", "database": "CONNECTED", "agronomic_engine": "ACTIVE"}
