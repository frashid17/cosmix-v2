import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import getSaloonsMap from '../actions/get-saloons-map';
import { Saloon } from '../types';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';

// Extended interface for map salon data
interface MapSalon extends Saloon {
  latitude: number;
  longitude: number;
  averageRating: number;
  reviewCount: number;
}

// Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibHVuYXJsb2JzdGVyIiwiYSI6ImNtZ2p0c3dpYzBrOXUya3F3NXhibXNtdnYifQ.ec_SJSvAUvrYoVVMRB3Ilw';

export default function MapScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [salons, setSalons] = useState<MapSalon[]>([]);
  const [salonsLoading, setSalonsLoading] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<MapSalon | null>(null);
  const [isMenuVisible, setMenuVisible] = useState(false);

  // Load all Philosopher font variants
  const [fontsLoaded] = useFonts({
    'Philosopher-Regular': require('../assets/fonts/Philosopher-Regular.ttf'),
    'Philosopher-Bold': require('../assets/fonts/Philosopher-Bold.ttf'),
    'Philosopher-Italic': require('../assets/fonts/Philosopher-Italic.ttf'),
    'Philosopher-BoldItalic': require('../assets/fonts/Philosopher-BoldItalic.ttf'),
  });

  // Color scheme
  const darkBrown = "#423120";
  const lightBrown = "#D7C3A7";
  const veryLightBeige = "#F4EDE5";
  const white = "#FFFFFF";

  // Sample service providers data (fallback)
  const serviceProviders = [
    {
      id: 1,
      name: "Anna's Beauty Studio",
      coordinate: [24.9384, 60.1699], // [longitude, latitude]
      services: ["Kynsihoidot", "Ripsienpidennykset"],
      rating: 4.8,
      address: "Mannerheimintie 1, Helsinki"
    },
    {
      id: 2,
      name: "Maria's Spa",
      coordinate: [24.9394, 60.1709],
      services: ["Hieronnat", "Gua Sha"],
      rating: 4.9,
      address: "Esplanadi 2, Helsinki"
    },
    {
      id: 3,
      name: "Beauty at Home",
      coordinate: [24.9374, 60.1689],
      services: ["Kynsihoidot", "Ripsienpidennykset", "Hieronnat"],
      rating: 4.7,
      address: "Kluuvikatu 3, Helsinki"
    },
    {
      id: 4,
      name: "Helsinki Hair & Beauty",
      coordinate: [24.9456, 60.1756],
      services: ["Hiustenleikkaus", "Värjäys", "Kynsihoidot"],
      rating: 4.6,
      address: "Kampinkatu 1, Helsinki"
    },
    {
      id: 5,
      name: "Nordic Wellness",
      coordinate: [24.9312, 60.1643],
      services: ["Hieronnat", "Fysioterapia", "Yoga"],
      rating: 4.9,
      address: "Punavuorenkatu 5, Helsinki"
    },
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchSalons();
    }
  }, [userLocation]);

  const fetchSalons = async () => {
    try {
      setSalonsLoading(true);
      console.log('Attempting to fetch salons from API...');
      const salonsData = await getSaloonsMap({
        lat: userLocation?.latitude,
        lng: userLocation?.longitude,
        radius: 10
      });
      console.log('API salons fetched successfully:', salonsData.length);
      
      // Filter out salons without coordinates and check if we have valid salons
      const validSalons = salonsData.filter(salon => 
        salon.latitude && salon.longitude && 
        salon.latitude !== null && salon.longitude !== null
      );
      
      if (validSalons.length > 0) {
        console.log('Valid salons with coordinates:', validSalons.length);
        setSalons(validSalons);
      } else {
        console.log('No salons with valid coordinates, using fallback data');
        // Use fallback data if no valid salons found
        const fallbackSalons = serviceProviders.map(provider => ({
          id: provider.id.toString(),
          name: provider.name,
          userId: '1', // Required field
          address: provider.address,
          latitude: provider.coordinate[1],
          longitude: provider.coordinate[0],
          rating: provider.rating,
          averageRating: provider.rating,
          reviewCount: Math.floor(Math.random() * 50) + 10,
          images: [],
          saloonServices: provider.services.map(service => ({
            saloonId: provider.id.toString(),
            serviceId: Math.random().toString(),
            price: Math.floor(Math.random() * 100) + 20,
            durationMinutes: Math.floor(Math.random() * 120) + 30,
            isAvailable: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            service: {
              id: Math.random().toString(),
              name: service,
              categoryId: '1',
              isPopular: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              category: { id: '1', name: 'Beauty' }
            }
          })),
          user: { id: '1', name: 'Owner', email: 'owner@example.com' },
          reviews: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        setSalons(fallbackSalons);
      }
    } catch (error) {
      console.error('Error fetching salons from API, using fallback data:', error);
      // Fallback to sample data if API fails
      const fallbackSalons = serviceProviders.map(provider => ({
        id: provider.id.toString(),
        name: provider.name,
        userId: '1', // Required field
        address: provider.address,
        latitude: provider.coordinate[1],
        longitude: provider.coordinate[0],
        rating: provider.rating,
        averageRating: provider.rating,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        images: [],
        saloonServices: provider.services.map(service => ({
          saloonId: provider.id.toString(),
          serviceId: Math.random().toString(),
          price: Math.floor(Math.random() * 100) + 20,
          durationMinutes: Math.floor(Math.random() * 120) + 30,
          isAvailable: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          service: {
            id: Math.random().toString(),
            name: service,
            categoryId: '1',
            isPopular: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: { id: '1', name: 'Beauty' }
          }
        })),
        user: { id: '1', name: 'Owner', email: 'owner@example.com' },
        reviews: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      console.log('Using fallback salons:', fallbackSalons.length);
      setSalons(fallbackSalons);
    } finally {
      setSalonsLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby service providers.'
        );
        setLoading(false);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      // Default to Helsinki if location fails
      setUserLocation({
        latitude: 60.1699,
        longitude: 24.9384
      });
    } finally {
      setLoading(false);
    }
  };

  const onMarkerPress = (salon: MapSalon) => {
    setSelectedSalon(salon);
    const services = salon.saloonServices.map(s => s.service.name).join(', ');
    Alert.alert(
      salon.name,
      `Palvelut: ${services}\nArvio: ${salon.averageRating.toFixed(1)}/5 (${salon.reviewCount} arvostelua)\nOsoite: ${salon.address || 'Ei määritelty'}`,
      [
        { text: 'Peruuta', style: 'cancel' },
        { text: 'Varaa aika', onPress: () => router.push('/bookings') },
      ]
    );
  };

  const centerOnUserLocation = () => {
    if (userLocation) {
      // Send message to WebView to center on user location
      const message = JSON.stringify({
        type: 'centerOnLocation',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
      // This will be handled by the WebView
    }
  };

  // Generate HTML for the map
  const generateMapHTML = () => {
    const centerLat = userLocation?.latitude || 60.1699;
    const centerLng = userLocation?.longitude || 24.9384;
    
    const markers = salons.map(salon => ({
      id: salon.id,
      name: salon.name,
      lat: salon.latitude,
      lng: salon.longitude,
      rating: salon.averageRating,
      reviewCount: salon.reviewCount,
      services: salon.saloonServices.map(s => s.service.name).join(', '),
      address: salon.address || 'Ei määritelty'
    }));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Map</title>
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
            background-color: #D7C3A7;
            color: #423120;
            border: 2px solid #423120;
            padding: 12px 16px;
            border-radius: 8px;
            margin-top: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.2s ease;
          }
          .popup-button:hover {
            background-color: #423120;
            color: #D7C3A7;
          }
          .salon-marker {
            background-color: #423120;
            border-radius: 20px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.25);
            position: relative;
            overflow: visible;
          }
          .salon-label {
            pointer-events: none;
            user-select: none;
            background-color: rgba(255, 255, 255, 0.98);
            padding: 6px 10px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: bold;
            color: #423120;
            white-space: nowrap;
            max-width: 100px;
            text-align: center;
            box-shadow: 0 3px 6px rgba(0,0,0,0.25);
            border: 2px solid #D7C3A7;
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div id='map'></div>
        <script>
          mapboxgl.accessToken = '${MAPBOX_TOKEN}';
          
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
            .setPopup(new mapboxgl.Popup().setHTML('<div class="popup-title">Sinun sijaintisi</div>'))
            .addTo(map);
          ` : ''}

          // Add salon markers
          const markers = ${JSON.stringify(markers)};
          
          console.log('All salon markers data:', markers);
          
          markers.forEach(salon => {
            console.log('Processing salon:', salon.name, 'coordinates:', salon.lng, salon.lat);
            // Create a container that holds both the marker and label
            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            
            // Create the scissor marker
            const el = document.createElement('div');
            el.className = 'salon-marker';
            el.style.cursor = 'pointer';
            el.innerHTML = '✂️';
            
            // Create the label
            const labelEl = document.createElement('div');
            labelEl.className = 'salon-label';
            labelEl.innerHTML = salon.name;
            
            // Add both to container
            container.appendChild(labelEl);
            container.appendChild(el);
            
            // No automatic redirect - let the popup handle the interaction

            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(\`
                <div class="popup-title">\${salon.name}</div>
                <div class="popup-details">Arvio: \${salon.rating.toFixed(1)}/5 (\${salon.reviewCount} arvostelua)</div>
                <div class="popup-details">Palvelut: \${salon.services}</div>
                <div class="popup-details">Osoite: \${salon.address}</div>
                <div style="margin-top: 12px;">
                  <button class="popup-button" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type: 'viewServices', salonId: '\${salon.id}', salonName: '\${salon.name}'}))" style="width: 100%;">
                    Katso palvelut
                  </button>
                </div>
              \`);

            // Create single marker with both icon and label
            const marker = new mapboxgl.Marker({
              element: container,
              anchor: 'center'
            })
            .setLngLat([salon.lng, salon.lat])
            .setPopup(popup)
            .addTo(map);
            
            console.log('Created combined marker for salon:', salon.name, 'at coordinates:', salon.lng, salon.lat);
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
      
      if (data.type === 'viewServices') {
        // Navigate to services page with salon information
        const salon = salons.find(s => s.id === data.salonId);
        if (salon) {
          console.log('Navigating to services for salon:', salon.name);
          // Navigate to services page - you can pass salon info as params
          router.push({
            pathname: '/services',
            params: { 
              salonId: salon.id,
              salonName: salon.name,
              categoryName: 'Kaikki palvelut' // or get from salon services
            }
          });
        }
      } else if (data.type === 'bookAppointment') {
        // Handle booking appointment
        const salon = salons.find(s => s.id === data.salonId);
        if (salon) {
          onMarkerPress(salon);
        }
      } else if (data.type === 'salonSelected') {
        // Legacy support
        const salon = salons.find(s => s.id === data.salonId);
        if (salon) {
          onMarkerPress(salon);
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: white }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={darkBrown} />
          <Text style={[styles.loadingText, { color: darkBrown, fontFamily: 'Philosopher-Bold' }]}>
            Ladataan karttaa...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: white }]}>
      {/* Cosmix Header */}
      <Header 
        title="COSMIX" 
        showBack={true} 
        showMenu={true}
        onMenuPress={() => setMenuVisible(true)}
        onBackPress={() => router.back()}
      />

      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: generateMapHTML() }}
          style={styles.map}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={darkBrown} />
              <Text style={[styles.loadingText, { color: darkBrown, fontFamily: 'Philosopher-Bold' }]}>
                Ladataan karttaa...
              </Text>
            </View>
          )}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: white }]}
          onPress={centerOnUserLocation}
          disabled={!userLocation}
        >
          <Ionicons
            name="locate"
            size={24}
            color={userLocation ? darkBrown : "#ccc"}
          />
        </TouchableOpacity>
      </View>

      {/* Service Count */}
      <View style={[styles.serviceCount, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>
        <Text style={[styles.serviceCountText, { color: darkBrown, fontFamily: 'Philosopher-Bold' }]}>
          {salonsLoading ? 'Ladataan...' : `${salons.length} palveluntarjoajaa löytyi`}
        </Text>
        {salons.length === 0 && !salonsLoading && (
          <Text style={[styles.serviceCountText, { color: darkBrown, fontFamily: 'Philosopher-Regular', fontSize: 12, marginTop: 2 }]}>
            Näytetään esimerkkitiedot
          </Text>
        )}
      </View>

      {/* Modal for the side menu */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: veryLightBeige,
              alignSelf: 'flex-end',
            }}
          >
            <SideMenu onClose={() => setMenuVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
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
    top: 80,
    right: 20,
  },
  controlButton: {
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
  serviceCount: {
    position: 'absolute',
    top: 80,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  serviceCountText: {
    fontSize: 14,
  },
  bottomInfo: {
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  subInfoText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
});