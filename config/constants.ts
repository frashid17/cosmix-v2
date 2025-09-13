// config/constants.ts
import { Platform } from 'react-native';

// Get environment variables
const STORE_ID = process.env.EXPO_PUBLIC_STORE_ID;
const DEV_IP = process.env.EXPO_PUBLIC_DEV_IP;
const DEV_PORT = process.env.EXPO_PUBLIC_DEV_PORT || '3000';
const PRODUCTION_DOMAIN = process.env.EXPO_PUBLIC_PRODUCTION_DOMAIN;
const STAGING_DOMAIN = process.env.EXPO_PUBLIC_STAGING_DOMAIN;

// Validate required environment variables
if (!STORE_ID) {
  throw new Error('EXPO_PUBLIC_STORE_ID is not defined in environment variables');
}

if (!PRODUCTION_DOMAIN) {
  throw new Error('EXPO_PUBLIC_PRODUCTION_DOMAIN is not defined in environment variables');
}

if (__DEV__ && !DEV_IP) {
  console.warn('EXPO_PUBLIC_DEV_IP is not defined. Using fallback IP address.');
}

// Equivalent to process.env.NEXT_PUBLIC_API_URL but for React Native
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development environment
    const devIP = DEV_IP || '192.168.0.102'; // fallback IP
    
    if (Platform.OS === 'android') {
      return `http://${devIP}:${DEV_PORT}/api/${STORE_ID}`; // Android emulator
    } else if (Platform.OS === 'ios') {
      return `http://localhost:${DEV_PORT}/api/${STORE_ID}`; // iOS simulator
    } else {
      return `http://${devIP}:${DEV_PORT}/api/${STORE_ID}`; // Physical device
    }
  }
  
  // Check if we're in staging environment (you can customize this logic)
  const isStaging = process.env.EXPO_PUBLIC_ENV === 'staging' || 
                   process.env.NODE_ENV === 'staging';
  
  if (isStaging && STAGING_DOMAIN) {
    return `https://${STAGING_DOMAIN}/api/${STORE_ID}`;
  }
  
  // Production environment
  return `https://${PRODUCTION_DOMAIN}/api/${STORE_ID}`;
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  CATEGORIES: `${API_BASE_URL}/categories`,
  SERVICES: `${API_BASE_URL}/services`,
  // Add more endpoints as needed
  BOOKINGS: `${API_BASE_URL}/bookings`,
  PRODUCTS: `${API_BASE_URL}/products`,
  CHECKOUT: `${API_BASE_URL}/checkout`,
} as const;

// Export store ID for use in other parts of the app
export const CURRENT_STORE_ID = STORE_ID;

// Export other useful constants
export const CONFIG = {
  STORE_ID,
  DEV_IP,
  DEV_PORT,
  PRODUCTION_DOMAIN,
  STAGING_DOMAIN,
  IS_DEV: __DEV__,
  PLATFORM: Platform.OS,
} as const;

// Debug logging in development
if (__DEV__) {
  console.log('API Configuration:', {
    API_BASE_URL,
    STORE_ID,
    PLATFORM: Platform.OS,
  });
}