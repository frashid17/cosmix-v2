import React from "react";
import { View, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, usePathname, Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const activeColor = "#423120"; // Dark Brown for active
const inactiveColor = "#8b7b63ff"; // Grey for inactive
const tabBackground = "#D7C3A7";

export default function GlobalTabBar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const tabs = [
        {
            name: "profile",
            icon: "person",
            route: "/(app)/(tabs)/profile" as Href,
            match: ["/profile", "/profile-edit", "/bookings", "/sign-in"]
        },
        {
            name: "service",
            icon: "search-outline",
            route: "/(app)/(tabs)/service" as Href,
            match: ["/service", "/categories", "/services", "/saloons", "/salon-sector", "/map"]
        },
        {
            name: "index",
            icon: "home-outline",
            route: "/(app)/(tabs)/index" as Href,
            match: ["/index", "/info", "/"]
        },
    ];

    // Helper to determine if a tab is "active" based on current path
    const isTabActive = (tab: typeof tabs[0]) => {
        // Only highlight if EXACT match (or root for index)
        // User wants sub-pages to act as "neither tab is active" so icons stay #8b7b63ff
        if (tab.name === 'index' && (pathname === '/' || pathname === '/(app)/(tabs)/index')) return true;
        if (pathname === tab.route) return true;

        return false;
    };

    return (
        <View
            style={{
                backgroundColor: tabBackground,
                borderTopWidth: 0,
                paddingBottom: insets.bottom,
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    height: 60,
                    justifyContent: "space-around",
                    alignItems: "center",
                }}
            >
                {tabs.map((tab) => {
                    const isActive = isTabActive(tab);

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            accessibilityRole="button"
                            accessibilityState={isActive ? { selected: true } : {}}
                            onPress={() => router.push(tab.route)}
                            activeOpacity={1}
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 8,
                            }}
                        >
                            <Ionicons
                                name={tab.icon as any}
                                size={30}
                                color={isActive ? activeColor : inactiveColor}
                                style={{ opacity: 1 }}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
