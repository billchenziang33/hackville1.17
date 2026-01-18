import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../../context/AuthContext';
import { updatePatientLocation, recognizeFace, getRecognitionGreeting } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function PatientHomeScreen({ navigation }) {
  const { userProfile, logout } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [locationTracking, setLocationTracking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const cameraRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    startLocationTracking();
    return () => {
      setLocationTracking(false);
    };
  }, []);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      setLocationTracking(true);

      const interval = setInterval(async () => {
        try {
          const location = await Location.getCurrentPositionAsync({});
          await updatePatientLocation(
            location.coords.latitude,
            location.coords.longitude
          );
        } catch (error) {
          console.log('Location update error:', error);
        }
      }, 5000); // Update every 5 seconds for near-live tracking

      const location = await Location.getCurrentPositionAsync({});
      await updatePatientLocation(
        location.coords.latitude,
        location.coords.longitude
      );

      return () => clearInterval(interval);
    } catch (error) {
      console.log('Location tracking error:', error);
    }
  };

  const handleScanPress = () => {
    if (!processing) {
      captureAndRecognize();
    }
  };

  const speakRecognition = (name, relationship, greeting, lastConversation) => {
    // Build the announcement
    let announcement = `This is ${name}, your ${relationship}. ${greeting}`;
    
    if (lastConversation) {
      announcement += ` Last time you talked about: ${lastConversation}`;
    }
    
    Speech.speak(announcement, {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const captureAndRecognize = async () => {
    if (!cameraRef.current || processing) return;

    setProcessing(true);
    try {
      // Use skipProcessing to avoid shutter sound on some devices
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
        base64: false,
        skipProcessing: true,
      });

      const recognition = await recognizeFace(photo.uri, userProfile._id);

      if (recognition.recognized) {
        // Stop scanning when someone is recognized
        setIsScanning(false);
        const greeting = await getRecognitionGreeting(recognition.family_member_id);
        setResult({
          ...recognition,
          greeting: greeting.greeting,
        });
        setShowResult(true);
        
        // Speak the recognition result
        speakRecognition(
          recognition.family_member_name,
          recognition.relationship,
          greeting.greeting,
          recognition.last_conversation?.summary
        );
      } else {
        // No face recognized
        setResult(null);
      }
    } catch (error) {
      // No face detected or API error
      console.log('Scan error:', error.message);
      setResult(null);
    } finally {
      setProcessing(false);
    }
  };

  const dismissResult = () => {
    Speech.stop(); // Stop any ongoing speech
    setShowResult(false);
    setResult(null);
  };

  const handleLogout = async () => {
    try {
      Speech.stop();
      await logout();
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          The camera helps identify your family members automatically
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Enable Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full screen camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* Overlay with info */}
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <Text style={styles.greeting}>Hello, {userProfile?.name}!</Text>
            {locationTracking && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📍 Location Active</Text>
              </View>
            )}
          </View>

          {/* Center scan button */}
          <View style={styles.centerContainer}>
            <TouchableOpacity
              style={[styles.scanButton, processing && styles.scanButtonDisabled]}
              onPress={handleScanPress}
              disabled={processing}
            >
              {processing ? (
                <>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.scanButtonText}>Scanning...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.scanButtonEmoji}>📸</Text>
                  <Text style={styles.scanButtonText}>Tap to Scan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Patient ID Card */}
          <TouchableOpacity 
            style={styles.patientIdCard}
            onPress={() => {
              if (userProfile?._id) {
                Clipboard.setStringAsync(userProfile._id);
                Alert.alert('Copied!', 'Your Patient ID has been copied to clipboard.\n\nShare this with family members so they can connect with you.');
              }
            }}
          >
            <Text style={styles.patientIdLabel}>Your Patient ID (tap to copy)</Text>
            <Text style={styles.patientIdValue}>
              {userProfile?._id ? `${userProfile._id.slice(0, 6)}...${userProfile._id.slice(-4)}` : 'Loading...'}
            </Text>
          </TouchableOpacity>

          {/* Bottom buttons */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.bottomButton}
              onPress={() => navigation.navigate('HomeMap')}
            >
              <Text style={styles.buttonEmoji}>🏠</Text>
              <Text style={styles.buttonLabel}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomButton}
              onPress={() => navigation.navigate('FamilyList')}
            >
              <Text style={styles.buttonEmoji}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.buttonLabel}>Family</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomButton}
              onPress={() => navigation.navigate('SetupFaceLogin')}
            >
              <Text style={styles.buttonEmoji}>🔐</Text>
              <Text style={styles.buttonLabel}>Face Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* Recognition Result Modal */}
      <Modal
        visible={showResult}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {result?.recognized && (
              <>
                <Text style={styles.recognizedEmoji}>✅</Text>
                <Text style={styles.recognizedName}>{result.family_member_name}</Text>
                <Text style={styles.relationship}>Your {result.relationship}</Text>
                <Text style={styles.greeting2}>{result.greeting}</Text>
                {result.last_conversation && (
                  <View style={styles.lastConversation}>
                    <Text style={styles.lastConversationLabel}>Last conversation:</Text>
                    <Text style={styles.lastConversationText}>
                      {result.last_conversation.summary}
                    </Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.closeButton, styles.recordConvoButton]}
                onPress={() => {
                  Speech.stop();
                  setShowResult(false);
                  navigation.navigate('RecordConversation', {
                    familyMemberId: result?.family_member_id,
                    familyMemberName: result?.family_member_name,
                  });
                }}
              >
                <Text style={styles.closeButtonText}>🎙️ Record Conversation</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={dismissResult}
              >
                <Text style={styles.closeButtonText}>Continue Scanning</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: 'rgba(229, 62, 62, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  badge: {
    backgroundColor: 'rgba(72, 187, 120, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 300,
  },
  scanButton: {
    backgroundColor: 'rgba(66, 153, 225, 0.9)',
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonDisabled: {
    backgroundColor: 'rgba(100, 100, 100, 0.8)',
  },
  scanButtonEmoji: {
    fontSize: 50,
    marginBottom: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  patientIdCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  patientIdLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  patientIdValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    fontFamily: 'monospace',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  bottomButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 70,
  },
  buttonEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  buttonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2d3748',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 40,
  },
  permissionEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#4299e1',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: 'center',
    minHeight: 350,
  },
  recognizedEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  recognizedName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  relationship: {
    fontSize: 18,
    color: '#4299e1',
    marginBottom: 16,
  },
  greeting2: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  lastConversation: {
    backgroundColor: '#f7fafc',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  lastConversationLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  lastConversationText: {
    fontSize: 14,
    color: '#4a5568',
  },
  modalButtons: {
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#4299e1',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  recordConvoButton: {
    backgroundColor: '#48bb78',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
