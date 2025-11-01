import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import Header from "./Header";
import useAuthStore from "@/store/auth.store";
import { signOut } from "@/lib/appwrite";

// New color scheme based on provided HEX codes
const darkBrown = "#423120"; // Main dark brown
const lightBrown = "#D7C3A7"; // Light brown/beige
const veryLightBeige = "#F4EDE5"; // Very light beige

interface SideMenuProps {
  onClose: () => void;
}

export default function SideMenu({ onClose }: SideMenuProps) {
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, setUser } = useAuthStore();

  // Load all Philosopher font variants
  const [fontsLoaded] = useFonts({ 
    'Philosopher-Regular': require("../assets/fonts/Philosopher-Regular.ttf"), 
    'Philosopher-Bold': require("../assets/fonts/Philosopher-Bold.ttf"), 
    'Philosopher-Italic': require("../assets/fonts/Philosopher-Italic.ttf"), 
    'Philosopher-BoldItalic': require("../assets/fonts/Philosopher-BoldItalic.ttf"), 
  });

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUser(null);
      onClose();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle sign in navigation
  const handleSignIn = () => {
    onClose();
    router.push('/sign-in');
  };

  // Handle categories navigation
  const handleCategories = () => {
    onClose();
    router.push('/categories');
  };

  // Side menu items
  const menuItems = [
    { label: "Kategoriat", onPress: handleCategories },
    { 
      label: isAuthenticated ? "Kirjaudu ulos" : "Kirjaudu sisään", 
      onPress: isAuthenticated ? handleSignOut : handleSignIn 
    },
    { label: "Yrittäjille", onPress: () => console.log("Navigate to Entrepreneurs") },
    { label: "Usein kysytyt kysymykset", onPress: () => console.log("Navigate to FAQ") },
    { label: "Meistä", onPress: () => console.log("Navigate to About") },
    { label: "Ota yhteyttä", onPress: () => console.log("Navigate to Contact") },
    { label: "Käyttöehdot", onPress: () => console.log("Navigate to Terms") },
    { label: "Tietosuojaseloste", onPress: () => console.log("Navigate to Privacy") },
  ];

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
      {/* Header component - clickable to close menu */}
      <TouchableOpacity onPress={onClose} activeOpacity={0.9}>
        <Header 
          title="COSMIX"
          showMenu={false}
          showBack={true}
          onBackPress={onClose}
        />
      </TouchableOpacity>
      
      <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 20 }}>
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
