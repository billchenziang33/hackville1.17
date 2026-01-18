import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { useAuth } from '../../context/AuthContext';
import { registerVoice } from '../../services/api';

export default function RegisterVoiceScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [recordingCount, setRecordingCount] = useState(0);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Microphone permission is needed');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Use LINEAR PCM format which produces WAV-compatible audio
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      };
      
      const { recording } = await Audio.Recording.createAsync(recordingOptions);

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Could not start recording');
      console.log(error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setProcessing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      await registerVoice(uri, userProfile._id);
      setRecordingCount((prev) => prev + 1);

      if (recordingCount + 1 >= 3) {
        Alert.alert(
          'Registration Complete!',
          'Your voice has been registered successfully. The patient will now be able to recognize you.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Recording Saved!',
          `${3 - recordingCount - 1} more recording(s) needed for better recognition.`,
          [{ text: 'Continue' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Could not register voice. Please try again.'
      );
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Register Your Voice</Text>
        <Text style={styles.subtitle}>
          Recordings: {recordingCount}/3
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.visualizer}>
          {isRecording ? (
            <View style={styles.recordingIndicator}>
              <View style={[styles.wave, styles.wave1]} />
              <View style={[styles.wave, styles.wave2]} />
              <View style={[styles.wave, styles.wave3]} />
              <View style={[styles.wave, styles.wave2]} />
              <View style={[styles.wave, styles.wave1]} />
            </View>
          ) : (
            <Text style={styles.micEmoji}>🎙️</Text>
          )}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>
            {isRecording ? 'Recording...' : 'Instructions'}
          </Text>
          <Text style={styles.instructionText}>
            {isRecording
              ? 'Speak naturally for 5-10 seconds. Say something like "Hello, it\'s me, your [relationship]"'
              : 'Record 3 voice samples for better recognition. Speak naturally and clearly.'}
          </Text>
        </View>

        {processing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#9f7aea" />
            <Text style={styles.processingText}>Processing voice...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? 'Release to Stop' : 'Hold to Record'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#9f7aea',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e9d8fd',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  visualizer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  micEmoji: {
    fontSize: 80,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wave: {
    width: 8,
    backgroundColor: '#9f7aea',
    borderRadius: 4,
  },
  wave1: {
    height: 30,
  },
  wave2: {
    height: 50,
  },
  wave3: {
    height: 70,
  },
  instructions: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    width: '100%',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  recordButton: {
    backgroundColor: '#9f7aea',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 30,
  },
  recordButtonActive: {
    backgroundColor: '#e53e3e',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#718096',
  },
});
