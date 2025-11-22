import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/constants';
import getSaloonsByService from '../src/app/actions/get-saloons-by-service';

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

  // Search state
  const [query, setQuery] = useState('');
  const [allServices, setAllServices] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    salons: Salon[];
    salonsByService: Salon[];
  }>({ salons: [], salonsByService: [] });

  // Fetch salons from the admin API
  const fetchSalons = async () => {
    try {
      setLoading(true);
      const url = userLocation
        ? `${API_BASE_URL.replace('/api','')}/api/saloons/map?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=10`
        : `${API_BASE_URL.replace('/api','')}/api/saloons/map`;

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

  // Lazy-load all services once (for sub-service search)
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/public/services`);
        const data = await res.json();
        setAllServices(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('Failed to load services for search', e);
      }
    };
    loadServices();
  }, []);

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

  const centerOnSalon = (salon: { latitude: number; longitude: number }) => {
    if (mapRef.current) {
      const message = JSON.stringify({
        type: 'centerOnLocation',
        latitude: salon.latitude,
        longitude: salon.longitude,
      });
      mapRef.current.postMessage(message);
    }
  };

  // Search helpers
  const onChangeQuery = async (text: string) => {
    setQuery(text);
    const normalize = (s: string) =>
      (s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}+/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

    const q = normalize(text);
    const tokens = q.split(' ').filter(Boolean);
    if (q.length === 0) {
      setSearchResults({ salons: [], salonsByService: [] });
      return;
    }

    // Match salons by name/address/intro (more forgiving + scored)
    let matchedSalons = salons
      .map((s) => {
        const hayName = normalize(s.name);
        const hayAddr = normalize(s.address || '');
        const hayIntro = normalize(s.shortIntro || '');
        const hayAll = `${hayName} ${hayAddr} ${hayIntro}`;

        // per-token score
        let score = 0;
        for (const t of tokens) {
          if (!t) continue;
          if (hayName.startsWith(t)) score += 3; // strongest signal
          else if (hayName.includes(t)) score += 2;
          else if (hayAll.includes(t)) score += 1;
        }

        // Single-token direct score as well
        if (tokens.length === 1) {
          const t = tokens[0];
          if (hayName === t) score += 2;
        }

        // keep if any score
        return { salon: s, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.salon);

    // Fallback: if no local markers match, try global salon search from API
    if (matchedSalons.length === 0) {
      try {
        const res = await fetch(`${API_BASE_URL}/public/saloons`);
        if (res.ok) {
          const all = await res.json();
          matchedSalons = (Array.isArray(all) ? all : [])
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              shortIntro: s.shortIntro,
              address: s.address,
              latitude: s.latitude || 0,
              longitude: s.longitude || 0,
              images: (s.images || []).map((img: any) => ({ url: img.url || img })),
              averageRating: s.rating || s.averageRating || 0,
              reviewCount: s.reviewCount || 0,
              saloonServices: [],
            }))
            .filter((s: any) => normalize(`${s.name} ${s.address || ''}`).includes(q));
        }
      } catch {}
    }

    // Match a sub-service and fetch saloons offering it
    setSearching(true);
    try {
      // Find first matching sub-service (has parentServiceId or inside subServices)
      const subServices: any[] = [];
      allServices.forEach((svc: any) => {
        if (Array.isArray(svc.subServices)) {
          svc.subServices.forEach((sub: any) => subServices.push(sub));
        }
      });
      const match = subServices.find((s) => normalize(s.name || '').includes(q));
      let salonsByService: Salon[] = [];
      if (match && match.id) {
        try {
          const saloons = await getSaloonsByService(match.id);
          salonsByService = saloons.map((s: any) => ({
            id: s.id,
            name: s.name,
            shortIntro: s.shortIntro,
            address: s.address,
            latitude: (s as any).latitude || 0,
            longitude: (s as any).longitude || 0,
            images: (s.images || []).map((url: string) => ({ url })),
            averageRating: s.rating || 0,
            reviewCount: 0,
            saloonServices: [],
          }));
        } catch (e) {
          console.warn('Failed fetching saloons by service', e);
        }
      }
      setSearchResults({ salons: matchedSalons, salonsByService });
    } finally {
      setSearching(false);
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

      {/* Search Overlay */}
      <View style={styles.searchContainer}>
        <View style={styles.searchHeaderRow}>
          <Text style={styles.searchTitle}>Etsi palvelua</Text>
          <TouchableOpacity onPress={() => { setQuery(''); setSearchResults({ salons: [], salonsByService: [] }); }}>
            <Ionicons name="close" size={24} color="#423120" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#423120" style={{ marginLeft: 12 }} />
          <TextInput
            placeholder="Kirjoita palvelun nimi..."
            placeholderTextColor="#A89B8C"
            value={query}
            onChangeText={onChangeQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Results */}
        {query.length > 0 && (
          <View style={{ maxHeight: 220, marginTop: 10 }}>
            {searching ? (
              <ActivityIndicator color="#423120" />
            ) : (
              <>
                {searchResults.salons.length > 0 && (
                  <View style={{ marginBottom: 8 }}>
                    {searchResults.salons.slice(0, 5).map((s) => (
                      <TouchableOpacity key={`s-${s.id}`} style={styles.resultRow} onPress={() => centerOnSalon(s)}>
                        <Ionicons name="business" size={18} color="#423120" />
                        <Text numberOfLines={1} style={styles.resultText}>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {searchResults.salonsByService.length > 0 && (
                  <View>
                    {searchResults.salonsByService.slice(0, 5).map((s) => (
                      <TouchableOpacity key={`sb-${s.id}`} style={styles.resultRow} onPress={() => centerOnSalon(s)}>
                        <Ionicons name="pin" size={18} color="#423120" />
                        <Text numberOfLines={1} style={styles.resultText}>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </View>
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
  // Search overlay styles
  searchContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    // Push up from system nav bar
    bottom: Platform.OS === 'android' ? 110 : 80,
    backgroundColor: '#F4EDE5',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  searchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchTitle: {
    fontFamily: 'Philosopher-Bold',
    fontSize: 22,
    color: '#423120',
  },
  searchInputWrapper: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#D7C3A7',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#423120',
    fontFamily: 'Philosopher-Regular',
  },
  resultRow: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultText: {
    flex: 1,
    color: '#423120',
    fontFamily: 'Philosopher-Bold',
  },
});


