// src/app/components/Header.tsx
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
        // OPTION 1: Remove border completely
        // borderBottomWidth: 0,
        
        // OPTION 2: Make border very subtle/blended
        borderBottomWidth: 0.5,
        borderBottomColor: '#f8f8f8', // Very light, almost white
        
        // OPTION 3: Use gradient-like shadow instead of hard border
        // borderBottomWidth: 0,
        // elevation: 1,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
        
        // Current shadow (you can keep or remove)
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
        paddingTop: 30,
      }}
    >
      {/* Back Button (left side) */}
      {showBack && (
        <TouchableOpacity
          onPress={handleBackPress}
          style={{ position: "absolute", left: 16, zIndex: 10, marginTop: 25 }}
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
          style={{ position: "absolute", right: 16, zIndex: 10, marginTop: 25 }}
        >
          <Ionicons name="menu" size={28} color={darkBrown} />
        </TouchableOpacity>
      )}
    </View>
  );
}