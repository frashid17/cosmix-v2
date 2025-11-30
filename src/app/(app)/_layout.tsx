// src/app/(app)/_layout.tsx
import { Stack } from "expo-router"
import { View } from "react-native";
import TabBar from "../components/TabBar";

function Layout() {
    return (
        <View style={{ flex: 1 }}>
            <Stack>
                {/* Public routes */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="admin-webview" options={{ headerShown: false }} />
                <Stack.Screen name="services" options={{ headerShown: false }} />
                <Stack.Screen name="saloons" options={{ headerShown: false }} />
                <Stack.Screen name="salon-sector" options={{ headerShown: false }} />
                <Stack.Screen name="categories" options={{ headerShown: false }} />
                <Stack.Screen name="checkout" options={{ headerShown: false }} />
                <Stack.Screen name="map" options={{ headerShown: false }} />
                <Stack.Screen name="bookings" options={{ headerShown: false }} />
                <Stack.Screen name="sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="sign-up" options={{ headerShown: false }} />
                <Stack.Screen name="profile-edit" options={{ headerShown: false }} />
                <Stack.Screen name="language" options={{ headerShown: false }} />
            </Stack>

            {/* Show TabBar for everyone */}
            <TabBar />
        </View>
    )
}

export default Layout;
