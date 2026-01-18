"""User profile router."""

from fastapi import APIRouter, Depends, status
from ..schemas.user_profile import UserProfileCreate, UserProfileUpdate, UserProfileResponse
from ..services.user_profile_service import UserProfileService
from ..models import User
from ..dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])


def get_service() -> UserProfileService:
    return UserProfileService()


@router.get("/get-profile", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    service: UserProfileService = Depends(get_service),
):
    """Get current user's profile."""
    return await service.get_profile(current_user.firebase_uid)


@router.post("/create-profile", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_my_profile(
    data: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    service: UserProfileService = Depends(get_service),
):
    """Create profile for current user."""
    return await service.create_profile(current_user.firebase_uid, data)


@router.put("/update-profile", response_model=UserProfileResponse)
async def update_my_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    service: UserProfileService = Depends(get_service),
):
    """Update current user's profile."""
    return await service.update_profile(current_user.firebase_uid, data)


@router.delete("/delete-profile", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_profile(
    current_user: User = Depends(get_current_user),
    service: UserProfileService = Depends(get_service),
):
    """Delete current user's profile."""
    await service.delete_profile(current_user.firebase_uid)
    return None
