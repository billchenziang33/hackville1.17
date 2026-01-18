# Memory Care - Alzheimer's Patient Care App

A mobile application designed to help Alzheimer's patients recognize their family members through face and voice recognition, track their location, and remember past conversations.

## Features

### For Patients
- **Face Recognition**: Take a photo of someone to identify who they are
- **Voice Recognition**: Record someone's voice to identify them
- **Home Map**: View your home location on a map with Street View
- **Family List**: See all registered family members
- **Location Sharing**: Automatically share location with family members

### For Family Members
- **Track Patient**: Real-time location tracking of the patient
- **Register Face**: Add your face for recognition (3 photos recommended)
- **Register Voice**: Add your voice for recognition (3 recordings recommended)
- **Log Conversations**: Record conversation summaries to help the patient remember

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React Native + Expo |
| Backend | FastAPI (Python) |
| Package Manager | UV (backend), npm (frontend) |
| Authentication | Firebase Auth |
| Database | MongoDB |
| Face Recognition | DeepFace (Facenet512) |
| Voice Recognition | SpeechBrain (ECAPA-TDNN) |
| AI | Google Gemini API |
| Maps | Mapbox |

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # MongoDB connection
│   ├── models.py            # Pydantic models
│   ├── auth.py              # Firebase authentication
│   ├── routers/
│   │   ├── patients.py      # Patient endpoints
│   │   ├── family_members.py # Family member endpoints
│   │   ├── recognition.py   # Face/voice recognition endpoints
│   │   └── conversations.py # Conversation endpoints
│   └── services/
│       ├── face_recognition.py  # Face embedding service
│       ├── voice_recognition.py # Voice embedding service
│       └── gemini_service.py    # Gemini AI service
├── mobile/
│   ├── App.js               # React Native entry point
│   └── src/
│       ├── config/          # App configuration
│       ├── context/         # React context (Auth)
│       ├── services/        # API and Firebase services
│       ├── navigation/      # React Navigation setup
│       └── screens/         # All app screens
│           ├── auth/        # Login, Register, Role Selection
│           ├── patient/     # Patient-specific screens
│           └── family/      # Family member screens
├── pyproject.toml           # Python dependencies (UV)
└── .env.example             # Environment variables template
```

## Setup Instructions

### Prerequisites
- Python 3.11 or 3.12 (not 3.13+)
- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project
- Mapbox account (for maps)
- Google Cloud project (for Gemini API)

### Backend Setup

1. **Install UV** (if not already installed):
   ```bash
   pip install uv
   ```

2. **Navigate to backend and install dependencies**:
   ```bash
   cd Hackvile/backend
   uv sync
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Set up Firebase**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Save as `firebase-credentials.json` in backend folder

5. **Run the backend**:
   ```bash
   uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Mobile App Setup

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Configure the app**:
   Edit `src/config/index.js`:
   - Set `API_URL` to your backend IP (e.g., `http://192.168.1.100:8000`)
   - Add your Firebase config
   - Add your Mapbox access token

3. **Run on your phone via QR code**:
   ```bash
   npx expo start
   ```
   - Scan the QR code with Expo Go app (iOS/Android)

## API Endpoints

### Patients
- `POST /patients/register` - Register new patient
- `GET /patients/me` - Get current patient profile
- `PUT /patients/location` - Update patient location
- `GET /patients/{id}/location` - Get patient location (family only)
- `GET /patients/{id}/home` - Get patient home location

### Family Members
- `POST /family-members/register` - Register new family member
- `GET /family-members/me` - Get current family member profile
- `GET /family-members/patient/{id}` - Get all family members for patient

### Recognition
- `POST /recognition/face/register` - Register face embedding
- `POST /recognition/face/recognize` - Recognize face
- `POST /recognition/voice/register` - Register voice embedding
- `POST /recognition/voice/recognize` - Recognize voice
- `POST /recognition/greeting` - Generate recognition greeting

### Conversations
- `POST /conversations/` - Create conversation record
- `POST /conversations/summarize` - Summarize conversation with Gemini
- `GET /conversations/patient/{id}` - Get patient conversations

## Environment Variables

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=alzheimer_care

# Firebase
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Mapbox Access Token
MAPBOX_ACCESS_TOKEN=your-mapbox-access-token

# Recognition Thresholds
FACE_RECOGNITION_THRESHOLD=0.6
VOICE_RECOGNITION_THRESHOLD=0.75
```

## How It Works

### Face Recognition
1. Family member registers their face (3 photos recommended)
2. DeepFace extracts 512-dimensional face embeddings
3. Embeddings stored in MongoDB linked to family member
4. When patient takes photo, embedding extracted and compared
5. Best match returned with confidence score

### Voice Recognition
1. Family member records voice samples (3 recordings recommended)
2. SpeechBrain ECAPA-TDNN extracts speaker embeddings
3. Embeddings stored in MongoDB linked to family member
4. When patient records voice, embedding extracted and compared
5. Best match returned with confidence score

### Location Tracking
1. Patient app updates location every 30 seconds
2. Location stored in MongoDB with timestamp
3. Family members can view real-time location on map
4. Distance from home calculated and displayed

## License

MIT License - Built for Hackvile 2026
