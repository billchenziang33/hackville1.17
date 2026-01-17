"""Auth schemas."""

from pydantic import BaseModel, EmailStr, ConfigDict


class UserRegister(BaseModel):
    """User registration request."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response (no password)."""

    id: int
    email: str
    username: str

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    """User login request."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token response."""

    access_token: str
    token_type: str = "bearer"
