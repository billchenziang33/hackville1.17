from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings
import ssl
import certifi

settings = get_settings()

client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    global client, db
    
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tls=True,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=10000
        )
        db = client[settings.DATABASE_NAME]
        await client.admin.command('ping')
        await db.patients.create_index("firebase_uid", unique=True)
        await db.family_members.create_index("firebase_uid", unique=True)
        await db.family_members.create_index("patient_id")
        await db.face_embeddings.create_index("family_member_id")
        await db.voice_embeddings.create_index("family_member_id")
        await db.conversations.create_index([("patient_id", 1), ("family_member_id", 1)])
        await db.locations.create_index("patient_id")
        
        print("Connected to MongoDB")
    except Exception as e:
        print(f"WARNING: Could not connect to MongoDB: {e}")
        print("Server will start but database operations will fail.")
        print("Please whitelist your IP in MongoDB Atlas Network Access.")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    return db
