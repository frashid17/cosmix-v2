// config/constants.ts
import { Platform } from 'react-native';

// Equivalent to process.env.NEXT_PUBLIC_API_URL but for React Native
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'android') {
      return 'http://10.0.46.243/api/0bfe2d44-ee33-4886-b870-5c2afa61bbe6'; // Android emulator
    } else if (Platform.OS === 'ios') {
      return 'http://10.0.46.243:3000/api/0bfe2d44-ee33-4886-b870-5c2afa61bbe6'; // iOS simulator
    } else {
      return 'http://10.0.46.243:3000/api/0bfe2d44-ee33-4886-b870-5c2afa61bbe6'; // Physical device - your computer's IP
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