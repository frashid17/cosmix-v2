// src/app/components/Header.tsx
import { View, TouchableOpacity, Dimensions, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title?: string;
  showMenu?: boolean;
  showBack?: boolean;
  onMenuPress?: () => void;
  onBackPress?: () => void;
}

const darkBrown = "#423120";
const white = "#FFFFFF";
const { width } = Dimensions.get('window');

// Fixed header height
const HEADER_HEIGHT = 48;

export default function Header({
  title = "COSMIX",
  showMenu = true,
  showBack = false,
  onMenuPress,
  onBackPress
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // On Android, add top padding for status bar since SafeAreaView doesn't always work
  const topPadding = Platform.OS === 'android' ? insets.top : 0;

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
        paddingTop: topPadding,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
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
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={24} color={darkBrown} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

        {/* Title (center) - absolutely positioned to stay centered */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Philosopher-Bold",
              fontWeight: "700",
              color: darkBrown,
              letterSpacing: 3,
            }}
          >
            {title}
          </Text>
        </View>

        {/* Menu Button (right side) */}
        {showMenu ? (
          <TouchableOpacity
            onPress={handleMenuPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="menu" size={28} color={darkBrown} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
    </View>
  );
}