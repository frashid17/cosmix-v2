// src/app/components/Header.tsx
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
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

export default function Header({ 
  title = "COSMIX", 
  showMenu = true, 
  showBack = false,
  onMenuPress,
  onBackPress 
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
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
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 2,
        paddingTop: Math.max(30, insets.top + 10), // Use safe area top inset
      }}
    >
      {/* Back Button (left side) */}
      {showBack && (
        <TouchableOpacity
          onPress={handleBackPress}
          style={{ 
            position: "absolute", 
            left: 16, 
            zIndex: 10, 
            top: Math.max(25, insets.top + 5) // Position relative to safe area
          }}
        >
          <Ionicons name="arrow-back" size={28} color={darkBrown} />
        </TouchableOpacity>
      )}

      {/* Title (center) */}
      <Text
        style={{
          fontSize: 24,
          fontFamily: "Philosopher-Bold",
          letterSpacing: 3,
          color: darkBrown,
          textAlign: 'center',
          flex: 1,
          marginHorizontal: 40,
          paddingTop: Math.max(0, insets.top - 20), // Adjust title position based on safe area
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>

      {/* Menu Button (right side) */}
      {showMenu && (
        <TouchableOpacity
          onPress={handleMenuPress}
          style={{ 
            position: "absolute", 
            right: 16, 
            zIndex: 10, 
            top: Math.max(25, insets.top + 5), // Position relative to safe area
            width: 40,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons name="menu" size={37} color={darkBrown} />
        </TouchableOpacity>
      )}
    </View>
  );
}