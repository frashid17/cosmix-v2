import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import getSaloonsMap from '../actions/get-saloons-map';
import getServices from '../actions/get-services';
import { Saloon, Service } from '../types';
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
  const insets = useSafeAreaInsets();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [salons, setSalons] = useState<MapSalon[]>([]);
  const [salonsLoading, setSalonsLoading] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<MapSalon | null>(null);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<MapSalon[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [webViewRef, setWebViewRef] = useState<WebView | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardsFlatListRef = useRef<FlatList>(null);

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

  // Load all services for search
  useEffect(() => {
    const loadServices = async () => {
      try {
        setSearchLoading(true);
        // Fetch all services by getting all categories first, then their services
        // Or use a different endpoint if available
        // For now, extract from salon data as fallback
        const fallbackServices = extractServicesFromSalons(salons);
        if (fallbackServices.length > 0) {
          setServices(fallbackServices);
          setFilteredServices(fallbackServices);
        }
      } catch (error) {
        console.error('Error loading services:', error);
        // Fallback: Extract services from salon data
        const fallbackServices = extractServicesFromSalons(salons);
        setServices(fallbackServices);
        setFilteredServices(fallbackServices);
      } finally {
        setSearchLoading(false);
      }
    };

    // Only load services after salons are loaded
    if (salons.length > 0) {
      loadServices();
    }
  }, [salons]);

  // Extract services from salons when they're loaded (fallback)
  useEffect(() => {
    if (salons.length > 0 && services.length === 0) {
      const fallbackServices = extractServicesFromSalons(salons);
      if (fallbackServices.length > 0) {
        setServices(fallbackServices);
        setFilteredServices(fallbackServices);
      }
    }
  }, [salons]);

  const fetchSalons = async () => {
    try {
      setSalonsLoading(true);
      const salonsData = await getSaloonsMap({
        lat: userLocation?.latitude,
        lng: userLocation?.longitude,
        radius: 10
      });

      // Filter out salons without coordinates and check if we have valid salons
      const validSalons = salonsData.filter(salon =>
        salon.latitude && salon.longitude &&
        salon.latitude !== null && salon.longitude !== null
      );

      if (validSalons.length > 0) {
        setSalons(validSalons);
      } else {
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

  // Sync FlatList when selectedSalon changes externally (e.g., marker click)
  useEffect(() => {
    if (selectedSalon && salons.length > 0) {
      const index = salons.findIndex(s => s.id === selectedSalon.id);
      if (index !== -1 && index !== activeCardIndex) {
        setActiveCardIndex(index);
        // Use setTimeout to ensure FlatList is ready
        setTimeout(() => {
          try {
            cardsFlatListRef.current?.scrollToIndex({ 
              index, 
              animated: true,
              viewPosition: 0.5 
            });
          } catch {
            // Fallback to scrollToOffset if scrollToIndex fails
            const cardWidth = Dimensions.get('window').width - 50;
            cardsFlatListRef.current?.scrollToOffset({ 
              offset: index * (cardWidth + 20), 
              animated: true 
            });
          }
        }, 100);
      }
    }
  }, [selectedSalon?.id, salons.length]);

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

  // Just center the map on salon (used by search button)
  const centerMapOnSalon = (salon: MapSalon) => {
    if (webViewRef) {
      const message = JSON.stringify({
        type: 'centerOnLocation',
        latitude: salon.latitude,
        longitude: salon.longitude,
      });
      webViewRef.postMessage(message);
    }
    setSearchVisible(false);
  };

  // Navigate to salon-sector page (used when clicking salon in list)
  const navigateToSalonSector = (salon: MapSalon) => {
    // First center the map
    if (webViewRef) {
      const message = JSON.stringify({
        type: 'centerOnLocation',
        latitude: salon.latitude,
        longitude: salon.longitude,
      });
      webViewRef.postMessage(message);
    }
    setSearchVisible(false);
    // Then navigate to salon-sector page to show categories for this salon
    router.push({
      pathname: "/salon-sector",
      params: {
        salonId: salon.id,
        salonName: salon.name
      }
    });
  };

  // Extract services from salon data as fallback
  const extractServicesFromSalons = (salonData: MapSalon[]): Service[] => {
    const serviceMap = new Map<string, Service>();

    salonData.forEach(salon => {
      // Check if salon has saloonServices
      if (salon.saloonServices && Array.isArray(salon.saloonServices)) {
        salon.saloonServices.forEach(saloonService => {
          if (saloonService.service) {
            const service = saloonService.service;
            if (!serviceMap.has(service.id)) {
              serviceMap.set(service.id, {
                ...service,
                isPopular: service.isPopular || false,
                subServices: service.subServices || [],
                saloonServices: service.saloonServices || [],
              });
            }
          }
        });
      }
    });

    return Array.from(serviceMap.values());
  };

  // Search functionality
  const handleSearchPress = () => {
    setSearchVisible(true);
  };

  const handleSearchQuery = (query: string) => {
    setSearchQuery(query);
    const normalize = (s: string) => (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
    const q = normalize(query);
    if (q.length === 0) {
      setFilteredServices(services);
      setFilteredSalons([]);
      return;
    }
    // Services filter
    const svc = services.filter(service => normalize(service.name).includes(q));
    setFilteredServices(svc);
    // Salons filter with scoring
    const tokens = q.split(' ').filter(Boolean);
    const sal = salons
      .map((s) => {
        const name = normalize(s.name);
        const addr = normalize(s.address || '');
        const hay = `${name} ${addr}`;
        let score = 0;
        for (const t of tokens) {
          if (name.startsWith(t)) score += 3;
          else if (name.includes(t)) score += 2;
          else if (hay.includes(t)) score += 1;
        }
        return { s, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.s);
    setFilteredSalons(sal);
  };

  const handleServiceSelect = async (service: Service) => {
    try {
      setSearchLoading(true);
      setSearchVisible(false);

      // Filter salons that offer this service
      // For now, we'll show all salons since we don't have service data in MapSalon
      // In a real implementation, you'd need to fetch salon services or include them in the map data
      const salonsWithService = salons; // Show all salons for now

      if (salonsWithService.length > 0) {
        // Calculate center point of salons with this service
        const avgLat = salonsWithService.reduce((sum, salon) => sum + salon.latitude, 0) / salonsWithService.length;
        const avgLng = salonsWithService.reduce((sum, salon) => sum + salon.longitude, 0) / salonsWithService.length;

        // Send message to WebView to zoom to these salons
        if (webViewRef) {
          const message = JSON.stringify({
            type: 'zoomToService',
            center: { latitude: avgLat, longitude: avgLng },
            salons: salonsWithService,
            serviceName: service.name
          });
          webViewRef.postMessage(message);
        }

        Alert.alert(
          'Palvelu löytyi!',
          `Löytyi ${salonsWithService.length} salon ${service.name} palvelulla. Kartta on keskitetty näihin saloneihin.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Palvelua ei löytynyt',
          `Valitettavasti kukaan salon ei tarjoa "${service.name}" palvelua tällä hetkellä.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error filtering salons by service:', error);
      Alert.alert('Virhe', 'Palvelun hakemisessa tapahtui virhe.');
    } finally {
      setSearchLoading(false);
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
            font-size: 30px;
            cursor: pointer;
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
          
          markers.forEach(salon => {
            // Create a container that holds both the marker and label
            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            
            // Create the spa marker
            const el = document.createElement('div');
            el.className = 'salon-marker';
            el.style.cursor = 'pointer';
            el.innerHTML = '🧖‍♀️';
            
            // Create the label
            const labelEl = document.createElement('div');
            labelEl.className = 'salon-label';
            labelEl.innerHTML = salon.name;
            
            // Add both to container
            container.appendChild(labelEl);
            container.appendChild(el);
            
            // Create single marker with both icon and label (no popup button)
            const marker = new mapboxgl.Marker({
              element: container,
              anchor: 'center'
            })
            .setLngLat([salon.lng, salon.lat])
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
            } else if (data.type === 'zoomToService') {
              // Zoom to salons offering a specific service
              map.flyTo({
                center: [data.center.longitude, data.center.latitude],
                zoom: 14,
                duration: 2000
              });
              
              // Show a popup with service info
              setTimeout(() => {
                const popup = new mapboxgl.Popup({ 
                  closeButton: true,
                  closeOnClick: false,
                  offset: 25
                })
                .setLngLat([data.center.longitude, data.center.latitude])
                .setHTML(
                  '<div class="popup-title">' + data.serviceName + '</div>' +
                  '<div class="popup-details">Löytyi ' + data.salons.length + ' salon tällä palvelulla</div>' +
                  '<div class="popup-details">Salonit: ' + data.salons.map(s => s.name).join(', ') + '</div>'
                )
                .addTo(map);
              }, 2000);
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
            } else if (data.type === 'zoomToService') {
              // Zoom to salons offering a specific service
              map.flyTo({
                center: [data.center.longitude, data.center.latitude],
                zoom: 14,
                duration: 2000
              });
              
              // Show a popup with service info
              setTimeout(() => {
                const popup = new mapboxgl.Popup({ 
                  closeButton: true,
                  closeOnClick: false,
                  offset: 25
                })
                .setLngLat([data.center.longitude, data.center.latitude])
                .setHTML(
                  '<div class="popup-title">' + data.serviceName + '</div>' +
                  '<div class="popup-details">Löytyi ' + data.salons.length + ' salon tällä palvelulla</div>' +
                  '<div class="popup-details">Salonit: ' + data.salons.map(s => s.name).join(', ') + '</div>'
                )
                .addTo(map);
              }, 2000);
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

  if (loading) {
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
        disableSafeAreaPadding={true}
      />

      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={setWebViewRef}
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

        {/* Floating Search Bar */}
        {/* <View style={[styles.searchContainer, { bottom: 100 + insets.bottom }]}>
          <TouchableOpacity style={styles.searchBar} activeOpacity={0.8} onPress={handleSearchPress}>
            <Ionicons name="search" size={31} color={darkBrown} style={styles.searchIcon} />
            <Text style={[styles.searchText, { color: darkBrown }]}>
              Etsi hoitoja lähelläsi
            </Text>
          </TouchableOpacity>
        </View> */}

        {/* Bottom Swipeable Cards */}
        {salons.length > 0 && (
          <View style={[styles.cardsContainer, { bottom: 50 + insets.bottom }]}>
            <FlatList
              ref={cardsFlatListRef}
              data={salons}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled={false}
              // One-swipe-per-card snapping
              snapToInterval={Dimensions.get('window').width - 30} // cardWidth (W-50) + marginRight (20)
              snapToAlignment="start"
              decelerationRate="fast"
              contentContainerStyle={styles.cardsContentContainer}
              scrollEnabled={true}
              bounces={false}
              getItemLayout={(data, index) => {
                const length = Dimensions.get('window').width - 30; // must match snapToInterval
                const offset = 20 + index * length; // left padding 20 + index * itemLength
                return { length, offset, index };
              }}
              onViewableItemsChanged={({ viewableItems }) => {
                if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                  const index = viewableItems[0].index;
                  const salon = salons[index];
                  setActiveCardIndex(index);
                  setSelectedSalon(salon);
                  // Move map camera to the active card's salon
                  centerMapOnSalon(salon);
                }
              }}
              viewabilityConfig={{
                itemVisiblePercentThreshold: 50,
              }}
              renderItem={({ item: salon, index }) => (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => {
                    // Navigate to services page with salon information (same as "Katso palvelut" button)
                    router.push({
                      pathname: '/services',
                      params: {
                        salonId: salon.id,
                        salonName: salon.name,
                        categoryName: 'Kaikki palvelut'
                      }
                    });
                  }}
                >
                  {/* Thumbnail Image */}
                  <Image
                    source={{
                      uri: salon.images && salon.images.length > 0
                        ? salon.images[0].url
                        : 'https://via.placeholder.com/80x80?text=No+Image'
                    }}
                    style={styles.cardThumbnail}
                    resizeMode="cover"
                  />
                  
                  {/* Card Content */}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {salon.name}
                    </Text>
                    
                    {/* Rating Row */}
                    <View style={styles.cardRatingRow}>
                      <Text style={styles.cardRating}>
                        {salon.averageRating ? salon.averageRating.toFixed(1) : salon.rating?.toFixed(1) || '0.0'}
                      </Text>
                      <Text style={styles.cardStar}>⭐ • Salonki</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Modal for the side menu */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isMenuVisible}
        onRequestClose={() => setMenuVisible(false)}
        statusBarTranslucent={true}
      >
        <SideMenu onClose={() => setMenuVisible(false)} />
      </Modal>

      {/* Search Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSearchVisible}
        onRequestClose={() => setSearchVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'android' ? insets.bottom : 0}
        >
          <View style={styles.searchModalOverlay}>
            <View style={[styles.searchModalContent, { paddingBottom: insets.bottom + 20 }]}>
              {/* Search Header */}
              <View style={styles.searchHeader}>
                <Text style={[styles.searchTitle, { color: darkBrown, fontFamily: 'Philosopher-Bold' }]}>
                  Etsi palvelua
                </Text>
                <TouchableOpacity onPress={() => setSearchVisible(false)}>
                  <Ionicons name="close" size={24} color={darkBrown} />
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color={darkBrown} style={styles.searchInputIcon} />
                <TextInput
                  style={[styles.searchInput, { color: darkBrown, fontFamily: 'Philosopher-Regular' }]}
                  placeholder="Kirjoita palvelun nimi..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearchQuery}
                  autoFocus={true}
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    if (filteredSalons.length > 0) {
                      centerMapOnSalon(filteredSalons[0]);
                    } else if (filteredServices.length > 0) {
                      handleServiceSelect(filteredServices[0]);
                    }
                  }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => {
                      if (filteredSalons.length > 0) {
                        centerMapOnSalon(filteredSalons[0]);
                      } else if (filteredServices.length > 0) {
                        handleServiceSelect(filteredServices[0]);
                      }
                    }}
                    disabled={filteredSalons.length === 0 && filteredServices.length === 0}
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={(filteredSalons.length > 0 || filteredServices.length > 0) ? darkBrown : "#ccc"}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Search Action Button */}



              {/* Salons and Services List */}
              {searchLoading ? (
                <View style={styles.searchLoadingContainer}>
                  <ActivityIndicator size="large" color={darkBrown} />
                  <Text style={[styles.searchLoadingText, { color: darkBrown, fontFamily: 'Philosopher-Regular' }]}>
                    Ladataan palveluja...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={[
                    ...filteredSalons.map(s => ({ type: 'salon', key: `salon-${s.id}`, salon: s })),
                    ...filteredServices.map(s => ({ type: 'service', key: `service-${s.id}`, service: s })),
                  ]}
                  keyExtractor={(item) => item.key}
                  style={styles.servicesList}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => {
                    const it: any = item;
                    return it.type === 'salon' ? (
                      <TouchableOpacity
                        style={styles.serviceItem}
                        onPress={() => navigateToSalonSector(it.salon)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.serviceName, { color: darkBrown, fontFamily: 'Philosopher-Bold' }]}>
                          {it.salon.name}
                        </Text>
                        {it.salon.address ? (
                          <Text style={[styles.serviceDescription, { color: '#666', fontFamily: 'Philosopher-Regular' }]}>
                            {it.salon.address}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.serviceItem}
                        onPress={() => handleServiceSelect(it.service)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.serviceName, { color: darkBrown, fontFamily: 'Philosopher-Bold' }]}>
                          {it.service.name}
                        </Text>
                        {it.service.description && (
                          <Text style={[styles.serviceDescription, { color: '#666', fontFamily: 'Philosopher-Regular' }]}>
                            {it.service.description}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={[styles.emptyText, { color: darkBrown, fontFamily: 'Philosopher-Regular' }]}>
                        {searchQuery ? 'Ei tuloksia – kokeile toista hakusanaa' : 'Aloita kirjoittamalla palvelun tai salon nimen'}
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
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
  searchContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#423120',
    width: 320,
    height: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    width: 31,
    height: 31,
    marginRight: 12,
  },
  searchText: {
    fontSize: 23,
    fontFamily: 'Philosopher-Bold',
    flex: 1,
  },
  // Search Modal Styles
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  searchModalContent: {
    backgroundColor: '#F4EDE5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D7C3A7',
  },
  searchTitle: {
    fontSize: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#423120',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchActionContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchActionText: {
    fontSize: 18,
  },
  searchLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  searchLoadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  servicesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  serviceItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D7C3A7',
  },
  serviceName: {
    fontSize: 18,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Bottom Swipeable Cards Styles
  cardsContainer: {
    position: 'absolute',
    bottom: 50, // Position above bottom tab bar (typical tab bar height is ~60-80px)
    left: 0,
    right: 0,
    height: 120,
  },
  cardsContentContainer: {
    paddingLeft: 20,
    paddingRight: 20, // Standard padding, will be adjusted per card
  },
  card: {
    width: Dimensions.get('window').width - 50, // Smaller width to show peek of next card (reduced peek)
    height: 90,
    backgroundColor: '#D7C3A7',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#423120',
  },
  cardThumbnail: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: '#F4EDE5',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 18,
    fontFamily: 'Philosopher-Bold',
    color: '#423120',
    marginBottom: 6,
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align rating number and star on the same baseline
  },
  cardRating: {
    fontSize: 16,
    fontFamily: 'Philosopher-Bold',
    color: '#423120',
    marginRight: 4,
  },
  cardStar: {
    fontSize: 16,
    color: '#423120',
    fontFamily: 'Philosopher-Bold',
    marginBottom: 1, // Tiny adjustment so the star visually lines up with the number
  },
});