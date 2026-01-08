// src/app/(app)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import TabBar from "../../components/TabBar";

function Layout() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="person"
              size={30}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="service"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="search-outline"
              size={30}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="home-outline"
              size={30}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          href: null, // Hide from tab bar buttons, but keep tab bar visible
          title: "Map"
        }}
      />
    </Tabs>
  );
}

export default Layout;