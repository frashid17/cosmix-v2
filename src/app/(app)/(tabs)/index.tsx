// Page.js
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import SideMenu from '../../components/SideMenu';
import getCategories from '../../actions/get-categories';
import { Category } from '../../types';
import Header from "../../components/Header";

export default function Page() {
  const router = useRouter();
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all Philosopher font variants
  const [fontsLoaded] = useFonts({
    'Philosopher-Regular': require("../../assets/fonts/Philosopher-Regular.ttf"),
    'Philosopher-Bold': require("../../assets/fonts/Philosopher-Bold.ttf"),
    'Philosopher-Italic': require("../../assets/fonts/Philosopher-Italic.ttf"),
    'Philosopher-BoldItalic': require("../../assets/fonts/Philosopher-BoldItalic.ttf"),
  });

  // New color scheme based on provided HEX codes
  const darkBrown = "#423120";
  const lightBrown = "#D7C3A7";
  const veryLightBeige = "#F4EDE5";
  const white = "#FFFFFF";

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCategories();
        setCategories(data);
        console.log('Fetched categories:', data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Don't render if fonts aren't loaded
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading fonts...</Text>
      </SafeAreaView>
    );
  }

  const items = [
    {
      label: "Gua Sha hoidot",
      img: "https://res.cloudinary.com/dguk4ks45/image/upload/v1755533723/pexels-cottonbro-3737599_1_qnzthw.png",
    },
    {
      label: "Ripsienpidennykset",
      img: "https://res.cloudinary.com/dguk4ks45/image/upload/v1755533722/AdobeStock_323915985_kzt3ji.png",
    },
    {
      label: "Hieronnat",
      img: "https://res.cloudinary.com/dguk4ks45/image/upload/v1755533708/AdobeStock_169329470_hte0yt.png",
    },
    {
      label: "Kynsihoidot",
      img: "https://res.cloudinary.com/dguk4ks45/image/upload/v1755533708/AdobeStock_248196993_1_azoalh.png",
    },
  ];

  // Function to chunk array into rows of 2 items
  const chunkArray = (array: any[], chunkSize: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  // Prepare categories for display (first 11 categories + "Lisää")
  const displayCategories = [
    ...categories.slice(0, 11).map(cat => cat.name),
    "Lisää"
  ];

  // Chunk into rows of 2
  const categoryRows = chunkArray(displayCategories, 2);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      {/* FIXED HEADER - Outside ScrollView */}
    <Header onMenuPress={() => setMenuVisible(true)} />

      {/* SCROLLABLE CONTENT */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Hero Section */}
        <View style={{ backgroundColor: lightBrown }} className="px-4 py-6">
          <View
            style={{
              borderRadius: 20,
              overflow: "hidden",
              alignItems: "center",
              height: 300,
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Image
              source={{
                uri: "https://res.cloudinary.com/dguk4ks45/image/upload/v1755533724/AdobeStock_130939808_cq1whi.png",
              }}
              style={{
                width: 327,
                height: 213,
                borderRadius: 20,
              }}
              resizeMode="cover"
            />

            <View
              style={{
                position: "absolute",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 40,
                  fontFamily: "Philosopher-Bold",
                  color: darkBrown,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                Palvelut kotiin!
              </Text>
            </View>
          </View>
        </View>

        {/* POPULAR SERVICES */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
          <Text
            style={{
              color: darkBrown,
              fontFamily: "Philosopher-Bold",
              fontSize: 25,
              textAlign: "center",
            }}
          >
            Kauden suosituimmat palvelut.
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            {items.map((item, idx) => (
              <View
                key={idx}
                style={{ marginBottom: 24, width: "48%", alignItems: "center" }}
              >
                <View style={{ position: "absolute", top: 45 }}>
                  <Svg width={160} height={120} viewBox="0 0 200 150">
                    <Path
                      d="M50,20 C90,-10 170,20 150,80 C140,110 70,130 30,90 C-10,50 10,50 50,20 Z"
                      fill={veryLightBeige}
                    />
                  </Svg>
                </View>

                <Image
                  source={{ uri: item.img }}
                  style={{
                    width: 127,
                    height: 128,
                    borderRadius: 24,
                  }}
                />

                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 10,
                    color: darkBrown,
                    fontFamily: "Philosopher-Bold",
                    fontSize: 15,
                    maxWidth: 120,
                  }}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* TAGLINE */}
        <View style={{ backgroundColor: lightBrown }} className="py-3">
          <Text
            style={{
              textAlign: "center",
              color: darkBrown,
              fontFamily: "Philosopher-Bold",
              fontSize: 20,
            }}
          >
            Hemmottelu, jonka ansaitset.
          </Text>
        </View>

        {/* CATEGORIES */}
        <View className="px-4 py-6">
          <Text
            style={{
              textAlign: "center",
              color: darkBrown,
              fontFamily: "Philosopher-Bold",
              fontSize: 25,
              marginBottom: 20,
            }}
          >
            Kategoriat
          </Text>

          {/* Loading State */}
          {loading && (
            <View style={{ alignItems: "center", justifyContent: "center", padding: 20 }}>
              <ActivityIndicator size="large" color={darkBrown} />
              <Text style={{ color: darkBrown, fontFamily: "Philosopher-Regular", marginTop: 10 }}>
                Ladataan kategorioita...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={{ alignItems: "center", justifyContent: "center", padding: 20 }}>
              <Text style={{ color: "red", fontFamily: "Philosopher-Regular", textAlign: "center" }}>
                Virhe: {error}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: lightBrown,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 10,
                }}
                onPress={() => {
                  // Retry fetching
                  setError(null);
                  setLoading(true);
                  getCategories()
                    .then(setCategories)
                    .catch((err) => setError(err.message))
                    .finally(() => setLoading(false));
                }}
              >
                <Text style={{ fontFamily: "Philosopher-Bold", color: darkBrown }}>
                  Yritä uudelleen
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Categories Grid */}
          {!loading && !error && (
            <View className="mt-4">
              {categoryRows.map((row, rowIdx) => (
                <View key={rowIdx} style={{ flexDirection: "row", justifyContent: "center", gap: 51, marginBottom: 20 }}>
                  {row.map((categoryName, colIdx) => (
                    <TouchableOpacity
                      key={colIdx}
                      style={{
                        backgroundColor: lightBrown,
                        width: 127,
                        height: 47,
                        borderRadius: 30,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        if (categoryName === "Lisää") {
                          router.push("/categories");
                        } else {
                          // Navigate to services page with category name
                          router.push({
                            pathname: "/services",
                            params: { categoryName }
                          });
                        }
                      }}
                    >
                      <Text
                        style={{
                          color: darkBrown,
                          textAlign: "center",
                          fontFamily: "Philosopher-Bold",
                          fontSize: 15,
                          paddingHorizontal: 8,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {categoryName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* LOGIN & ENTREPRENEURS */}
        <View style={{ backgroundColor: lightBrown }} className="py-8">
          <View className="flex-row" style={{ justifyContent: "center", gap: 49 }}>
            <View
              style={{
                backgroundColor: veryLightBeige,
                width: 122,
                height: 122,
                borderTopLeftRadius: 100,
                borderTopRightRadius: 100,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: darkBrown, fontSize: 25, fontFamily: "Philosopher-Bold", textAlign: "center" }}>
                Kirjaudu sisään
              </Text>
            </View>
            <View
              style={{
                backgroundColor: veryLightBeige,
                width: 122,
                height: 122,
                borderTopLeftRadius: 100,
                borderTopRightRadius: 100,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: darkBrown, fontSize: 25, fontFamily: "Philosopher-Bold", textAlign: "center" }}>
                Yrittäjille
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER LINKS */}
        <View className="py-6 px-4">
          {[
            ["Käyttöehdot", "Palvelut"],
            ["Meistä", "Etusivu"],
            ["Tili", "Lahjakortit"],
            ["Ota yhteyttä", "Ajanvaraus"],
          ].map((row, rowIdx) => (
            <View key={rowIdx} className="flex-row justify-between" style={{ marginBottom: 20 }}>
              {row.map((link, colIdx) => (
                <TouchableOpacity key={colIdx} style={{ width: "48%", justifyContent: "center" }}>
                  <Text
                    style={{
                      color: darkBrown,
                      fontSize: 15,
                      marginLeft: 24,
                      fontFamily: "Philosopher-Bold",
                      textAlign: "left",
                    }}
                  >
                    {link}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
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
              backgroundColor: veryLightBeige,
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