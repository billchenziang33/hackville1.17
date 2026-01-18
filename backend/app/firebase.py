"""Firebase client initialization."""

import firebase_admin
from firebase_admin import credentials, auth
from .config import settings

# Validate Firebase credentials
if not settings.firebase_credentials_path or not settings.firebase_api_key:
    raise ValueError(
        "Firebase credentials not configured! "
        "Add FIREBASE_CREDENTIALS_PATH and FIREBASE_API_KEY to backend/.env"
    )

# Initialize Firebase Admin SDK
cred = credentials.Certificate(settings.firebase_credentials_path)
firebase_admin.initialize_app(cred)

# Export auth for use in services
firebase_auth = auth
