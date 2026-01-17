"""Authentication service using Firebase."""

from fastapi import Depends, HTTPException, status
import httpx
from ..models import User
from ..schemas import UserRegister, UserLogin, TokenResponse
from ..config import settings
from ..repositories.auth_repository import AuthRepository
from ..firebase import firebase_auth


class AuthService:
    def __init__(self, repo: AuthRepository = Depends()):
        self.repo = repo

    def register(self, user_data: UserRegister) -> User:
        """Register a new user with Firebase."""
        existing_user = self.repo.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        try:
            firebase_user = firebase_auth.create_user(
                email=user_data.email,
                password=user_data.password,
                display_name=user_data.email,
            )

            user = User(
                firebase_uid=firebase_user.uid,
                email=user_data.email,
                username=user_data.email,
            )
            return self.repo.create_user(user)

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed: {str(e)}",
            )

    def login(self, user_data: UserLogin) -> TokenResponse:
        """Login user with Firebase and return access token."""
        try:
            url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={settings.firebase_api_key}"
            response = httpx.post(
                url,
                json={
                    "email": user_data.email,
                    "password": user_data.password,
                    "returnSecureToken": True,
                },
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                )

            auth_response = response.json()
            user = self.repo.get_user_by_email(user_data.email)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found",
                )

            return TokenResponse(
                access_token=auth_response["idToken"],
                token_type="bearer",
            )

        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

    def verify_token(self, id_token: str) -> tuple[User, str]:
        """Verify Firebase ID token and return user with token."""
        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            firebase_uid = decoded_token["uid"]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}",
            )

        user = self.repo.get_user_by_firebase_uid(firebase_uid)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in database",
            )

        return user, id_token

    def logout(self) -> None:
        """Logout user (client should discard token)."""
        pass

    def get_profile(self, current_user: User) -> User:
        """Get current user profile."""
        return current_user
