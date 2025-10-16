import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Animated, Easing, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import { useFonts } from "expo-font";
import getCategories from "../../actions/get-categories";
import { Category } from "../../types";

export default function ServicesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isMenuVisible, setMenuVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    'Philosopher-Regular': require("../../assets/fonts/Philosopher-Regular.ttf"),
    'Philosopher-Bold': require("../../assets/fonts/Philosopher-Bold.ttf"),
    'Philosopher-Italic': require("../../assets/fonts/Philosopher-Italic.ttf"),
    'Philosopher-BoldItalic': require("../../assets/fonts/Philosopher-BoldItalic.ttf"),
  });

  const darkBrown = "#423120";
  const lightBeige = "#F4EDE5";
  const chipBeige = "#D7C3A7";

  // Popular categories (home-provided API)
  const [popular, setPopular] = useState<string[]>([]);

  // All categories for search
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState<boolean>(false);
  const [catError, setCatError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || "https://cosmix-admin.vercel.app";
        const res = await fetch(`${API_BASE}/api/public/categories?popular=true&global=true`);
        const data = await res.json();
        const names: string[] = Array.isArray(data) ? data.map((c: any) => c.name).filter(Boolean) : [];
        setPopular(names);
      } catch (e) {
        console.warn("Failed to load popular categories", e);
      }
    };
    fetchPopular();
  }, []);

  // Fetch all categories for search
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCatLoading(true);
        setCatError(null);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setCatError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setCatLoading(false);
      }
    };
    loadCategories();
  }, []);

  const onChipPress = (name: string) => {
    router.push({ pathname: "/services", params: { categoryName: name } });
  };

  const filteredCategoryNames = query.trim().length === 0
    ? []
    : categories
        .map((c) => c.name)
        .filter(Boolean)
        .filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()));

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: lightBeige }}>
      {/* Fixed header to match Home */}
      <Header showBack={true} onMenuPress={() => setMenuVisible(true)} onBackPress={() => router.back()} />

      {/* Side menu modal */}
      <Modal visible={isMenuVisible} animationType="slide" transparent={false} onRequestClose={() => setMenuVisible(false)}>
        <SideMenu onClose={() => setMenuVisible(false)} />
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6">
          {/* Search bar - same style as in Map */}
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: 25,
                borderWidth: 1,
                borderColor: darkBrown,
                width: 320,
                height: 80,
                paddingHorizontal: 16,
                paddingVertical: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Ionicons name="search" size={20} color={darkBrown} style={{ marginRight: 12 }} />
              <TextInput
                style={{ flex: 1, fontSize: 23, fontFamily: 'Philosopher-Bold', color: darkBrown }}
                value={query}
                onChangeText={setQuery}
                placeholder="Etsi hoitoja..."
                placeholderTextColor="#999"
                returnKeyType="search"
              />
            </View>
          </View>

          {/* When searching: show matching categories only */}
          {query.trim().length > 0 ? (
            <View style={{ marginTop: 20 }}>
              {catLoading ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                  <ActivityIndicator size="large" color={darkBrown} />
                  <Text style={{ color: darkBrown, fontFamily: 'Philosopher-Regular', marginTop: 10 }}>
                    Ladataan kategorioita...
                  </Text>
                </View>
              ) : filteredCategoryNames.length > 0 ? (
                <View>
                  {/* Render results in the same 2-per-row layout */}
                  {chunkArray(filteredCategoryNames, 2).map((row, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 8 }}>
                      {row.map((name) => (
                        <Chip key={name} label={name} onPress={() => onChipPress(name)} color={chipBeige} textColor={darkBrown} />
                      ))}
                      {row.length === 1 && (
                        <View style={{ width: 147 }} />
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginTop: 10 }}>
                  <Text style={{ fontFamily: 'Philosopher-Bold', color: darkBrown, fontSize: 16 }}>
                    Not found
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <>
              {/* Section title */}
              <Text style={{ color: darkBrown, fontFamily: 'Philosopher-Bold', fontSize: 20 }} className="mt-8">
                Suosituimmat palvelut
              </Text>

              {/* Chips grid for popular */}
              <View className="mt-5">
                <View className="flex-row justify-between mb-5 px-2">
                  {popular.slice(0, 2).map((name) => (
                    <Chip key={name} label={name} onPress={() => onChipPress(name)} color={chipBeige} textColor={darkBrown} />
                  ))}
                </View>
                {popular.length > 2 && (
                  <View className="flex-row justify-center mb-5">
                    <Chip label={popular[2]} onPress={() => onChipPress(popular[2])} color={chipBeige} textColor={darkBrown} />
                  </View>
                )}
                <View className="flex-row justify-between mb-5 px-2">
                  {popular.slice(3, 5).map((name) => (
                    <Chip key={name} label={name} onPress={() => onChipPress(name)} color={chipBeige} textColor={darkBrown} />
                  ))}
                </View>
                {popular.length > 5 && (
                  <View className="flex-row justify-center">
                    <Chip label={popular[5]} onPress={() => onChipPress(popular[5])} color={chipBeige} textColor={darkBrown} />
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function Chip({ label, onPress, color, textColor }: { label: string; onPress: () => void; color: string; textColor: string }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const H_PADDING = 16; // internal horizontal padding so text doesn't touch edges
  const effectiveWidth = Math.max(0, containerWidth - H_PADDING * 2);
  const shouldScroll = textWidth > effectiveWidth && effectiveWidth > 0;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (shouldScroll) {
      // Start centered if possible, then animate to left and back
      translateX.setValue(0);
      const distance = textWidth - effectiveWidth;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: -distance,
            duration: Math.min(14000, 5000 + distance * 30),
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [shouldScroll, textWidth, effectiveWidth, translateX]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: color, width: 147, height: 45 }}
      className="rounded-full items-center justify-center"
    >
      <View
        style={{ width: "100%", overflow: "hidden", alignItems: "center", paddingHorizontal: H_PADDING }}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={{ transform: [{ translateX: shouldScroll ? translateX : 0 }], alignItems: "center" }}>
          <Text
            onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
            numberOfLines={1}
            style={{ color: textColor, fontFamily: 'Philosopher-Bold', fontSize: 15, textAlign: 'center' }}
          >
            {label}
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}