"""MongoDB client initialization."""

from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

# Validate MongoDB credentials
if not settings.mongodb_url:
    raise ValueError(
        "MongoDB credentials not configured! "
        "Add MONGODB_URL to backend/.env"
    )

# Initialize MongoDB client
mongo_client = AsyncIOMotorClient(settings.mongodb_url)
db = mongo_client.recipe_reunion

# Collections
user_profiles_collection = db.user_profiles
