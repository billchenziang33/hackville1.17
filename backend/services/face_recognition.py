import numpy as np
from deepface import DeepFace
from scipy.spatial.distance import cosine
from typing import List, Optional, Tuple
import base64
import cv2
import tempfile
import os
from config import get_settings

settings = get_settings()


class FaceRecognitionService:
    def __init__(self):
        self.model_name = "Facenet512"
        self.threshold = settings.FACE_RECOGNITION_THRESHOLD
    
    def extract_embedding(self, image_data: bytes) -> Optional[List[float]]:
        try:
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                tmp.write(image_data)
                tmp_path = tmp.name
            
            try:
                embedding_objs = DeepFace.represent(
                    img_path=tmp_path,
                    model_name=self.model_name,
                    enforce_detection=True
                )
                
                if embedding_objs and len(embedding_objs) > 0:
                    return embedding_objs[0]["embedding"]
                return None
            finally:
                os.unlink(tmp_path)
                
        except Exception as e:
            print(f"Face embedding extraction error: {e}")
            return None
    
    def extract_embedding_from_base64(self, base64_image: str) -> Optional[List[float]]:
        try:
            if "," in base64_image:
                base64_image = base64_image.split(",")[1]
            
            image_data = base64.b64decode(base64_image)
            return self.extract_embedding(image_data)
        except Exception as e:
            print(f"Base64 decoding error: {e}")
            return None
    
    def compare_embeddings(
        self, 
        embedding1: List[float], 
        embedding2: List[float]
    ) -> float:
        try:
            distance = cosine(embedding1, embedding2)
            similarity = 1 - distance
            return similarity
        except Exception as e:
            print(f"Embedding comparison error: {e}")
            return 0.0
    
    def find_match(
        self, 
        query_embedding: List[float], 
        stored_embeddings: List[dict]
    ) -> Tuple[Optional[str], float]:

        best_match_id = None
        best_similarity = 0.0
        
        for stored in stored_embeddings:
            similarity = self.compare_embeddings(
                query_embedding, 
                stored["embedding"]
            )
            
            if similarity > best_similarity and similarity >= self.threshold:
                best_similarity = similarity
                best_match_id = stored["family_member_id"]
        
        return best_match_id, best_similarity


face_recognition_service = FaceRecognitionService()
