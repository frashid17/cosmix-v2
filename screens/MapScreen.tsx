import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { SalonMapView } from '../components/SalonMapView';
import { Salon } from '../types/salon'; // You'll need to create this type

export const MapScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show nearby salons.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setLocationPermission(true);
          getCurrentLocation();
        } else {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to show nearby salons.'
          );
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermission(true);
          getCurrentLocation();
        } else {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to show nearby salons.'
          );
        }
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your location settings.'
      );
    }
  };

  const handleSalonSelect = (salon: Salon) => {
    // Navigate to salon details screen
    // You can implement navigation here using React Navigation
    Alert.alert(
      'Salon Selected',
      `You selected: ${salon.name}\n\nRating: ${salon.averageRating.toFixed(1)} ⭐\nServices: ${salon.saloonServices.length} available`,
      [
        { text: 'OK' },
        { text: 'View Details', onPress: () => {
          // Navigate to salon details
          console.log('Navigate to salon details:', salon.id);
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Salons</Text>
        <Text style={styles.headerSubtitle}>
          {locationPermission 
            ? 'Tap on markers to see salon details' 
            : 'Enable location to see nearby salons'
          }
        </Text>
      </View>
      
      <SalonMapView
        userLocation={userLocation || undefined}
        onSalonSelect={handleSalonSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EDE5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0D7CA',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Philosopher-Bold',
    color: '#423120',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});


