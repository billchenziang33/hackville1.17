from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from ..schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from ..services.auth_service import AuthService
from ..models import User
from ..dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


class VerifyTokenRequest(BaseModel):
    """Request body for token verification."""
    id_token: str


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(user_data: UserRegister, service: AuthService = Depends()):
    """Register a new user with Firebase."""
    return service.register(user_data)


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, service: AuthService = Depends()):
    """Login user with Firebase and return access token."""
    return service.login(user_data)


@router.post("/verify", response_model=TokenResponse)
async def verify_token(request: VerifyTokenRequest, service: AuthService = Depends()):
    """
    Verify Firebase ID token from frontend.
    Frontend should sign in with Firebase Client SDK and send the ID token here.
    """
    user, token = service.verify_token(request.id_token)
    return TokenResponse(access_token=token, token_type="bearer")


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(service: AuthService = Depends()):
    """Logout user (client should discard token)."""
    service.logout()
    return None


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user), service: AuthService = Depends()
):
    """Get current user profile."""
    return service.get_profile(current_user)
