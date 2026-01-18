from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from bson import ObjectId
from datetime import datetime
from typing import Optional
from database import get_database
from models import RecognitionResult, ConversationCreate, Conversation
from auth import verify_firebase_token
from services.face_recognition import face_recognition_service
from services.voice_recognition import voice_recognition_service
from services.gemini_service import gemini_service

router = APIRouter(prefix="/recognition", tags=["recognition"])


@router.post("/face/register")
async def register_face(
    image: UploadFile = File(...),
    family_member_id: str = Form(...),
    token_data: dict = Depends(verify_firebase_token)
):
    """Register a face for a family member."""
    db = get_database()
    
    # Verify family member exists
    member = await db.family_members.find_one({"_id": ObjectId(family_member_id)})
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    # Read image and extract embedding
    image_data = await image.read()
    embedding = face_recognition_service.extract_embedding(image_data)
    
    if embedding is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not detect a face in the image"
        )
    
    # Store embedding
    embedding_doc = {
        "family_member_id": family_member_id,
        "patient_id": member["patient_id"],
        "embedding": embedding,
        "created_at": datetime.utcnow()
    }
    
    result = await db.face_embeddings.insert_one(embedding_doc)
    
    return {
        "message": "Face registered successfully",
        "embedding_id": str(result.inserted_id)
    }


@router.post("/face/recognize", response_model=RecognitionResult)
async def recognize_face(
    image: UploadFile = File(...),
    patient_id: str = Form(...),
    token_data: dict = Depends(verify_firebase_token)
):
    """Recognize a face and return family member info."""
    db = get_database()
    
    # Read image and extract embedding
    image_data = await image.read()
    query_embedding = face_recognition_service.extract_embedding(image_data)
    
    if query_embedding is None:
        return RecognitionResult(recognized=False, confidence=0.0)
    
    # Get all face embeddings for this patient's family
    stored_embeddings = await db.face_embeddings.find(
        {"patient_id": patient_id}
    ).to_list(1000)
    
    if not stored_embeddings:
        return RecognitionResult(recognized=False, confidence=0.0)
    
    # Find best match
    match_id, confidence = face_recognition_service.find_match(
        query_embedding, stored_embeddings
    )
    
    if match_id is None:
        return RecognitionResult(recognized=False, confidence=confidence)
    
    # Get family member info
    member = await db.family_members.find_one({"_id": ObjectId(match_id)})
    if not member:
        return RecognitionResult(recognized=False, confidence=confidence)
    
    # Get last conversation
    last_conv = await db.conversations.find_one(
        {"patient_id": patient_id, "family_member_id": match_id},
        sort=[("created_at", -1)]
    )
    
    last_conversation = None
    if last_conv:
        last_conv["_id"] = str(last_conv["_id"])
        last_conversation = Conversation(**last_conv)
    
    return RecognitionResult(
        recognized=True,
        family_member_id=match_id,
        family_member_name=member["name"],
        relationship=member["relationship"],
        confidence=confidence,
        last_conversation=last_conversation
    )


@router.post("/voice/register")
async def register_voice(
    audio: UploadFile = File(...),
    family_member_id: str = Form(...),
    token_data: dict = Depends(verify_firebase_token)
):
    """Register a voice for a family member."""
    db = get_database()
    
    # Verify family member exists
    member = await db.family_members.find_one({"_id": ObjectId(family_member_id)})
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    # Read audio and extract embedding
    audio_data = await audio.read()
    embedding = voice_recognition_service.extract_embedding(audio_data)
    
    if embedding is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract voice features from audio"
        )
    
    # Store embedding
    embedding_doc = {
        "family_member_id": family_member_id,
        "patient_id": member["patient_id"],
        "embedding": embedding,
        "created_at": datetime.utcnow()
    }
    
    result = await db.voice_embeddings.insert_one(embedding_doc)
    
    return {
        "message": "Voice registered successfully",
        "embedding_id": str(result.inserted_id)
    }


@router.post("/voice/recognize", response_model=RecognitionResult)
async def recognize_voice(
    audio: UploadFile = File(...),
    patient_id: str = Form(...),
    token_data: dict = Depends(verify_firebase_token)
):
    """Recognize a voice and return family member info."""
    db = get_database()
    
    # Read audio and extract embedding
    audio_data = await audio.read()
    query_embedding = voice_recognition_service.extract_embedding(audio_data)
    
    if query_embedding is None:
        return RecognitionResult(recognized=False, confidence=0.0)
    
    # Get all voice embeddings for this patient's family
    stored_embeddings = await db.voice_embeddings.find(
        {"patient_id": patient_id}
    ).to_list(1000)
    
    if not stored_embeddings:
        return RecognitionResult(recognized=False, confidence=0.0)
    
    # Find best match
    match_id, confidence = voice_recognition_service.find_match(
        query_embedding, stored_embeddings
    )
    
    if match_id is None:
        return RecognitionResult(recognized=False, confidence=confidence)
    
    # Get family member info
    member = await db.family_members.find_one({"_id": ObjectId(match_id)})
    if not member:
        return RecognitionResult(recognized=False, confidence=confidence)
    
    # Get last conversation
    last_conv = await db.conversations.find_one(
        {"patient_id": patient_id, "family_member_id": match_id},
        sort=[("created_at", -1)]
    )
    
    last_conversation = None
    if last_conv:
        last_conv["_id"] = str(last_conv["_id"])
        last_conversation = Conversation(**last_conv)
    
    return RecognitionResult(
        recognized=True,
        family_member_id=match_id,
        family_member_name=member["name"],
        relationship=member["relationship"],
        confidence=confidence,
        last_conversation=last_conversation
    )


@router.post("/greeting")
async def get_recognition_greeting(
    family_member_id: str = Form(...),
    token_data: dict = Depends(verify_firebase_token)
):
    """Generate a greeting message for a recognized family member."""
    db = get_database()
    
    member = await db.family_members.find_one({"_id": ObjectId(family_member_id)})
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    # Get last conversation
    last_conv = await db.conversations.find_one(
        {"family_member_id": family_member_id},
        sort=[("created_at", -1)]
    )
    
    last_summary = last_conv["summary"] if last_conv else None
    
    greeting = await gemini_service.generate_recognition_greeting(
        family_member_name=member["name"],
        relationship=member["relationship"],
        last_conversation_summary=last_summary
    )
    
    return {"greeting": greeting}
