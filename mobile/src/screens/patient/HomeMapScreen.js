import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../context/AuthContext';
import { MAPBOX_ACCESS_TOKEN } from '../../config';

const { width, height } = Dimensions.get('window');

export default function HomeMapScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);

  const lat = userProfile?.home_latitude || 0;
  const lng = userProfile?.home_longitude || 0;

  const mapHtml = `
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
          center: [${lng}, ${lat}],
          zoom: 16
        });
        
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = '🏠';
        
        new mapboxgl.Marker(el)
          .setLngLat([${lng}, ${lat}])
          .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Home</h3>'))
          .addTo(map);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Home</Text>
        <Text style={styles.address}>{userProfile?.home_address}</Text>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          source={{ html: mapHtml }}
          style={styles.map}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled
          originWhitelist={['*']}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#48bb78" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>This is your home</Text>
        <Text style={styles.infoText}>
          If you're lost, show this to someone and ask for help getting here.
        </Text>
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
    backgroundColor: '#48bb78',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#c6f6d5',
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  toggleActive: {
    backgroundColor: '#48bb78',
    borderColor: '#48bb78',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
  },
  toggleTextActive: {
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#718096',
  },
  markerContainer: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markerEmoji: {
    fontSize: 30,
  },
  infoCard: {
    margin: 16,
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
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
});
