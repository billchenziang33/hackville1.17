import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import get_settings
from database import get_database

settings = get_settings()
security = HTTPBearer()

firebase_app = None


def initialize_firebase():
    global firebase_app
    if firebase_app is None:
        try:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_app = firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Firebase initialization error: {e}")
            print("Running without Firebase - use mock auth for development")


async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    token = credentials.credentials
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token_data: dict = Depends(verify_firebase_token)) -> dict:
    db = get_database()
    firebase_uid = token_data.get("uid")
    
    # Check if user is a patient
    patient = await db.patients.find_one({"firebase_uid": firebase_uid})
    if patient:
        patient["_id"] = str(patient["_id"])
        patient["user_type"] = "patient"
        return patient
    
    # Check if user is a family member
    family_member = await db.family_members.find_one({"firebase_uid": firebase_uid})
    if family_member:
        family_member["_id"] = str(family_member["_id"])
        family_member["user_type"] = "family_member"
        return family_member
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found in database"
    )


async def get_current_patient(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("user_type") != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Patient account required."
        )
    return current_user


async def get_current_family_member(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("user_type") != "family_member":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Family member account required."
        )
    return current_user
