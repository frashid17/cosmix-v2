// src/app/(app)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "react-native";
import { useUser } from "@clerk/clerk-expo";

function Layout() {
  const { user } = useUser();
  const tabBackground = "#D7C3A7";
  const darkBrown = "#423120";
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: darkBrown,
        tabBarInactiveTintColor: tabBackground,
        tabBarStyle: {
          backgroundColor: tabBackground,
          borderTopColor: "#E5E7EB", // gray-200 equivalent
          borderTopWidth: 1,
          paddingVertical: 12,
          height: 60,
        },
        tabBarShowLabel: false, // Hide labels for cleaner look
      }}
    >
      <Tabs.Screen 
        name="profile" 
        options={{ 
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ focused }) => (
             (
              <Ionicons 
                name="person" 
                size={30} 
                color={darkBrown} 
              />
            )
          ),
        }} 
      />
      
      <Tabs.Screen 
        name="service" 
        options={{ 
          headerShown: false,
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name="search-outline" 
              size={30} 
              color={darkBrown} 
            />
          ),
        }} 
      />
      
      <Tabs.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name="home-outline" 
              size={30} 
              color={darkBrown} 
            />
          ),
        }} 
      />
    </Tabs>
  );
}

export default Layout;