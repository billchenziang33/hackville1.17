import axios from 'axios';
import { API_URL } from '../config';
import { getIdToken } from './firebase';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs (backend handles Firebase)
export const backendRegister = async (email, password) => {
  console.log('Calling backend register at:', `${API_URL}/auth/register`);
  const response = await axios.post(`${API_URL}/auth/register`, { email, password });
  return response.data;
};

export const backendLogin = async (email, password) => {
  console.log('Calling backend login at:', `${API_URL}/auth/login`);
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

// Patient APIs
export const registerPatient = async (patientData) => {
  const response = await api.post('/patients/register', patientData);
  return response.data;
};

export const getPatientProfile = async () => {
  const response = await api.get('/patients/me');
  return response.data;
};

export const updatePatientLocation = async (latitude, longitude) => {
  const response = await api.put('/patients/location', {
    latitude,
    longitude,
  });
  return response.data;
};

export const getPatientLocation = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/location`);
  return response.data;
};

export const getPatientHome = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/home`);
  return response.data;
};

// Family Member APIs
export const registerFamilyMember = async (memberData) => {
  const response = await api.post('/family-members/register', memberData);
  return response.data;
};

export const getFamilyMemberProfile = async () => {
  const response = await api.get('/family-members/me');
  return response.data;
};

export const getFamilyMembersForPatient = async (patientId) => {
  const response = await api.get(`/family-members/patient/${patientId}`);
  return response.data;
};

// Recognition APIs
export const registerFace = async (imageUri, familyMemberId) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'face.jpg',
  });
  formData.append('family_member_id', familyMemberId);

  const token = await getIdToken();
  const response = await axios.post(`${API_URL}/recognition/face/register`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const registerPatientFace = async (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'face.jpg',
  });

  const token = await getIdToken();
  const response = await axios.post(`${API_URL}/patients/register-face`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const recognizeFace = async (imageUri, patientId) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'face.jpg',
  });
  formData.append('patient_id', patientId);

  const token = await getIdToken();
  const response = await axios.post(`${API_URL}/recognition/face/recognize`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const registerVoice = async (audioUri, familyMemberId) => {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/wav',
    name: 'voice.wav',
  });
  formData.append('family_member_id', familyMemberId);

  const token = await getIdToken();
  const response = await axios.post(`${API_URL}/recognition/voice/register`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const recognizeVoice = async (audioUri, patientId) => {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/wav',
    name: 'voice.wav',
  });
  formData.append('patient_id', patientId);

  const token = await getIdToken();
  const response = await axios.post(`${API_URL}/recognition/voice/recognize`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getRecognitionGreeting = async (familyMemberId) => {
  const formData = new FormData();
  formData.append('family_member_id', familyMemberId);

  const token = await getIdToken();
  const response = await axios.post(`${API_URL}/recognition/greeting`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Conversation APIs
export const createConversation = async (conversationData) => {
  const response = await api.post('/conversations/', conversationData);
  return response.data;
};

export const getPatientConversations = async (patientId) => {
  const response = await api.get(`/conversations/patient/${patientId}`);
  return response.data;
};

export default api;
