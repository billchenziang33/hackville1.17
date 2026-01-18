from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "alzheimer_care"
    
    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = "firebase-credentials.json"
    
    # Google Gemini
    GEMINI_API_KEY: str = ""
    
    # Mapbox
    MAPBOX_ACCESS_TOKEN: str = ""
    
    # App Settings
    FACE_RECOGNITION_THRESHOLD: float = 0.6
    VOICE_RECOGNITION_THRESHOLD: float = 0.75
    
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings():
    return Settings()
