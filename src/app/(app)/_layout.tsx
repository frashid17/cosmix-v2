// src/app/(app)/_layout.tsx
import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router"
import { ActivityIndicator, View } from "react-native";

function Layout() {
    const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();
    console.log("isSignedIn >>>>", isSignedIn);

    if (!isLoaded) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#423120" />
            </View>
        )
    }
  return (
    <Stack>
        <Stack.Protected guard={isSignedIn}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
           
            <Stack.Screen name="categories" options={{ headerShown: false }} />
            {/* Add other authenticated screens here */}
        </Stack.Protected>

        <Stack.Protected guard={!isSignedIn}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }}/>
            <Stack.Screen name="sign-up" options={{ headerShown: false }}/>
        </Stack.Protected>    
    </Stack>
  )
}

export default Layout