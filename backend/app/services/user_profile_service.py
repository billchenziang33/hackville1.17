"""User profile service."""

from fastapi import HTTPException, status
from ..repositories.user_profile_repository import UserProfileRepository
from ..schemas.user_profile import UserProfileCreate, UserProfileUpdate


class UserProfileService:
    def __init__(self):
        self.repo = UserProfileRepository()

    async def get_profile(self, firebase_uid: str) -> dict:
        """Get user profile by Firebase UID."""
        profile = await self.repo.get_by_firebase_uid(firebase_uid)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )
        return profile

    async def create_profile(self, firebase_uid: str, data: UserProfileCreate) -> dict:
        """Create a new user profile."""
        existing = await self.repo.get_by_firebase_uid(firebase_uid)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Profile already exists for this user",
            )
        return await self.repo.create(firebase_uid, data.model_dump(exclude_none=True))

    async def update_profile(self, firebase_uid: str, data: UserProfileUpdate) -> dict:
        """Update an existing user profile."""
        existing = await self.repo.get_by_firebase_uid(firebase_uid)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )
        return await self.repo.update(firebase_uid, data.model_dump(exclude_none=True))

    async def delete_profile(self, firebase_uid: str) -> None:
        """Delete a user profile."""
        deleted = await self.repo.delete(firebase_uid)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )
