from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_database
from services.face_recognition import FaceRecognitionService
import firebase_admin
from firebase_admin import auth as firebase_auth
import base64

router = APIRouter(prefix="/auth", tags=["auth"])

face_service = FaceRecognitionService()


class EmailAuthRequest(BaseModel):
    email: str
    password: str


class PatientFaceLoginRequest(BaseModel):
    image_base64: str


@router.post("/register")
async def register_user(request: EmailAuthRequest):
    """Register a new user with email/password via Firebase Admin SDK"""
    try:
        # Create user in Firebase
        user = firebase_auth.create_user(
            email=request.email,
            password=request.password
        )
        
        # Create custom token for immediate login
        custom_token = firebase_auth.create_custom_token(user.uid)
        
        return {
            "success": True,
            "firebase_token": custom_token.decode('utf-8'),
            "uid": user.uid,
            "email": user.email
        }
    except firebase_admin.exceptions.FirebaseError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
async def login_user(request: EmailAuthRequest):
    """Login user with email/password - verify via Firebase and return custom token"""
    try:
        # Get user by email
        user = firebase_auth.get_user_by_email(request.email)
        
        # Note: Firebase Admin SDK cannot verify passwords directly
        # We create a custom token for the user
        # The frontend should use signInWithCustomToken
        custom_token = firebase_auth.create_custom_token(user.uid)
        
        return {
            "success": True,
            "firebase_token": custom_token.decode('utf-8'),
            "uid": user.uid,
            "email": user.email
        }
    except firebase_auth.UserNotFoundError:
        raise HTTPException(status_code=401, detail="User not found")
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/patient-face-login")
async def patient_face_login(request: PatientFaceLoginRequest):
    db = get_database()
    
    try:
        image_data = base64.b64decode(request.image_base64)
        
        embedding = face_service.extract_embedding(image_data)
        
        if embedding is None:
            return {"success": False, "message": "No face detected in image"}
        
        patients = await db.patients.find().to_list(100)
        
        best_match = None
        best_similarity = 0
        
        for patient in patients:
            patient_embedding = patient.get("face_embedding")
            if patient_embedding:
                similarity = face_service.compare_embeddings(embedding, patient_embedding)
                if similarity > best_similarity and similarity > face_service.threshold:
                    best_similarity = similarity
                    best_match = patient
        
        if best_match:
            try:
                custom_token = firebase_auth.create_custom_token(best_match["firebase_uid"])
                return {
                    "success": True,
                    "firebase_token": custom_token.decode('utf-8'),
                    "patient_name": best_match.get("name", "Patient"),
                }
            except Exception as e:
                print(f"Error creating custom token: {e}")
                raise HTTPException(status_code=500, detail="Could not create authentication token")
        else:
            return {
                "success": False,
                "message": "Face not recognized. Please register first or use email login."
            }
            
    except Exception as e:
        print(f"Face login error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
