from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from bson import ObjectId
from datetime import datetime
from typing import List
from database import get_database
from models import PatientCreate, Patient, PatientLocation, PatientLocationUpdate
from auth import verify_firebase_token
from services.face_recognition import FaceRecognitionService

router = APIRouter(prefix="/patients", tags=["patients"])

face_service = FaceRecognitionService()


@router.post("/register", response_model=dict)
async def register_patient(
    patient_data: PatientCreate,
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    firebase_uid = token_data.get("uid")
    
    existing = await db.patients.find_one({"firebase_uid": firebase_uid})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient already registered"
        )
    
    patient_doc = {
        "firebase_uid": firebase_uid,
        "name": patient_data.name,
        "email": patient_data.email,
        "phone": patient_data.phone,
        "home_address": patient_data.home_address,
        "home_latitude": patient_data.home_latitude,
        "home_longitude": patient_data.home_longitude,
        "created_at": datetime.utcnow()
    }
    
    result = await db.patients.insert_one(patient_doc)
    patient_doc["_id"] = str(result.inserted_id)
    
    return {"message": "Patient registered successfully", "patient": patient_doc}


@router.get("/me", response_model=dict)
async def get_current_patient(token_data: dict = Depends(verify_firebase_token)):
    db = get_database()
    firebase_uid = token_data.get("uid")
    
    patient = await db.patients.find_one({"firebase_uid": firebase_uid})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    patient["_id"] = str(patient["_id"])
    return patient


@router.put("/location")
async def update_patient_location(
    location: PatientLocationUpdate,
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    firebase_uid = token_data.get("uid")
    
    patient = await db.patients.find_one({"firebase_uid": firebase_uid})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    location_doc = {
        "patient_id": str(patient["_id"]),
        "latitude": location.latitude,
        "longitude": location.longitude,
        "timestamp": datetime.utcnow()
    }
    
    await db.locations.update_one(
        {"patient_id": str(patient["_id"])},
        {"$set": location_doc},
        upsert=True
    )
    
    return {"message": "Location updated successfully"}


@router.get("/{patient_id}/location")
async def get_patient_location(
    patient_id: str,
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    firebase_uid = token_data.get("uid")
    
    family_member = await db.family_members.find_one({
        "firebase_uid": firebase_uid,
        "patient_id": patient_id
    })
    
    if not family_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You are not a family member of this patient."
        )
    
    location = await db.locations.find_one({"patient_id": patient_id})
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    location["_id"] = str(location["_id"])
    return location


@router.get("/{patient_id}/home")
async def get_patient_home(
    patient_id: str,
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    
    patient = await db.patients.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return {
        "home_address": patient["home_address"],
        "home_latitude": patient["home_latitude"],
        "home_longitude": patient["home_longitude"]
    }


@router.post("/register-face")
async def register_patient_face(
    image: UploadFile = File(...),
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    firebase_uid = token_data.get("uid")
    
    patient = await db.patients.find_one({"firebase_uid": firebase_uid})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    image_data = await image.read()
    embedding = face_service.extract_embedding(image_data)
    
    if embedding is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not detect face in image"
        )
    
    await db.patients.update_one(
        {"_id": patient["_id"]},
        {"$set": {"face_embedding": embedding}}
    )
    
    return {"message": "Face registered successfully for login"}
