import numpy as np
from scipy.spatial.distance import cosine
from typing import List, Optional, Tuple
import tempfile
import os
import base64
import traceback
from config import get_settings

settings = get_settings()


class VoiceRecognitionService:
    def __init__(self):
        self.threshold = settings.VOICE_RECOGNITION_THRESHOLD
    
    def extract_embedding(self, audio_data: bytes) -> Optional[List[float]]:
        """Extract voice embedding from audio bytes using MFCC features."""
        tmp_path = None
        try:
            print(f"Received audio data: {len(audio_data)} bytes")
            
            # Save as WAV (mobile app now records in WAV format)
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(audio_data)
                tmp_path = tmp.name
            
            print(f"Saved to: {tmp_path}")
            
            # Load audio with librosa
            import librosa
            audio, sr = librosa.load(tmp_path, sr=16000)
            print(f"Loaded audio: {len(audio)} samples at {sr}Hz")
            
            if len(audio) < 1600:  # Less than 0.1 seconds
                print("Audio too short")
                return None
            
            # Extract MFCC features (simple but effective for voice)
            mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
            
            # Create a fixed-size embedding by taking statistics
            embedding = []
            for i in range(mfccs.shape[0]):
                embedding.append(float(np.mean(mfccs[i])))
                embedding.append(float(np.std(mfccs[i])))
                embedding.append(float(np.min(mfccs[i])))
                embedding.append(float(np.max(mfccs[i])))
            
            # Add delta features for more robustness
            delta_mfccs = librosa.feature.delta(mfccs)
            for i in range(delta_mfccs.shape[0]):
                embedding.append(float(np.mean(delta_mfccs[i])))
                embedding.append(float(np.std(delta_mfccs[i])))
            
            print(f"Generated embedding with {len(embedding)} dimensions")
            return embedding
                
        except Exception as e:
            print(f"Voice embedding extraction error: {e}")
            traceback.print_exc()
            return None
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    def extract_embedding_from_base64(self, base64_audio: str) -> Optional[List[float]]:
        """Extract voice embedding from base64 encoded audio."""
        try:
            # Remove data URL prefix if present
            if "," in base64_audio:
                base64_audio = base64_audio.split(",")[1]
            
            audio_data = base64.b64decode(base64_audio)
            return self.extract_embedding(audio_data)
        except Exception as e:
            print(f"Base64 decoding error: {e}")
            return None
    
    def compare_embeddings(
        self, 
        embedding1: List[float], 
        embedding2: List[float]
    ) -> float:
        """Compare two embeddings and return similarity score (0-1)."""
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
        """
        Find the best matching voice from stored embeddings.
        Returns (family_member_id, confidence) or (None, 0.0) if no match.
        """
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


voice_recognition_service = VoiceRecognitionService()
