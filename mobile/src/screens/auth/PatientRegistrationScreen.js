import React, { useState, useRef } from 'react';
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
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { registerPatient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MAPBOX_ACCESS_TOKEN } from '../../config';

export default function PatientRegistrationScreen({ navigation }) {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const skipNextChangeRef = useRef(false);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const fullAddress = `${address.street || ''} ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim();
        setHomeAddress(fullAddress);
      }

      Alert.alert('Success', 'Home location set successfully');
    } catch (error) {
      Alert.alert('Error', 'Could not get location');
    } finally {
      setLocationLoading(false);
    }
  };

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5&types=address,place`
      );
      const data = await response.json();
      
      if (data.features) {
        setSuggestions(data.features);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.log('Address search error:', error);
    }
  };

  const handleAddressChange = (text) => {
    // Skip if we just selected a suggestion
    if (skipNextChangeRef.current) {
      console.log('Skipping change handler - suggestion was selected');
      skipNextChangeRef.current = false;
      return;
    }
    
    console.log('Address changed by typing:', text);
    setHomeAddress(text);
    setCoordinates(null);
    
    // Debounce the search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      searchAddress(text);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const selectSuggestion = (suggestion) => {
    // Set flag to skip the next onChangeText call
    skipNextChangeRef.current = true;
    
    // Hide suggestions first
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Debug log
    console.log('Selected suggestion:', suggestion);
    console.log('Center:', suggestion.center);
    
    // Mapbox returns [longitude, latitude] in center array
    const lng = suggestion.center[0];
    const lat = suggestion.center[1];
    
    console.log('Setting coords:', lat, lng);
    
    // Set address and coordinates
    setHomeAddress(suggestion.place_name);
    setCoordinates({
      latitude: lat,
      longitude: lng,
    });
  };

  const handleRegister = async () => {
    if (!name || !homeAddress || !coordinates) {
      Alert.alert('Error', 'Please fill in all required fields and set your home location');
      return;
    }

    setLoading(true);
    try {
      await registerPatient({
        name,
        email: user.email,
        phone,
        home_address: homeAddress,
        home_latitude: coordinates.latitude,
        home_longitude: coordinates.longitude,
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
          <Text style={styles.title}>Patient Registration</Text>
          <Text style={styles.subtitle}>Tell us about yourself</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name *</Text>
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

            <Text style={styles.label}>Home Address *</Text>
            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="Start typing your address..."
              placeholderTextColor="#999"
              value={homeAddress}
              onChangeText={handleAddressChange}
              multiline
            />

            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={item.id || index}
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(item)}
                  >
                    <Text style={styles.suggestionIcon}>📍</Text>
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {item.place_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator color="#4299e1" />
              ) : (
                <Text style={styles.locationButtonText}>
                  📍 Use Current Location as Home
                </Text>
              )}
            </TouchableOpacity>

            {coordinates && (
              <Text style={styles.coordinatesText}>
                Location set: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
              </Text>
            )}

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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addressInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: -12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#4a5568',
  },
  locationButton: {
    backgroundColor: '#ebf8ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4299e1',
  },
  locationButtonText: {
    color: '#4299e1',
    fontSize: 16,
    fontWeight: '600',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#48bb78',
    textAlign: 'center',
    marginBottom: 16,
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
});
