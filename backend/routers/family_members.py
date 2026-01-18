from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime
from typing import List
from database import get_database
from models import FamilyMemberCreate, FamilyMember
from auth import verify_firebase_token

router = APIRouter(prefix="/family-members", tags=["family-members"])


@router.post("/register", response_model=dict)
async def register_family_member(
    member_data: FamilyMemberCreate,
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    firebase_uid = token_data.get("uid")
    
    existing = await db.family_members.find_one({"firebase_uid": firebase_uid})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Family member already registered"
        )
    
    patient = await db.patients.find_one({"_id": ObjectId(member_data.patient_id)})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    member_doc = {
        "firebase_uid": firebase_uid,
        "name": member_data.name,
        "email": member_data.email,
        "phone": member_data.phone,
        "relationship": member_data.relationship,
        "patient_id": member_data.patient_id,
        "created_at": datetime.utcnow()
    }
    
    result = await db.family_members.insert_one(member_doc)
    member_doc["_id"] = str(result.inserted_id)
    
    return {"message": "Family member registered successfully", "family_member": member_doc}


@router.get("/me", response_model=dict)
async def get_current_family_member(token_data: dict = Depends(verify_firebase_token)):
    db = get_database()
    firebase_uid = token_data.get("uid")
    
    member = await db.family_members.find_one({"firebase_uid": firebase_uid})
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    member["_id"] = str(member["_id"])
    return member


@router.get("/patient/{patient_id}", response_model=List[dict])
async def get_family_members_for_patient(
    patient_id: str,
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    
    members = await db.family_members.find({"patient_id": patient_id}).to_list(100)
    for member in members:
        member["_id"] = str(member["_id"])
    
    return members


@router.get("/{member_id}", response_model=dict)
async def get_family_member(
    member_id: str,
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    
    member = await db.family_members.find_one({"_id": ObjectId(member_id)})
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    member["_id"] = str(member["_id"])
    return member
