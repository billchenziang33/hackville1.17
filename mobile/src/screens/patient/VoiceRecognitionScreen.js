import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Audio } from 'expo-av';
import { useAuth } from '../../context/AuthContext';
import { recognizeVoice, getRecognitionGreeting } from '../../services/api';

export default function VoiceRecognitionScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

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

      const recognition = await recognizeVoice(uri, userProfile._id);

      if (recognition.recognized) {
        const greeting = await getRecognitionGreeting(recognition.family_member_id);
        setResult({
          ...recognition,
          greeting: greeting.greeting,
        });
      } else {
        setResult({
          recognized: false,
          message: "I don't recognize this voice. They might be someone new.",
        });
      }
      setShowResult(true);
    } catch (error) {
      Alert.alert('Error', 'Could not process the audio. Please try again.');
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Voice Recognition</Text>
        <Text style={styles.subtitle}>
          {isRecording
            ? 'Recording... Ask them to speak'
            : 'Press and hold to record'}
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
            <Text style={styles.micEmoji}>🎤</Text>
          )}
        </View>

        {processing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#9f7aea" />
            <Text style={styles.processingText}>Analyzing voice...</Text>
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

      <Modal visible={showResult} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {result?.recognized ? (
              <>
                <Text style={styles.recognizedEmoji}>✅</Text>
                <Text style={styles.recognizedName}>
                  {result.family_member_name}
                </Text>
                <Text style={styles.relationship}>
                  Your {result.relationship}
                </Text>
                <Text style={styles.greeting}>{result.greeting}</Text>
                {result.last_conversation && (
                  <View style={styles.lastConversation}>
                    <Text style={styles.lastConversationLabel}>
                      Last conversation:
                    </Text>
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
  headerTop: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
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
    color: '#9f7aea',
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
    backgroundColor: '#9f7aea',
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
