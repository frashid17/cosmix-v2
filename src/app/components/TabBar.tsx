// src/app/components/TabBar.tsx
import { View, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, usePathname } from "expo-router";

const darkBrown = "#423120";
const tabBackground = "#D7C3A7";

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: "Profile",
      route: "/profile", // Changed from "/(tabs)/profile"
      icon: "person",
    },
    {
      name: "Search",
      route: "/service", // Changed from "/(tabs)/service" 
      icon: "search-outline",
    },
    {
      name: "Home",
      route: "/", // Changed from "/(tabs)/index"
      icon: "home-outline",
    },
  ];

  const isActive = (route: string) => {
    return pathname === route;
  };

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: tabBackground,
        borderTopColor: "#E5E7EB",
        borderTopWidth: 1,
        height: 60,
        justifyContent: "space-around",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          onPress={() => router.push(tab.route as any)}
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 8,
            opacity: isActive(tab.route) ? 1 : 0.6,
          }}
        >
          <Ionicons
            name={tab.icon as any}
            size={30}
            color={darkBrown}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}