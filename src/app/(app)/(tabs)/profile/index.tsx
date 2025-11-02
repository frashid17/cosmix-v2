import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { router } from "expo-router";
import Header from "../../../components/Header";
import SideMenu from "../../../components/SideMenu";
import useAuthStore from "@/store/auth.store";
import { signOut } from "@/lib/appwrite";

export default function ProfilePage() {
  const { user, isAuthenticated, setUser, setIsAuthenticated } = useAuthStore();
  const [isMenuVisible, setMenuVisible] = React.useState(false);

  const handleMenuPress = async (menuItem: string) => {
    switch (menuItem) {
      case "Tulevat hoidot":
        if (isAuthenticated) {
          router.push("/bookings");
        } else {
          router.push("/sign-in");
        }
        break;
      case "Menneet hoidot":
        Alert.alert("Menneet hoidot", "Past treatments feature coming soon!");
        break;
      case "Asetukset":
        if (isAuthenticated) {
          router.push("/profile-edit");
        } else {
          Alert.alert("Kirjaudu sisään", "Sinun täytyy kirjautua sisään päästäksesi asetuksiin", [
            { text: "Peruuta", style: "cancel" },
            { text: "Kirjaudu", onPress: () => router.push("/sign-in") }
          ]);
        }
        break;
      case "Kieli":
        router.push("/language");
        break;
      case "Kirjaudu sisään":
        router.push("/sign-in");
        break;
      case "Kirjaudu ulos":
        try {
          await signOut();
          setUser(null);
          setIsAuthenticated(false);
          Alert.alert("Success", "You have been signed out");
          router.replace("/");
        } catch (error) {
          Alert.alert("Error", "Failed to sign out");
        }
        break;
    }
  };

  const menuItems = isAuthenticated
    ? [
        "Tulevat hoidot",
        "Menneet hoidot",
        "Asetukset",
        "Kieli",
        "Kirjaudu ulos",
      ]
    : [
        "Tulevat hoidot",
        "Menneet hoidot",
        "Asetukset",
        "Kieli",
        "Kirjaudu sisään",
      ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header 
        title="COSMIX"
        showBack={true}
        showMenu={true}
        onBackPress={() => router.back()}
        onMenuPress={() => setMenuVisible(true)}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* WELCOME SECTION */}
        <View style={styles.headerContainer}>
          <View style={styles.archContainer}>
            <Text style={styles.welcomeText}>
              Tervetuloa,{"\n"}
              {isAuthenticated && user ? user.name.split(' ')[0] : 'Käyttäjä'}!
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

      {/* Modal for the side menu */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#F4EDE5',
              alignSelf: 'flex-end',
            }}
          >
            <SideMenu onClose={() => setMenuVisible(false)} />
          </View>
        </View>
      </Modal>
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
    fontFamily: "Philosopher-Bold",
    color: "#423120",
  },
});