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
import { useAuth } from '../../context/AuthContext';
import { registerFace } from '../../services/api';

export default function RegisterFaceScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const captureAndRegister = async () => {
    if (!cameraRef.current) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      await registerFace(photo.uri, userProfile._id);
      setCaptureCount((prev) => prev + 1);

      if (captureCount + 1 >= 3) {
        Alert.alert(
          'Registration Complete!',
          'Your face has been registered successfully. The patient will now be able to recognize you.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Photo Captured!',
          `${3 - captureCount - 1} more photo(s) needed for better recognition.`,
          [{ text: 'Continue' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Could not register face. Please try again.'
      );
      console.log(error);
    } finally {
      setCapturing(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Position your face in the frame</Text>
            <Text style={styles.subHeaderText}>
              Photos taken: {captureCount}/3
            </Text>
          </View>

          <View style={styles.frameContainer}>
            <View style={styles.frame} />
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              Take 3 photos from different angles for better recognition
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={captureAndRegister}
              disabled={capturing}
            >
              {capturing ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
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
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subHeaderText: {
    color: '#4299e1',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 250,
    height: 300,
    borderWidth: 3,
    borderColor: '#4299e1',
    borderRadius: 150,
  },
  instructions: {
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  controls: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(66, 153, 225, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 100,
  },
  button: {
    backgroundColor: '#4299e1',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
