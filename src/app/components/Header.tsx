// src/app/components/Header.tsx
import { View, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface HeaderProps {
  showMenu?: boolean;
  showBack?: boolean;
  onMenuPress?: () => void;
  onBackPress?: () => void;
}

const darkBrown = "#423120";
const white = "#FFFFFF";
const { width } = Dimensions.get('window');

// Fixed header height - no dynamic safe area padding here
// Parent screens should use SafeAreaView to handle status bar insets
const HEADER_HEIGHT = 60;

export default function Header({
  showMenu = true,
  showBack = false,
  onMenuPress,
  onBackPress
}: HeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      // Check if we can go back before calling router.back()
      if (router.canGoBack()) {
        router.back();
      } else {
        // If we can't go back, navigate to home
        router.push('/');
      }
    }
  };

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    }
  };

  return (
    <View
      style={{
        backgroundColor: white,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f8f8f8',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        width: width,
        alignSelf: 'stretch',
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 0,
        height: HEADER_HEIGHT,
      }}
    >
      {/* Back Button (left side) */}
      {showBack ? (
        <TouchableOpacity
          onPress={handleBackPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={28} color={darkBrown} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 44 }} />
      )}

      {/* Menu Button (right side) */}
      {showMenu ? (
        <TouchableOpacity
          onPress={handleMenuPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons name="menu" size={37} color={darkBrown} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 44 }} />
      )}
    </View>
  );
}