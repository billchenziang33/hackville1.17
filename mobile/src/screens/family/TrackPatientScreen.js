import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../context/AuthContext';
import { getPatientLocation, getPatientHome } from '../../services/api';
import { MAPBOX_ACCESS_TOKEN } from '../../config';

export default function TrackPatientScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [patientLocation, setPatientLocation] = useState(null);
  const [homeLocation, setHomeLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadLocations = async () => {
    try {
      const [location, home] = await Promise.all([
        getPatientLocation(userProfile.patient_id),
        getPatientHome(userProfile.patient_id),
      ]);

      setPatientLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setHomeLocation({
        latitude: home.home_latitude,
        longitude: home.home_longitude,
        address: home.home_address,
      });
      setLastUpdated(new Date(location.timestamp));
    } catch (error) {
      if (error.response?.status === 404) {
        Alert.alert('Location Not Available', 'Patient location is not being shared yet.');
      } else {
        console.log('Error loading locations:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
    const interval = setInterval(loadLocations, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMapHtml = () => {
    if (!patientLocation) return '';
    const pLat = patientLocation.latitude;
    const pLng = patientLocation.longitude;
    const hLat = homeLocation?.latitude || pLat;
    const hLng = homeLocation?.longitude || pLng;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .marker { font-size: 30px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          mapboxgl.accessToken = '${MAPBOX_ACCESS_TOKEN}';
          const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [${pLng}, ${pLat}],
            zoom: 14
          });
          
          // Patient marker
          const patientEl = document.createElement('div');
          patientEl.innerHTML = '🧓';
          patientEl.style.fontSize = '30px';
          new mapboxgl.Marker(patientEl)
            .setLngLat([${pLng}, ${pLat}])
            .setPopup(new mapboxgl.Popup().setHTML('<h3>Patient Location</h3>'))
            .addTo(map);
          
          // Home marker
          const homeEl = document.createElement('div');
          homeEl.innerHTML = '🏠';
          homeEl.style.fontSize = '30px';
          new mapboxgl.Marker(homeEl)
            .setLngLat([${hLng}, ${hLat}])
            .setPopup(new mapboxgl.Popup().setHTML('<h3>Home</h3>'))
            .addTo(map);
        </script>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e53e3e" />
        <Text style={styles.loadingText}>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Track Patient</Text>
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
      </View>

      <View style={styles.mapContainer}>
        {patientLocation ? (
          <WebView
            source={{ html: getMapHtml() }}
            style={styles.map}
            javaScriptEnabled
            originWhitelist={['*']}
          />
        ) : (
          <View style={styles.noLocationContainer}>
            <Text style={styles.noLocationEmoji}>📍</Text>
            <Text style={styles.noLocationText}>Location not available</Text>
            <Text style={styles.noLocationSubtext}>
              The patient's location is not being shared
            </Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={loadLocations}>
          <Text style={styles.controlEmoji}>🔄</Text>
          <Text style={styles.controlText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {patientLocation && homeLocation && (
        <View style={styles.distanceCard}>
          <Text style={styles.distanceLabel}>Distance from home</Text>
          <Text style={styles.distanceValue}>
            {calculateDistance(patientLocation, homeLocation).toFixed(0)} meters
          </Text>
        </View>
      )}
    </View>
  );
}

function calculateDistance(coord1, coord2) {
  const R = 6371e3; // Earth's radius in meters
  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#718096',
  },
  header: {
    backgroundColor: '#e53e3e',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#fed7d7',
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  patientMarker: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#e53e3e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  homeMarker: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#48bb78',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markerEmoji: {
    fontSize: 24,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  noLocationEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  noLocationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
  },
  noLocationSubtext: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  controlButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  controlEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  controlText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '600',
  },
  distanceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  distanceLabel: {
    fontSize: 12,
    color: '#718096',
  },
  distanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
});
