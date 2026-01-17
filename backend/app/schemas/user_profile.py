"""User profile schemas for MongoDB."""

from pydantic import BaseModel, Field
from typing import Optional


class UserProfileCreate(BaseModel):
    """Schema for creating a user profile."""
    
    ethnicity: Optional[str] = None
    background: Optional[str] = None
    nationality: Optional[str] = None
    language: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """Schema for updating a user profile."""
    
    ethnicity: Optional[str] = None
    background: Optional[str] = None
    nationality: Optional[str] = None
    language: Optional[str] = None


class UserProfileResponse(BaseModel):
    """Schema for user profile response."""
    
    id: str = Field(alias="_id")
    firebase_uid: str
    ethnicity: Optional[str] = None
    background: Optional[str] = None
    nationality: Optional[str] = None
    language: Optional[str] = None

    class Config:
        populate_by_name = True
