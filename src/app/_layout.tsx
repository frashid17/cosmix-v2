import "../global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import useAuthStore from "@/store/auth.store";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();

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

  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode="light">
        <Slot />
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
