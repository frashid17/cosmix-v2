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

export default function ProfilePage() {
  const handleMenuPress = (menuItem: string) => {
    switch (menuItem) {
      case "Tulevat hoidot":
        router.push("/sign-in");
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
      case "Kirjaudu sisään":
        router.push("/sign-in");
        break;
    }
  };

  const menuItems = [
    "Tulevat hoidot",
    "Menneet hoidot", 
    "Asetukset",
    "Kieli",
    "Kirjaudu sisään",
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={{
        backgroundColor: "#D7C3A7",
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'center'
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: "#423120" 
        }}>
          COSMIX
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* WELCOME SECTION */}
        <View style={styles.headerContainer}>
          <View style={styles.archContainer}>
            <Text style={styles.welcomeText}>
              Tervetuloa,{"\n"}
              Käyttäjä!
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
              <Ionicons name="arrow-forward" size={20} color="#423120" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // WELCOME SECTION
  headerContainer: {
    backgroundColor: "#D7C3A7",
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
    fontWeight: "bold",
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
    minHeight: 84,
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
    fontWeight: "bold",
    color: "#423120",
  },
});