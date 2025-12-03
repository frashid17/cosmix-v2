import "../global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

// Custom token cache implementation
const tokenCache = {
  async getToken(key: string) {
    try {
      const value = await SecureStore.getItemAsync(key);
      console.log('TokenCache getToken:', key, value ? 'found' : 'not found');
      return value;
    } catch (error) {
      console.error('TokenCache getToken error:', error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      console.log('TokenCache saveToken:', key);
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('TokenCache saveToken error:', error);
    }
  },
  async clearToken(key: string) {
    try {
      console.log('TokenCache clearToken:', key);
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('TokenCache clearToken error:', error);
    }
  },
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file."
  );
}

// Inner component that handles Clerk loading with timeout
function ClerkLoadedWithTimeout({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // If Clerk doesn't load within 10 seconds, proceed anyway (but OAuth won't work)
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        console.warn('Clerk initialization timed out after 10 seconds');
        setTimedOut(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isLoaded]);

  // Log Clerk loading status
  useEffect(() => {
    console.log('Clerk isLoaded:', isLoaded);
  }, [isLoaded]);

  // Render children if Clerk loaded OR if we timed out
  if (isLoaded || timedOut) {
    return <>{children}</>;
  }

  // Return null while waiting (splash screen is still visible)
  return null;
}

export default function Layout() {
  // Load all Philosopher fonts at the root level
  const [fontsLoaded, fontError] = useFonts({
    'Philosopher-Regular': require("./assets/fonts/Philosopher-Regular.ttf"),
    'Philosopher-Bold': require("./assets/fonts/Philosopher-Bold.ttf"),
    'Philosopher-Italic': require("./assets/fonts/Philosopher-Italic.ttf"),
    'Philosopher-BoldItalic': require("./assets/fonts/Philosopher-BoldItalic.ttf"),
  });

  useEffect(() => {
    if (fontError) throw fontError;
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoadedWithTimeout>
        <SafeAreaProvider>
          <GluestackUIProvider mode="light">
            <Slot />
          </GluestackUIProvider>
        </SafeAreaProvider>
      </ClerkLoadedWithTimeout>
    </ClerkProvider>
  );
}
