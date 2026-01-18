"""Suggestions router for Gemini-powered place recommendations."""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from ..services.gemini_service import get_profile_suggestions, search_suggestions
from ..services.user_profile_service import UserProfileService
from ..models import User
from ..dependencies import get_current_user
from ..schemas.user_profile import CityEnum

router = APIRouter(prefix="/suggestions", tags=["suggestions"])


def get_profile_service() -> UserProfileService:
    return UserProfileService()


@router.get("")
async def get_suggestions(
    current_user: User = Depends(get_current_user),
    service: UserProfileService = Depends(get_profile_service),
):
    """Get personalized suggestions based on user profile."""
    try:
        profile = await service.get_profile(current_user.firebase_uid)
    except HTTPException:
        # No profile exists, return empty suggestions
        return {"places": [], "tips": ["Complete your profile to get personalized suggestions!"]}
    
    suggestions = get_profile_suggestions(profile)
    return suggestions


@router.get("/search")
async def search(
    q: str = Query(..., description="Search query (e.g., 'halal food', 'German restaurants')"),
    city: CityEnum = Query(CityEnum.TORONTO, description="City to search in"),
    language: str = Query("English", description="Language for descriptions (e.g., 'Hindi', 'Mandarin', 'Arabic')"),
):
    """Search for places based on query."""
    if not q.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty",
        )
    
    suggestions = search_suggestions(q, city.value, language)
    return suggestions
