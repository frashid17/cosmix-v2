// config/constants.ts
import { Platform } from 'react-native';

// Single source of truth for backend base URL
// Prefer environment override, otherwise default to deployed domain
const PRODUCTION_DOMAIN = process.env.EXPO_PUBLIC_PRODUCTION_DOMAIN || 'cosmix-admin.vercel.app';

// Base URL used across the app
export const API_BASE_URL = `https://${PRODUCTION_DOMAIN}/api`;

// API Endpoints
export const API_ENDPOINTS = {
  CATEGORIES: `${API_BASE_URL}/public/categories`,
  SERVICES: `${API_BASE_URL}/public/services`,
  BOOKINGS: `${API_BASE_URL}/bookings`,
  PRODUCTS: `${API_BASE_URL}/products`,
  CHECKOUT: `${API_BASE_URL}/checkout`,
  SALONS: `${API_BASE_URL}/public/saloons`,
} as const;

// Export other useful constants
export const CONFIG = {
  PRODUCTION_DOMAIN,
  PLATFORM: Platform.OS,
} as const;

// Debug logging in development
if (__DEV__) {
  console.log('API Configuration:', {
    API_BASE_URL,
    PLATFORM: Platform.OS,
  });
}