from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_to_mongo, close_mongo_connection
from auth import initialize_firebase
from routers import patients, family_members, recognition, conversations, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    initialize_firebase()
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="Alzheimer's Care API",
    description="API for Alzheimer's patient care app with face/voice recognition",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(patients.router)
app.include_router(family_members.router)
app.include_router(recognition.router)
app.include_router(conversations.router)
app.include_router(auth.router)


@app.get("/")
async def root():
    return {"message": "Alzheimer's Care API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
