// config/constants.ts
import { Platform } from 'react-native';

// Single source of truth for backend base URL
// Prefer environment override, otherwise default to deployed domain
const RAW_DOMAIN = process.env.EXPO_PUBLIC_PRODUCTION_DOMAIN || 'cosmix-admin-eight.vercel.app';

// Check if the domain uses http (local dev) or https (production)
const isHttpDomain = RAW_DOMAIN.startsWith('http://');

// Clean up the domain - remove protocol if present, we'll add it ourselves
const PRODUCTION_DOMAIN = RAW_DOMAIN
  .replace(/^https?:\/\//, '')  // Remove http:// or https://
  .replace(/\/+$/, '');          // Remove trailing slashes

// Determine if we're in local development
const isLocalDev = __DEV__ && !process.env.EXPO_PUBLIC_PRODUCTION_DOMAIN;

// Base URL used across the app
// Use http for localhost, https for production domains
const protocol = isLocalDev || isHttpDomain ? 'http' : 'https';
export const API_BASE_URL = `${protocol}://${PRODUCTION_DOMAIN}/api`;

// API Endpoints
export const API_ENDPOINTS = {
  CATEGORIES: `${API_BASE_URL}/public/categories`,
  SERVICES: `${API_BASE_URL}/public/services`,
  BOOKINGS: `${API_BASE_URL}/bookings`,
  PRODUCTS: `${API_BASE_URL}/products`,
  CHECKOUT: `${API_BASE_URL}/checkout`,
  SALONS: `${API_BASE_URL}/public/saloons`,
  REVIEWS: `${API_BASE_URL}/reviews`,
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