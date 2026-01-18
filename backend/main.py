"""Recipe Reunion API - Main entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import user_preferences

# Initialize database (skip during testing)
# if not settings.testing:
#     init_db()

# Create FastAPI app
app = FastAPI(
    title="Recipe Reunion API",
    description="API for Recipe Reunion application",
    version="0.1.0",
    redirect_slashes=False,  # Disable automatic slash redirects
)

# Add CORS middleware
CORS_ORIGINS = settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(user_preferences.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome working"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
