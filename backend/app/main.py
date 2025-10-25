from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, sleep, sheep, wool

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware (allow all for simplicity)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(sleep.router, prefix=f"{settings.API_V1_PREFIX}/sleep", tags=["Sleep Tracking"])
app.include_router(sheep.router, prefix=f"{settings.API_V1_PREFIX}/sheep", tags=["Sheep Management"])
app.include_router(wool.router, prefix=f"{settings.API_V1_PREFIX}/wool", tags=["Wool Economy"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Sheepify API",
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
