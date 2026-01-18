import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getFamilyMembersForPatient } from '../../services/api';

export default function FamilyListScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFamilyMembers = async () => {
    try {
      const members = await getFamilyMembersForPatient(userProfile._id);
      setFamilyMembers(members);
    } catch (error) {
      console.log('Error loading family members:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadFamilyMembers();
  };

  const getRelationshipEmoji = (relationship) => {
    const emojis = {
      'Son': '👦',
      'Daughter': '👧',
      'Spouse': '💑',
      'Sibling': '👫',
      'Grandchild': '👶',
      'Caregiver': '🏥',
      'Friend': '🤝',
      'Other': '👤',
    };
    return emojis[relationship] || '👤';
  };

  const renderFamilyMember = ({ item }) => (
    <TouchableOpacity style={styles.memberCard}>
      <Text style={styles.memberEmoji}>{getRelationshipEmoji(item.relationship)}</Text>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRelationship}>{item.relationship}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ed8936" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Family</Text>
        <Text style={styles.subtitle}>
          {familyMembers.length} family member{familyMembers.length !== 1 ? 's' : ''} registered
        </Text>
      </View>

      {familyMembers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.emptyText}>No family members registered yet</Text>
          <Text style={styles.emptySubtext}>
            Share your Patient ID with family members so they can register
          </Text>
        </View>
      ) : (
        <FlatList
          data={familyMembers}
          renderItem={renderFamilyMember}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#ed8936',
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
    color: '#feebc8',
  },
  listContent: {
    padding: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  memberEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  memberRelationship: {
    fontSize: 14,
    color: '#ed8936',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
});
