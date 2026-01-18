import google.generativeai as genai
from typing import Optional
from config import get_settings

settings = get_settings()


class GeminiService:
    def __init__(self):
        self.model = None
        
    def _get_model(self):
        if self.model is None and settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-pro')
        return self.model
    
    async def generate_conversation_summary(
        self, 
        conversation_text: str,
        family_member_name: str,
        relationship: str
    ) -> Optional[str]:
        model = self._get_model()
        if not model:
            return None
        
        prompt = f"""
        You are helping an Alzheimer's patient remember their conversations.
        Summarize the following conversation with their {relationship}, {family_member_name}, 
        in a warm, simple, and easy-to-understand way.
        
        Focus on:
        - Key topics discussed
        - Any important information shared
        - Emotional tone of the conversation
        
        Keep it brief (2-3 sentences) and reassuring.
        
        Conversation:
        {conversation_text}
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API error: {e}")
            return None
    
    async def generate_recognition_greeting(
        self,
        family_member_name: str,
        relationship: str,
        last_conversation_summary: Optional[str] = None
    ) -> str:
        model = self._get_model()
        
        if not model:
            greeting = f"This is {family_member_name}, your {relationship}."
            if last_conversation_summary:
                greeting += f" Last time you talked about: {last_conversation_summary}"
            return greeting
        
        prompt = f"""
        You are helping an Alzheimer's patient recognize their family member.
        Generate a warm, reassuring greeting to help them understand who they're seeing.
        
        Family member: {family_member_name}
        Relationship: {relationship}
        Last conversation: {last_conversation_summary or "No previous conversation recorded"}
        
        Keep it brief (1-2 sentences), warm, and reassuring.
        Start with identifying who the person is.
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API error: {e}")
            greeting = f"This is {family_member_name}, your {relationship}."
            if last_conversation_summary:
                greeting += f" Last time you talked about: {last_conversation_summary}"
            return greeting


gemini_service = GeminiService()
