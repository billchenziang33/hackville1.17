"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App settings from environment variables."""

    testing: bool = False

    # Database
    database_url: str = "sqlite:///./recipe_reunion.db"
    database_user: str = ""
    database_password: str = ""
    database_host: str = ""
    database_port: int = 5432
    database_name: str = ""

    # JWT (not used with Firebase, but kept for reference)
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Firebase
    firebase_credentials_path: str = ""  # Path to service account JSON file
    firebase_api_key: str = ""  # Web API key from Firebase Console

    # AssemblyAI
    assemblyai_key: str = ""
    speech_model: str = "universal"

    # LLM
    llm_provider: str = "ollama"
    ollama_model: str = "gemma2"
    gemini_api_key: str = ""
    groq_api_key: str = ""
    groq_model: str = "moonshotai/kimi-k2-instruct-0905"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="allow"
    )


settings = Settings()
