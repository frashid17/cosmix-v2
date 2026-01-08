// src/app/(app)/_layout.tsx
import { Stack, useSegments } from "expo-router"
import { View } from "react-native";
import GlobalTabBar from "../components/GlobalTabBar";

function Layout() {
    const segments = useSegments();

    // Check if we are in the (tabs) group
    // segments is usually ["(app)", "(tabs)", "index"] etc.
    // If "(tabs)" is present in segments, we hide the GlobalTabBar because Tabs layout handles it.
    // Also hide on admin-webview if needed (full screen)
    const hideGlobalTabs =
        segments.includes("(tabs)") ||
        segments.includes("admin-webview") ||
        segments.includes("sign-in"); // User mentioned sign-in missing tab bar, so I should SHOW it there? 
    // User said: "/home/lunar/update/cosmix-v2/src/app/(app)/sign-in.tsx ... are missing the Tab bar"
    // So I should NOT hide it on sign-in.

    // Re-evaluating hide logic:
    // We ONLY want to hide it if we are inside (tabs) layout, because that layout has its own bar.
    // And maybe specific full-screen modals like admin-webview.
    const shouldShowGlobalTabs = !segments.includes("(tabs)") && !segments.includes("admin-webview");

    return (
        <View style={{ flex: 1 }}>
            <Stack>
                {/* Public routes */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="admin-webview" options={{ headerShown: false }} />
                <Stack.Screen name="info" options={{ headerShown: false }} />
                <Stack.Screen name="services" options={{ headerShown: false }} />
                <Stack.Screen name="saloons" options={{ headerShown: false }} />
                <Stack.Screen name="salon-sector" options={{ headerShown: false }} />
                <Stack.Screen name="categories" options={{ headerShown: false }} />
                <Stack.Screen name="checkout" options={{ headerShown: false }} />
                <Stack.Screen name="SideMenu" options={{ headerShown: false }} />
                <Stack.Screen name="map" options={{ headerShown: false }} />
                <Stack.Screen name="bookings" options={{ headerShown: false }} />
                <Stack.Screen name="sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="profile-edit" options={{ headerShown: false }} />
                <Stack.Screen name="language" options={{ headerShown: false }} />
            </Stack>

            {shouldShowGlobalTabs && <GlobalTabBar />}
        </View>
    )
}

export default Layout;
