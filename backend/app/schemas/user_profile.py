"""User profile schemas for MongoDB."""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class CityEnum(str, Enum):
    """Supported cities."""
    TORONTO = "Toronto"
    MISSISSAUGA = "Mississauga"
    BRAMPTON = "Brampton"
    SCARBOROUGH = "Scarborough"
    OAKVILLE = "Oakville"


class UserProfileCreate(BaseModel):
    """Schema for creating a user profile."""
    
    ethnicity: Optional[str] = None
    background: Optional[str] = None
    nationality: Optional[str] = None
    language: Optional[str] = None
    religion: Optional[str] = None
    time_in_canada_months: Optional[int] = None
    city: Optional[CityEnum] = None


class UserProfileUpdate(BaseModel):
    """Schema for updating a user profile."""
    
    ethnicity: Optional[str] = None
    background: Optional[str] = None
    nationality: Optional[str] = None
    language: Optional[str] = None
    religion: Optional[str] = None
    time_in_canada_months: Optional[int] = None
    city: Optional[CityEnum] = None


class UserProfileResponse(BaseModel):
    """Schema for user profile response."""
    
    id: str = Field(alias="_id")
    firebase_uid: str
    ethnicity: Optional[str] = None
    background: Optional[str] = None
    nationality: Optional[str] = None
    language: Optional[str] = None
    religion: Optional[str] = None
    time_in_canada_months: Optional[int] = None
    city: Optional[str] = None

    class Config:
        populate_by_name = True
