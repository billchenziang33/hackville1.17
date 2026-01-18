from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema, handler):
        return {"type": "string"}


# Patient Models
class PatientCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    home_address: str
    home_latitude: float
    home_longitude: float


class Patient(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    firebase_uid: str
    name: str
    email: str
    phone: Optional[str] = None
    home_address: str
    home_latitude: float
    home_longitude: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class PatientLocationUpdate(BaseModel):
    latitude: float
    longitude: float


class PatientLocation(BaseModel):
    patient_id: str
    latitude: float
    longitude: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Family Member Models
class FamilyMemberCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    relationship: str
    patient_id: str


class FamilyMember(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    firebase_uid: str
    name: str
    email: str
    phone: Optional[str] = None
    relationship: str
    patient_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# Face Embedding Models
class FaceEmbedding(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    family_member_id: str
    patient_id: str
    embedding: List[float]
    image_path: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# Voice Embedding Models
class VoiceEmbedding(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    family_member_id: str
    patient_id: str
    embedding: List[float]
    audio_path: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# Conversation Models
class ConversationCreate(BaseModel):
    patient_id: str
    family_member_id: str
    summary: str
    topics: List[str] = []


class Conversation(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    patient_id: str
    family_member_id: str
    summary: str
    topics: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# Recognition Result
class RecognitionResult(BaseModel):
    recognized: bool
    family_member_id: Optional[str] = None
    family_member_name: Optional[str] = None
    relationship: Optional[str] = None
    confidence: float = 0.0
    last_conversation: Optional[Conversation] = None


# Auth Models
class TokenData(BaseModel):
    firebase_uid: str
    user_type: str  # "patient" or "family_member"


class UserResponse(BaseModel):
    id: str
    firebase_uid: str
    name: str
    email: str
    user_type: str
