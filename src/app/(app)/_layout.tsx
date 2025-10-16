// src/app/(app)/_layout.tsx
import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router"
import { ActivityIndicator, View } from "react-native";
import TabBar from "../components/TabBar";

function Layout() {
    const { isLoaded, isSignedIn } = useAuth();
    console.log("isSignedIn >>>>", isSignedIn);

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color="#423120" />
            </View>
        )
    }
    
    return (
        <View style={{ flex: 1 }}>
            <Stack>
                {/* Public routes */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="services" options={{ headerShown: false }} />
                <Stack.Screen name="saloons" options={{ headerShown: false }} />
                <Stack.Screen name="categories" options={{ headerShown: false }} />
                <Stack.Screen name="checkout" options={{ headerShown: false }} />
                <Stack.Screen name="map" options={{ headerShown: false }} />

                {/* Auth-only routes */}
                <Stack.Protected guard={isSignedIn}>
                    <Stack.Screen name="bookings" options={{ headerShown: false }} />
                </Stack.Protected>

                {/* Auth screens */}
                <Stack.Screen name="sign-in" options={{ headerShown: false }}/>
                <Stack.Screen name="sign-up" options={{ headerShown: false }}/>
            </Stack>
            
            {/* Show TabBar for everyone */}
            <TabBar />
        </View>
    )
}

export default Layout;