import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function RoleSelectionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who are you?</Text>
      <Text style={styles.subtitle}>Select your role to continue</Text>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.card, styles.patientCard]}
          onPress={() => navigation.navigate('PatientRegistration')}
        >
          <Text style={styles.cardEmoji}>🧓</Text>
          <Text style={styles.cardTitle}>Patient</Text>
          <Text style={styles.cardDescription}>
            I am a patient who needs help remembering my loved ones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.familyCard]}
          onPress={() => navigation.navigate('FamilyRegistration')}
        >
          <Text style={styles.cardEmoji}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.cardTitle}>Family Member</Text>
          <Text style={styles.cardDescription}>
            I am a family member who wants to help my loved one
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c5282',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 40,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  card: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  patientCard: {
    backgroundColor: '#ebf8ff',
    borderWidth: 2,
    borderColor: '#4299e1',
  },
  familyCard: {
    backgroundColor: '#f0fff4',
    borderWidth: 2,
    borderColor: '#48bb78',
  },
  cardEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
});
