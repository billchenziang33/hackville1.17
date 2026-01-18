import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { createConversation } from '../../services/api';

const TOPIC_SUGGESTIONS = [
  'Family news', 'Health', 'Memories', 'Daily activities',
  'Weather', 'Food', 'Hobbies', 'Friends', 'Travel', 'Work'
];

export default function AddConversationScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [summary, setSummary] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSave = async () => {
    if (!summary.trim()) {
      Alert.alert('Error', 'Please enter a conversation summary');
      return;
    }

    setLoading(true);
    try {
      await createConversation({
        patient_id: userProfile.patient_id,
        family_member_id: userProfile._id,
        summary: summary.trim(),
        topics: selectedTopics,
      });

      Alert.alert(
        'Saved!',
        'The conversation has been recorded. This will help the patient remember what you talked about.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Could not save conversation. Please try again.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Log Conversation</Text>
          <Text style={styles.subtitle}>
            Help the patient remember what you talked about
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>What did you talk about?</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Summarize your conversation in a few sentences..."
              placeholderTextColor="#999"
              value={summary}
              onChangeText={setSummary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Topics discussed</Text>
            <View style={styles.topicsContainer}>
              {TOPIC_SUGGESTIONS.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={[
                    styles.topicButton,
                    selectedTopics.includes(topic) && styles.topicButtonActive,
                  ]}
                  onPress={() => toggleTopic(topic)}
                >
                  <Text
                    style={[
                      styles.topicText,
                      selectedTopics.includes(topic) && styles.topicTextActive,
                    ]}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Conversation</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Tips</Text>
            <Text style={styles.tipText}>
              • Keep summaries simple and warm{'\n'}
              • Mention specific details they might remember{'\n'}
              • Include emotional context (happy, concerned, etc.)
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#48bb78',
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
    color: '#c6f6d5',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  topicButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  topicButtonActive: {
    backgroundColor: '#48bb78',
    borderColor: '#48bb78',
  },
  topicText: {
    fontSize: 14,
    color: '#4a5568',
  },
  topicTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#48bb78',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  tipCard: {
    marginTop: 20,
    backgroundColor: '#fefcbf',
    borderRadius: 16,
    padding: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#744210',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#744210',
    lineHeight: 22,
  },
});
