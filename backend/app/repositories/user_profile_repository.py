"""User profile repository for MongoDB operations."""

from typing import Optional
from bson import ObjectId
from ..mongodb import user_profiles_collection


class UserProfileRepository:
    def __init__(self):
        self.collection = user_profiles_collection

    async def get_by_firebase_uid(self, firebase_uid: str) -> Optional[dict]:
        """Get user profile by Firebase UID."""
        profile = await self.collection.find_one({"firebase_uid": firebase_uid})
        if profile:
            profile["_id"] = str(profile["_id"])
        return profile

    async def create(self, firebase_uid: str, profile_data: dict) -> dict:
        """Create a new user profile."""
        document = {"firebase_uid": firebase_uid, **profile_data}
        result = await self.collection.insert_one(document)
        document["_id"] = str(result.inserted_id)
        return document

    async def update(self, firebase_uid: str, profile_data: dict) -> Optional[dict]:
        """Update an existing user profile."""
        update_data = {k: v for k, v in profile_data.items() if v is not None}
        if not update_data:
            return await self.get_by_firebase_uid(firebase_uid)
        
        await self.collection.update_one(
            {"firebase_uid": firebase_uid},
            {"$set": update_data}
        )
        return await self.get_by_firebase_uid(firebase_uid)

    async def delete(self, firebase_uid: str) -> bool:
        """Delete a user profile."""
        result = await self.collection.delete_one({"firebase_uid": firebase_uid})
        return result.deleted_count > 0
