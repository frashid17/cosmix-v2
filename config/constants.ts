// config/constants.ts
import { Platform } from 'react-native';

// Equivalent to process.env.NEXT_PUBLIC_API_URL but for React Native
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'android') {
      return 'http://192.168.1.148:3000/api/62e3071c-2ad8-4574-86d4-8bcc1a9bc052'; // Android emulator
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:3000/api'; // iOS simulator
    } else {
      return 'http://192.168.1.148:3000/api/62e3071c-2ad8-4574-86d4-8bcc1a9bc052'; // Physical device - your computer's IP
    }
  }
  
  // Production environment - replace with your actual production URL
  return 'https://your-production-domain.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  CATEGORIES: `${API_BASE_URL}/categories`,
} as const;