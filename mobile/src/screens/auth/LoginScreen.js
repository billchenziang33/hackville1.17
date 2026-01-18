import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import { signInWithToken } from '../../services/firebase';
import { API_URL } from '../../config';
import { backendLogin } from '../../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [faceScanning, setFaceScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('Looking for you...');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    // Request camera permission on mount
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    // Start auto-scanning when camera is ready
    if (permission?.granted && !scanIntervalRef.current) {
      // Initial delay before first scan
      setTimeout(() => {
        autoScanFace();
      }, 2000);
      
      // Then scan every 4 seconds
      scanIntervalRef.current = setInterval(() => {
        if (!faceScanning && !hasScannedRef.current) {
          autoScanFace();
        }
      }, 4000);
    }

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [permission?.granted]);

  const autoScanFace = async () => {
    if (!cameraRef.current || faceScanning || hasScannedRef.current) return;

    setFaceScanning(true);
    setScanStatus('Checking...');
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.4,
        base64: true,
        skipProcessing: true,
      });

      const response = await fetch(`${API_URL}/auth/patient-face-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: photo.base64,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        hasScannedRef.current = true;
        setScanStatus(`Welcome back, ${data.patient_name}!`);
        
        // Speak welcome message
        Speech.speak(`Welcome back, ${data.patient_name}!`, {
          language: 'en',
          rate: 0.9,
        });
        
        // Sign in with the custom token
        await signInWithToken(data.firebase_token);
      } else {
        setScanStatus('Looking for you...');
      }
    } catch (error) {
      console.log('Auto face scan error:', error.message);
      setScanStatus('Looking for you...');
    } finally {
      setFaceScanning(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    console.log('Attempting login to backend...');
    try {
      const data = await backendLogin(email, password);
      console.log('Backend response:', data);
      if (data.success && data.firebase_token) {
        console.log('Signing in with token...');
        await signInWithToken(data.firebase_token);
        console.log('Sign in complete');
      } else {
        Alert.alert('Login Failed', 'Invalid credentials');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Login Failed', error.response?.data?.detail || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera section at top - auto detects patient faces */}
      <View style={styles.cameraSection}>
        {permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.faceGuide} />
              <View style={styles.scanStatusContainer}>
                {faceScanning && <ActivityIndicator color="#48bb78" size="small" />}
                <Text style={styles.scanStatus}>{scanStatus}</Text>
              </View>
            </View>
          </CameraView>
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraPlaceholderEmoji}>📷</Text>
            <Text style={styles.cameraPlaceholderText}>
              Enable camera for automatic patient login
            </Text>
            <TouchableOpacity style={styles.enableCameraButton} onPress={requestPermission}>
              <Text style={styles.enableCameraText}>Enable Camera</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.patientHint}>
          👆 Patients: Just look at the camera to log in!
        </Text>
      </View>

      {/* Family member login form */}
      <ScrollView style={styles.formSection} contentContainerStyle={styles.formContent}>
        <Text style={styles.familyTitle}>Family Member Login</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  cameraSection: {
    backgroundColor: '#1a202c',
    paddingTop: 50,
  },
  camera: {
    height: 220,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#48bb78',
    borderStyle: 'dashed',
  },
  scanStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  scanStatus: {
    color: '#fff',
    fontSize: 16,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cameraPlaceholder: {
    height: 220,
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#2d3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholderEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  cameraPlaceholderText: {
    color: '#a0aec0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  enableCameraButton: {
    backgroundColor: '#48bb78',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  enableCameraText: {
    color: '#fff',
    fontWeight: '600',
  },
  patientHint: {
    color: '#48bb78',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  formSection: {
    flex: 1,
  },
  formContent: {
    padding: 24,
  },
  familyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  button: {
    backgroundColor: '#4299e1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#718096',
    fontSize: 14,
  },
  linkBold: {
    color: '#4299e1',
    fontWeight: '600',
  },
});
