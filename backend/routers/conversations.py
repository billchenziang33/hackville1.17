from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime
from typing import List
from database import get_database
from models import ConversationCreate, Conversation
from auth import verify_firebase_token
from services.gemini_service import gemini_service

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("/", response_model=dict)
async def create_conversation(
    conversation: ConversationCreate,
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    
    conv_doc = {
        "patient_id": conversation.patient_id,
        "family_member_id": conversation.family_member_id,
        "summary": conversation.summary,
        "topics": conversation.topics,
        "created_at": datetime.utcnow()
    }
    
    result = await db.conversations.insert_one(conv_doc)
    conv_doc["_id"] = str(result.inserted_id)
    
    return {"message": "Conversation recorded", "conversation": conv_doc}


@router.post("/summarize")
async def summarize_conversation(
    conversation_text: str,
    family_member_id: str,
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    
    member = await db.family_members.find_one({"_id": ObjectId(family_member_id)})
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    summary = await gemini_service.generate_conversation_summary(
        conversation_text=conversation_text,
        family_member_name=member["name"],
        relationship=member["relationship"]
    )
    
    if summary is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate summary"
        )
    
    return {"summary": summary}


@router.get("/patient/{patient_id}", response_model=List[dict])
async def get_patient_conversations(
    patient_id: str,
    limit: int = 20,
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    
    conversations = await db.conversations.find(
        {"patient_id": patient_id}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    for conv in conversations:
        conv["_id"] = str(conv["_id"])
    
    return conversations


@router.get("/family-member/{family_member_id}", response_model=List[dict])
async def get_family_member_conversations(
    family_member_id: str,
    limit: int = 20,
    token_data: dict = Depends(verify_firebase_token)
):
    db = get_database()
    
    conversations = await db.conversations.find(
        {"family_member_id": family_member_id}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    for conv in conversations:
        conv["_id"] = str(conv["_id"])
    
    return conversations
