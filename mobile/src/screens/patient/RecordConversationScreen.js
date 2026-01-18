import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { useAuth } from '../../context/AuthContext';
import { createConversation } from '../../services/api';

export default function RecordConversationScreen({ navigation, route }) {
  const { familyMemberId, familyMemberName } = route.params || {};
  const { userProfile } = useAuth();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

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
      setRecordingDuration(0);
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
      setRecording(null);

      // For now, we'll use a placeholder for the transcript
      // In production, you'd send the audio to a speech-to-text API
      const placeholderTranscript = `Conversation with ${familyMemberName} recorded for ${recordingDuration} seconds. Topics discussed may include family updates, daily activities, and memories.`;
      
      setTranscript(placeholderTranscript);
    } catch (error) {
      Alert.alert('Error', 'Could not process recording');
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  const saveConversation = async () => {
    if (!transcript) {
      Alert.alert('Error', 'No conversation recorded');
      return;
    }

    setProcessing(true);
    try {
      await createConversation({
        patient_id: userProfile._id,
        family_member_id: familyMemberId,
        summary: transcript,
        topics: ['conversation', 'family'],
      });

      Alert.alert(
        'Saved!',
        'The conversation has been saved. This will help you remember next time!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Could not save conversation');
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Record Conversation</Text>
        <Text style={styles.subtitle}>with {familyMemberName}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.recordingArea}>
          {isRecording ? (
            <>
              <View style={styles.recordingIndicator}>
                <View style={styles.pulsingDot} />
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
              <Text style={styles.duration}>{formatDuration(recordingDuration)}</Text>
            </>
          ) : (
            <Text style={styles.micEmoji}>🎙️</Text>
          )}
        </View>

        {!isRecording && !transcript && (
          <Text style={styles.instructions}>
            Press the button below to start recording your conversation.
            This will help you remember what you talked about!
          </Text>
        )}

        {transcript && (
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptLabel}>Conversation Summary:</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        )}

        <View style={styles.controls}>
          {!transcript ? (
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.recordButtonText}>
                  {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveConversation}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>💾 Save Conversation</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setTranscript('');
                  setRecordingDuration(0);
                }}
              >
                <Text style={styles.retryButtonText}>🔄 Record Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#48bb78',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#c6f6d5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  recordingArea: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
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
    alignItems: 'center',
  },
  pulsingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e53e3e',
    marginBottom: 10,
  },
  recordingText: {
    fontSize: 18,
    color: '#e53e3e',
    fontWeight: '600',
  },
  duration: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3748',
    marginTop: 10,
  },
  instructions: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  transcriptContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 30,
  },
  transcriptLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    color: '#2d3748',
    lineHeight: 24,
  },
  controls: {
    width: '100%',
    gap: 16,
  },
  recordButton: {
    backgroundColor: '#48bb78',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#e53e3e',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4299e1',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#718096',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
