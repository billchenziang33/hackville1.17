import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import PatientRegistrationScreen from '../screens/auth/PatientRegistrationScreen';
import FamilyRegistrationScreen from '../screens/auth/FamilyRegistrationScreen';
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import FaceRecognitionScreen from '../screens/patient/FaceRecognitionScreen';
import VoiceRecognitionScreen from '../screens/patient/VoiceRecognitionScreen';
import HomeMapScreen from '../screens/patient/HomeMapScreen';
import FamilyListScreen from '../screens/patient/FamilyListScreen';
import RecordConversationScreen from '../screens/patient/RecordConversationScreen';
import SetupFaceLoginScreen from '../screens/patient/SetupFaceLoginScreen';
import FamilyHomeScreen from '../screens/family/FamilyHomeScreen';
import TrackPatientScreen from '../screens/family/TrackPatientScreen';
import RegisterFaceScreen from '../screens/family/RegisterFaceScreen';
import RegisterVoiceScreen from '../screens/family/RegisterVoiceScreen';
import AddConversationScreen from '../screens/family/AddConversationScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="PatientRegistration" component={PatientRegistrationScreen} />
      <Stack.Screen name="FamilyRegistration" component={FamilyRegistrationScreen} />
    </Stack.Navigator>
  );
}

function PatientStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: { backgroundColor: '#4299e1' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="PatientHome" component={PatientHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FaceRecognition" component={FaceRecognitionScreen} options={{ title: 'Face Recognition', headerShown: false }} />
      <Stack.Screen name="VoiceRecognition" component={VoiceRecognitionScreen} options={{ title: 'Voice Recognition', headerShown: false }} />
      <Stack.Screen name="HomeMap" component={HomeMapScreen} options={{ title: 'Your Home' }} />
      <Stack.Screen name="FamilyList" component={FamilyListScreen} options={{ title: 'Family Members' }} />
      <Stack.Screen name="RecordConversation" component={RecordConversationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SetupFaceLogin" component={SetupFaceLoginScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function FamilyStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: { backgroundColor: '#e53e3e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="FamilyHome" component={FamilyHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TrackPatient" component={TrackPatientScreen} options={{ title: 'Track Patient' }} />
      <Stack.Screen name="RegisterFace" component={RegisterFaceScreen} options={{ title: 'Register Face', headerShown: false }} />
      <Stack.Screen name="RegisterVoice" component={RegisterVoiceScreen} options={{ title: 'Register Voice', headerShown: false }} />
      <Stack.Screen name="AddConversation" component={AddConversationScreen} options={{ title: 'Add Conversation' }} />
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="PatientRegistration" component={PatientRegistrationScreen} />
      <Stack.Screen name="FamilyRegistration" component={FamilyRegistrationScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, userProfile, userType, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' }}>
        <ActivityIndicator size="large" color="#4299e1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : !userProfile ? (
        <OnboardingStack />
      ) : userType === 'patient' ? (
        <PatientStack />
      ) : (
        <FamilyStack />
      )}
    </NavigationContainer>
  );
}
