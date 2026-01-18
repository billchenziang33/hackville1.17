"""Gemini AI service for generating suggestions."""

import json
import google.generativeai as genai
from ..config import settings


# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel("gemini-2.5-flash")


def get_profile_suggestions(profile: dict) -> dict:
    """Generate suggestions based on user profile."""
    
    city = profile.get('city', 'Toronto')
    time_in_canada = profile.get('time_in_canada_months', 0) or 0
    
    prompt = f"""You are an assistant helping people discover places in the Greater Toronto Area.
Based on the user's profile, suggest relevant places in their city.

USER PROFILE:
- Ethnicity: {profile.get('ethnicity', 'Not specified')}
- Background: {profile.get('background', 'Not specified')}
- Nationality: {profile.get('nationality', 'Not specified')}
- Religion: {profile.get('religion', 'Not specified')}
- Language: {profile.get('language', 'Not specified')}
- Time in Canada: {time_in_canada} months
- City: {city}

INSTRUCTIONS:
Generate a comprehensive list of places for this user in {city}, Ontario, Canada.

MUST INCLUDE:
1. **Cultural Food**: Restaurants and grocery stores matching their ethnicity/background
2. **Community Zones**: Cultural neighborhoods (e.g., Chinatown, Little Italy, Little India, Greektown)
3. **Religious Places**: Temples, mosques, churches, gurdwaras matching their religion
4. **Government Services**: Service Ontario, Service Canada offices nearby

{"5. **English/French Classes**: ESL schools, language learning centers (user is new to Canada)" if time_in_canada < 12 else ""}
{"6. **Settlement Services**: Immigrant settlement agencies, newcomer centers" if time_in_canada < 6 else ""}

RULES:
- Only include REAL places that actually exist in {city}
- Include accurate latitude and longitude coordinates
- Return 10-15 diverse places across different categories
- Prioritize places relevant to their specific culture/religion

Target cities: Mississauga, Toronto, Brampton, Scarborough, Oakville

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{{
  "places": [
    {{
      "name": "Place name",
      "type": "restaurant|grocery|religious|community|government|education|settlement",
      "category": "Cultural Food|Community Zone|Religious|Government|Language Classes|Settlement Services",
      "description": "Brief description",
      "address": "Full address",
      "lat": 43.6532,
      "lng": -79.3832
    }}
  ],
  "tips": [
    "Helpful tip for the user based on their profile"
  ]
}}
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up response if it has markdown code blocks
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        return json.loads(text)
    except Exception as e:
        return {"places": [], "tips": [], "error": str(e)}


def search_suggestions(query: str, city: str) -> dict:
    """Generate suggestions based on search query."""
    
    prompt = f"""You are an assistant helping people discover places in the Greater Toronto Area.
User is searching for: "{query}"
City: {city}

INSTRUCTIONS:
1. Find relevant places matching this search in {city}, Ontario, Canada
2. Only include REAL places that actually exist
3. Include accurate latitude and longitude coordinates
4. Return 5-10 relevant results

Target cities: Mississauga, Toronto, Brampton, Scarborough, Oakville

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{{
  "places": [
    {{
      "name": "Place name",
      "type": "restaurant|grocery|religious|community|government|service",
      "description": "Brief description",
      "address": "Full address",
      "lat": 43.6532,
      "lng": -79.3832
    }}
  ]
}}
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up response if it has markdown code blocks
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        return json.loads(text)
    except Exception as e:
        return {"places": [], "error": str(e)}
