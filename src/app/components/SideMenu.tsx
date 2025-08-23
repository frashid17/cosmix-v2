import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";

// New color scheme based on provided HEX codes
const darkBrown = "#423120"; // Main dark brown
const lightBrown = "#D7C3A7"; // Light brown/beige
const veryLightBeige = "#F4EDE5"; // Very light beige

// Side menu items
const menuItems = [
  { label: "Kategoriat", onPress: () => console.log("Navigate to Categories") },
  { label: "Kirjaudu sisään", onPress: () => console.log("Navigate to Login") },
  { label: "Yrittäjille", onPress: () => console.log("Navigate to Entrepreneurs") },
  { label: "Usein kysytyt kysymykset", onPress: () => console.log("Navigate to FAQ") },
  { label: "Meistä", onPress: () => console.log("Navigate to About") },
  { label: "Ota yhteyttä", onPress: () => console.log("Navigate to Contact") },
  { label: "Käyttöehdot", onPress: () => console.log("Navigate to Terms") },
  { label: "Tietosuojaseloste", onPress: () => console.log("Navigate to Privacy") },
];

export default function SideMenu({ onClose }) {
  // Load all Philosopher font variants
  const [fontsLoaded] = useFonts({ 
    'Philosopher-Regular': require("../assets/fonts/Philosopher-Regular.ttf"), 
    'Philosopher-Bold': require("../assets/fonts/Philosopher-Bold.ttf"), 
    'Philosopher-Italic': require("../assets/fonts/Philosopher-Italic.ttf"), 
    'Philosopher-BoldItalic': require("../assets/fonts/Philosopher-BoldItalic.ttf"), 
  });

  // Don't render if fonts aren't loaded
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: veryLightBeige, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: veryLightBeige }}>
      {/* HEADER with back arrow */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
      >
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={28} color={darkBrown} />
        </TouchableOpacity>
      </View>
      
      <View style={{ flex: 1,  paddingHorizontal: 32 }}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            style={{ marginBottom: 24 }}
          >
            <Text
              style={{
                fontSize: 25,
                fontFamily: "Philosopher-Bold",
                textAlign: "right",
                color: darkBrown,
                lineHeight: 40,
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}