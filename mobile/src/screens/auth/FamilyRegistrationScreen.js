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
import { registerFamilyMember } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RELATIONSHIPS = [
  'Son', 'Daughter', 'Spouse', 'Sibling', 
  'Grandchild', 'Caregiver', 'Friend', 'Other'
];

export default function FamilyRegistrationScreen({ navigation }) {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [patientId, setPatientId] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !patientId || !relationship) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await registerFamilyMember({
        name,
        email: user.email,
        phone,
        patient_id: patientId,
        relationship,
      });

      await refreshProfile();
      Alert.alert('Success', 'Registration complete!');
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.detail || error.message);
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
        <View style={styles.content}>
          <Text style={styles.title}>Family Registration</Text>
          <Text style={styles.subtitle}>Connect with your loved one</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Your Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Patient ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the patient's ID"
              placeholderTextColor="#999"
              value={patientId}
              onChangeText={setPatientId}
            />
            <Text style={styles.helperText}>
              Ask the patient to share their ID from their profile
            </Text>

            <Text style={styles.label}>Your Relationship *</Text>
            <View style={styles.relationshipContainer}>
              {RELATIONSHIPS.map((rel) => (
                <TouchableOpacity
                  key={rel}
                  style={[
                    styles.relationshipButton,
                    relationship === rel && styles.relationshipButtonActive,
                  ]}
                  onPress={() => setRelationship(rel)}
                >
                  <Text
                    style={[
                      styles.relationshipText,
                      relationship === rel && styles.relationshipTextActive,
                    ]}
                  >
                    {rel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Complete Registration</Text>
              )}
            </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c5282',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  helperText: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 16,
  },
  relationshipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  relationshipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  relationshipButtonActive: {
    backgroundColor: '#48bb78',
    borderColor: '#48bb78',
  },
  relationshipText: {
    fontSize: 14,
    color: '#4a5568',
  },
  relationshipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#48bb78',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
