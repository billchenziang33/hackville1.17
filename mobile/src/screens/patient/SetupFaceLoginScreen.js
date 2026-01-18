import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { registerPatientFace, getPatientProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SetupFaceLoginScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [alreadySetup, setAlreadySetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const cameraRef = useRef(null);
  const { logout } = useAuth();

  useEffect(() => {
    checkIfFaceRegistered();
  }, []);

  const checkIfFaceRegistered = async () => {
    try {
      const profile = await getPatientProfile();
      if (profile?.face_embedding) {
        setAlreadySetup(true);
      }
    } catch (error) {
      console.log('Error checking face status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const captureAndRegister = async () => {
    if (!cameraRef.current || capturing) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });

      await registerPatientFace(photo.uri);

      Alert.alert(
        'Face Registered! ✅',
        'You can now log in using your face. No password needed!',
        [{ text: 'Great!', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.log('Face registration error:', error);
      Alert.alert(
        'Could Not Register Face',
        'Please make sure your face is clearly visible and try again.',
        [{ text: 'Try Again' }]
      );
    } finally {
      setCapturing(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          We need camera access to register your face for easy login
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Enable Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Setup Face Login</Text>
        <Text style={styles.subtitle}>So you don't need to remember a password</Text>
      </View>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        <View style={styles.cameraOverlay}>
          <View style={styles.faceGuide} />
          <Text style={styles.instructions}>
            Position your face in the circle
          </Text>
        </View>
      </CameraView>

      <View style={styles.actions}>
        {alreadySetup ? (
          <>
            <View style={styles.alreadySetupContainer}>
              <Text style={styles.alreadySetupEmoji}>✅</Text>
              <Text style={styles.alreadySetupText}>Face Login Already Setup!</Text>
              <Text style={styles.alreadySetupHint}>
                You can already log in just by showing your face.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.captureButton, styles.reRegisterButton]}
              onPress={captureAndRegister}
              disabled={capturing}
            >
              {capturing ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Text style={styles.captureButtonText}>🔄 Re-register Face</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={captureAndRegister}
              disabled={capturing || loading}
            >
              {capturing || loading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Text style={styles.captureButtonText}>📸 Register My Face</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.hint}>
              This lets you log in just by showing your face - no password needed!
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a202c',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#e53e3e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#a0aec0',
    fontSize: 14,
    marginTop: 4,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: '#48bb78',
    borderStyle: 'dashed',
  },
  instructions: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  actions: {
    padding: 30,
    backgroundColor: '#1a202c',
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#48bb78',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  hint: {
    color: '#a0aec0',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  alreadySetupContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  alreadySetupEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  alreadySetupText: {
    color: '#48bb78',
    fontSize: 20,
    fontWeight: 'bold',
  },
  alreadySetupHint: {
    color: '#a0aec0',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  reRegisterButton: {
    backgroundColor: '#4a5568',
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
});
