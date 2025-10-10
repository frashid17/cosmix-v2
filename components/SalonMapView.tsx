import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface Salon {
  id: string;
  name: string;
  shortIntro?: string;
  address?: string;
  latitude: number;
  longitude: number;
  images: Array<{ url: string }>;
  averageRating: number;
  reviewCount: number;
  saloonServices: Array<{
    service: {
      name: string;
      category: {
        name: string;
      };
    };
    price: number;
    durationMinutes: number;
  }>;
}

interface SalonMapViewProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onSalonSelect?: (salon: Salon) => void;
}

const { width, height } = Dimensions.get('window');

export const SalonMapView: React.FC<SalonMapViewProps> = ({
  userLocation,
  onSalonSelect,
}) => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const mapRef = useRef<WebView>(null);

  // Fetch salons from the admin API
  const fetchSalons = async () => {
    try {
      setLoading(true);
      const baseUrl = 'http://localhost:3000'; // Replace with your admin API URL
      const url = userLocation
        ? `${baseUrl}/api/saloons/map?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=10`
        : `${baseUrl}/api/saloons/map`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch salons');
      }

      const data = await response.json();
      setSalons(data);
    } catch (error) {
      console.error('Error fetching salons:', error);
      Alert.alert('Error', 'Failed to load salons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, [userLocation]);

  // Update map when user location changes
  useEffect(() => {
    if (userLocation && mapRef.current) {
      const message = JSON.stringify({
        type: 'centerOnLocation',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
      mapRef.current.postMessage(message);
    }
  }, [userLocation]);

  const handleMarkerPress = (salon: Salon) => {
    setSelectedSalon(salon);
    if (onSalonSelect) {
      onSalonSelect(salon);
    }
  };

  const handleCalloutPress = (salon: Salon) => {
    Alert.alert(
      salon.name,
      `Rating: ${salon.averageRating.toFixed(1)} ⭐ (${salon.reviewCount} reviews)\n\nServices: ${salon.saloonServices.length} available\n\nAddress: ${salon.address || 'Not specified'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => onSalonSelect?.(salon) },
      ]
    );
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      const message = JSON.stringify({
        type: 'centerOnLocation',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
      mapRef.current.postMessage(message);
    }
  };

  // Generate HTML for the map
  const generateMapHTML = () => {
    const centerLat = userLocation?.latitude || 48.8566;
    const centerLng = userLocation?.longitude || 2.3522;
    
    const markers = salons.map(salon => ({
      id: salon.id,
      name: salon.name,
      lat: salon.latitude,
      lng: salon.longitude,
      rating: salon.averageRating,
      reviewCount: salon.reviewCount,
      services: salon.saloonServices.map(s => s.service.name).join(', '),
      address: salon.address || 'Not specified'
    }));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Salon Map</title>
        <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .mapboxgl-popup-content {
            border-radius: 12px;
            padding: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .popup-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 8px;
            color: #423120;
          }
          .popup-details {
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
          }
          .popup-button {
            background-color: #423120;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            margin-top: 8px;
            cursor: pointer;
            font-size: 14px;
          }
          .popup-button:hover {
            background-color: #2a1f15;
          }
        </style>
      </head>
      <body>
        <div id='map'></div>
        <script>
          mapboxgl.accessToken = 'pk.eyJ1IjoibHVuYXJsb2JzdGVyIiwiYSI6ImNtZ2p0c3dpYzBrOXUya3F3NXhibXNtdnYifQ.ec_SJSvAUvrYoVVMRB3Ilw';
          
          const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [${centerLng}, ${centerLat}],
            zoom: 13
          });

          // Add user location marker
          ${userLocation ? `
          new mapboxgl.Marker({ color: '#007AFF' })
            .setLngLat([${userLocation.longitude}, ${userLocation.latitude}])
            .setPopup(new mapboxgl.Popup().setHTML('<div class="popup-title">Your Location</div>'))
            .addTo(map);
          ` : ''}

          // Add salon markers
          const markers = ${JSON.stringify(markers)};
          
          markers.forEach(salon => {
            const el = document.createElement('div');
            el.className = 'salon-marker';
            el.style.width = '40px';
            el.style.height = '40px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = '#423120';
            el.style.border = '2px solid white';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.color = 'white';
            el.style.fontSize = '20px';
            el.innerHTML = '✂️';

            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(\`
                <div class="popup-title">\${salon.name}</div>
                <div class="popup-details">Rating: \${salon.rating.toFixed(1)}/5 (\${salon.reviewCount} reviews)</div>
                <div class="popup-details">Services: \${salon.services}</div>
                <div class="popup-details">Address: \${salon.address}</div>
                <button class="popup-button" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type: 'salonSelected', salonId: '\${salon.id}'}))">
                  View Details
                </button>
              \`);

            new mapboxgl.Marker(el)
              .setLngLat([salon.lng, salon.lat])
              .setPopup(popup)
              .addTo(map);
          });

          // Listen for messages from React Native
          window.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'centerOnLocation') {
              map.flyTo({
                center: [data.longitude, data.latitude],
                zoom: 15,
                duration: 2000
              });
            }
          });

          // Handle WebView messages
          document.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'centerOnLocation') {
              map.flyTo({
                center: [data.longitude, data.latitude],
                zoom: 15,
                duration: 2000
              });
            }
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'salonSelected') {
        const salon = salons.find(s => s.id === data.salonId);
        if (salon) {
          handleMarkerPress(salon);
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#423120" />
        <Text style={styles.loadingText}>Loading salons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={mapRef}
        source={{ html: generateMapHTML() }}
        style={styles.map}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.webViewLoading}>
            <ActivityIndicator size="large" color="#423120" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
      />

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnUserLocation}
          disabled={!userLocation}
        >
          <Ionicons
            name="locate"
            size={24}
            color={userLocation ? "#423120" : "#ccc"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={fetchSalons}
        >
          <Ionicons name="refresh" size={24} color="#423120" />
        </TouchableOpacity>
      </View>

      {/* Salon Count */}
      <View style={styles.salonCount}>
        <Text style={styles.salonCountText}>
          {salons.length} salon{salons.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Selected Salon Info */}
      {selectedSalon && (
        <View style={styles.selectedSalonInfo}>
          <Text style={styles.selectedSalonName}>{selectedSalon.name}</Text>
          <Text style={styles.selectedSalonDetails}>
            {selectedSalon.averageRating.toFixed(1)} ⭐ • {selectedSalon.saloonServices.length} services
          </Text>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => onSalonSelect?.(selectedSalon)}
          >
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4EDE5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#423120',
    fontFamily: 'Philosopher-Bold',
  },
  customMarker: {
    backgroundColor: '#423120',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userLocationMarker: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  controls: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'column',
    gap: 10,
  },
  controlButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  salonCount: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  salonCountText: {
    fontSize: 14,
    color: '#423120',
    fontFamily: 'Philosopher-Bold',
  },
  selectedSalonInfo: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedSalonName: {
    fontSize: 18,
    fontFamily: 'Philosopher-Bold',
    color: '#423120',
    marginBottom: 4,
  },
  selectedSalonDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  viewDetailsButton: {
    backgroundColor: '#423120',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Philosopher-Bold',
  },
});


