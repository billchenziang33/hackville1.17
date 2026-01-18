import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../../context/AuthContext';
import { logOut } from '../../services/firebase';

export default function FamilyHomeScreen({ navigation }) {
  const { userProfile } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => logOut(), style: 'destructive' },
      ]
    );
  };

  const shortenId = (id) => {
    if (!id) return '';
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  };

  const copyPatientId = async () => {
    if (userProfile?.patient_id) {
      await Clipboard.setStringAsync(userProfile.patient_id);
      Alert.alert('Copied!', 'Patient ID copied to clipboard');
    }
  };

  const showFullPatientId = () => {
    Alert.alert(
      'Patient ID',
      userProfile?.patient_id,
      [
        { text: 'Copy', onPress: copyPatientId },
        { text: 'OK' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {userProfile?.name}!</Text>
        <Text style={styles.subtitle}>
          Caring for your loved one
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.card, styles.trackCard]}
          onPress={() => navigation.navigate('TrackPatient')}
        >
          <Text style={styles.cardEmoji}>📍</Text>
          <Text style={styles.cardTitle}>Track Location</Text>
          <Text style={styles.cardDescription}>
            See where your loved one is right now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.faceCard]}
          onPress={() => navigation.navigate('RegisterFace')}
        >
          <Text style={styles.cardEmoji}>📸</Text>
          <Text style={styles.cardTitle}>Register Face</Text>
          <Text style={styles.cardDescription}>
            Add your face for recognition
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.conversationCard]}
          onPress={() => navigation.navigate('AddConversation')}
        >
          <Text style={styles.cardEmoji}>💬</Text>
          <Text style={styles.cardTitle}>Log Conversation</Text>
          <Text style={styles.cardDescription}>
            Record what you talked about
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Your Profile</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{userProfile?.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Relationship:</Text>
          <Text style={styles.infoValue}>{userProfile?.relationship}</Text>
        </View>
        <TouchableOpacity style={styles.infoRow} onPress={showFullPatientId}>
          <Text style={styles.infoLabel}>Patient ID:</Text>
          <View style={styles.idContainer}>
            <Text style={styles.infoValue}>{shortenId(userProfile?.patient_id)}</Text>
            <Text style={styles.tapHint}>Tap to view full ID</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#c6f6d5',
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardsContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trackCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e53e3e',
  },
  faceCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4299e1',
  },
  voiceCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#9f7aea',
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#48bb78',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  infoCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#718096',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '500',
    flex: 1,
  },
  idContainer: {
    flex: 1,
  },
  tapHint: {
    fontSize: 10,
    color: '#4299e1',
    marginTop: 2,
  },
});
