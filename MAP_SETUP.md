# Map Integration Setup Guide

This guide explains how to set up the map functionality for both the admin panel and React Native app.

## Admin Panel (cosmix-admin)

### 1. Environment Variables

Add your Mapbox token to `.env`:

```env
NEXT_PUBLIC_MAPBOX_KEY="pk.eyJ1IjoibHVuYXJsb2JzdGVyIiwiYSI6ImNtZ2p0c3dpYzBrOXUya3F3NXhibXNtdnYifQ.ec_SJSvAUvrYoVVMRB3Ilw"
```

### 2. Database Migration

The database schema has been updated to include location coordinates. You'll need to run a migration:

```bash
# If you have database permissions
npx prisma migrate dev --name add-location-coordinates

# Or manually add the columns to your database:
ALTER TABLE saloons ADD COLUMN latitude FLOAT;
ALTER TABLE saloons ADD COLUMN longitude FLOAT;
```

### 3. Features Added

- **Location Picker Component**: Interactive map for selecting salon locations
- **Database Schema**: Added `latitude` and `longitude` fields to saloons table
- **API Endpoints**: 
  - Updated saloon creation/editing to handle location data
  - New `/api/saloons/map` endpoint for fetching salons with location data
- **Form Integration**: Location picker added to both create and edit salon forms

### 4. Usage

When creating or editing a salon:
1. Use the search bar to find a location
2. Click on the map to select a precise location
3. The coordinates and address will be automatically saved

## React Native App (cosmix-v2)

### 1. Dependencies

Install required packages:

```bash
npm install react-native-maps expo-location @expo/vector-icons
```

### 2. Platform Setup

#### iOS Setup
Add to `ios/Podfile`:
```ruby
pod 'react-native-google-maps', :path => '../node_modules/react-native-maps'
```

#### Android Setup
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### 3. Google Maps API Key

#### iOS
Add to `ios/YourApp/AppDelegate.mm`:
```objc
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY"];
  // ... existing code
}
```

#### Android
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
</application>
```

### 4. Usage

```tsx
import { SalonMapView } from '../components/SalonMapView';

// In your screen component
<SalonMapView
  userLocation={{ latitude: 48.8566, longitude: 2.3522 }}
  onSalonSelect={(salon) => {
    // Handle salon selection
    console.log('Selected salon:', salon);
  }}
/>
```

## API Endpoints

### Get Salons with Location Data

```
GET /api/saloons/map?lat={latitude}&lng={longitude}&radius={radius}
```

**Parameters:**
- `lat` (optional): User's latitude
- `lng` (optional): User's longitude  
- `radius` (optional): Search radius in kilometers (default: 10)

**Response:**
```json
[
  {
    "id": "salon-id",
    "name": "Salon Name",
    "address": "123 Main St",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "averageRating": 4.5,
    "reviewCount": 10,
    "images": [...],
    "saloonServices": [...],
    "user": {...},
    "reviews": [...]
  }
]
```

## Features

### Admin Panel
- ✅ Interactive map for location selection
- ✅ Search functionality with Mapbox Geocoding
- ✅ Automatic address resolution
- ✅ Location data storage in database
- ✅ Edit existing salon locations

### React Native App
- ✅ Map view with salon markers
- ✅ User location display
- ✅ Salon information on marker tap
- ✅ Location-based salon filtering
- ✅ Custom salon markers
- ✅ Location permissions handling

## Customization

### Styling
Both components use your brand colors:
- Primary: `#423120` (Dark Brown)
- Secondary: `#D7C3A7` (Light Beige)
- Background: `#F4EDE5` (Off-white)
- Hover: `#E0D7CA`

### Map Styles
You can customize map styles by modifying the `mapStyle` prop in the Mapbox component or using different Google Maps styles in React Native.

## Troubleshooting

### Common Issues

1. **Map not loading**: Check API keys and permissions
2. **Location not found**: Ensure location services are enabled
3. **Database errors**: Verify migration was applied correctly
4. **CORS issues**: Make sure your React Native app can access the admin API

### Debug Tips

- Check browser console for Mapbox errors
- Verify API key permissions in Mapbox dashboard
- Test location permissions in device settings
- Check network requests in React Native debugger


