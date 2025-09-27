import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView
} from "react-native";
import { router } from "expo-router";
import { useFonts } from "expo-font";
import Header from "../../../components/Header";

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { user } = useUser();

  // Load all Philosopher font variants
  const [fontsLoaded] = useFonts({
    'Philosopher-Regular': require("../../../assets/fonts/Philosopher-Regular.ttf"),
    'Philosopher-Bold': require("../../../assets/fonts/Philosopher-Bold.ttf"),
    'Philosopher-Italic': require("../../../assets/fonts/Philosopher-Italic.ttf"),
    'Philosopher-BoldItalic': require("../../../assets/fonts/Philosopher-BoldItalic.ttf"),
  });

  // Don't render if fonts aren't loaded
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF", justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: "Philosopher-Regular", color: "#423120" }}>Loading fonts...</Text>
      </SafeAreaView>
    );
  }

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleMenuPress = (menuItem: string) => {
    switch (menuItem) {
      case "Tulevat hoidot":
        router.push("/bookings");
        break;
      case "Menneet hoidot":
        Alert.alert("Menneet hoidot", "Past treatments feature coming soon!");
        break;
      case "Asetukset":
        Alert.alert("Asetukset", "Settings feature coming soon!");
        break;
      case "Kieli":
        Alert.alert("Kieli", "Language settings feature coming soon!");
        break;
      case "Kirjaudu ulos":
        handleSignOut();
        break;
    }
  };

  const menuItems = [
    "Tulevat hoidot",
    "Menneet hoidot",
    "Asetukset",
    "Kieli",
    "Kirjaudu ulos",
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header 
        title="COSMIX"
        showBack={true}
        showMenu={true}
        onBackPress={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* WELCOME SECTION */}
        <View style={styles.headerContainer}>
          <View style={styles.archContainer}>
            <Text style={styles.welcomeText}>
              Tervetuloa,{"\n"}
              {user?.firstName || "Sarah"}!
            </Text>
          </View>
        </View>

        {/* MENU */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => handleMenuPress(item)}
              style={styles.menuButton}
              activeOpacity={0.7}
            >
              <Text style={styles.menuButtonText}>{item}</Text>
              <Ionicons name="arrow-forward" size={20} width={35} color="#423120" />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // white base background
  },

  // WELCOME SECTION
  headerContainer: {
    backgroundColor: "#D7C3A7", // tan top section
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  archContainer: {
    backgroundColor: "#F4EDE5",
    width: 240,
    height: 240,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  welcomeText: {
    fontSize: 25,
    fontFamily: "Philosopher-Bold",
    color: "#423120",
    textAlign: "center",
    lineHeight: 30,
  },

  // MENU
  menuContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 40,
    width: "100%",
  },
  menuButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    minHeight: 84,               // ✅ ensures each button is at least 84 tall
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D7C3A7",
  },
  menuButtonText: {
    fontSize: 20,
    fontFamily: "Philosopher-Bold",
    color: "#423120",
  },
});
