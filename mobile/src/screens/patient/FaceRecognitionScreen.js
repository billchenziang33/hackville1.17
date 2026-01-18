import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../../context/AuthContext';
import { recognizeFace, getRecognitionGreeting } from '../../services/api';

export default function FaceRecognitionScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const captureAndRecognize = async () => {
    if (!cameraRef.current) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      const recognition = await recognizeFace(photo.uri, userProfile._id);

      if (recognition.recognized) {
        const greeting = await getRecognitionGreeting(recognition.family_member_id);
        setResult({
          ...recognition,
          greeting: greeting.greeting,
        });
      } else {
        setResult({
          recognized: false,
          message: "I don't recognize this person. They might be someone new.",
        });
      }
      setShowResult(true);
    } catch (error) {
      Alert.alert('Error', 'Could not process the image. Please try again.');
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
        facing="back"
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Point camera at the person</Text>
          </View>

          <View style={styles.frameContainer}>
            <View style={styles.frame} />
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={captureAndRecognize}
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

      <Modal
        visible={showResult}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {result?.recognized ? (
              <>
                <Text style={styles.recognizedEmoji}>✅</Text>
                <Text style={styles.recognizedName}>{result.family_member_name}</Text>
                <Text style={styles.relationship}>Your {result.relationship}</Text>
                <Text style={styles.greeting}>{result.greeting}</Text>
                {result.last_conversation && (
                  <View style={styles.lastConversation}>
                    <Text style={styles.lastConversationLabel}>Last conversation:</Text>
                    <Text style={styles.lastConversationText}>
                      {result.last_conversation.summary}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.notRecognizedEmoji}>❓</Text>
                <Text style={styles.notRecognizedText}>{result?.message}</Text>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowResult(false);
                setResult(null);
              }}
            >
              <Text style={styles.closeButtonText}>Try Again</Text>
            </TouchableOpacity>
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
    borderRadius: 20,
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
    minHeight: 400,
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
  greeting: {
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
  notRecognizedEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  notRecognizedText: {
    fontSize: 18,
    color: '#4a5568',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#4299e1',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
