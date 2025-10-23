import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
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
  const [heroText, setHeroText] = useState("Palvelut nyt!");

  // Color scheme
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

  // Alternate hero text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroText(prevText => 
        prevText === "Palvelut nyt!" ? "Kartta" : "Palvelut nyt!"
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
        <View style={{ backgroundColor: lightBrown, paddingHorizontal: 16, paddingVertical: 24 }}>
          <TouchableOpacity
            style={{
              borderRadius: 20,
              overflow: "hidden",
              alignItems: "center",
              height: 300,
              justifyContent: "center",
              position: "relative",
            }}
            onPress={() => router.push("/map")}
            activeOpacity={0.8}
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
                  fontWeight: 'bold',
                  color: darkBrown,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                {heroText}
              </Text>
            </View>
            
            {/* Dots indicator at bottom of image */}
            <View style={{ 
              position: "absolute", 
              bottom: 50,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center"
            }}>
              <View
                style={{ 
                  width: 11, 
                  height: 11,
                  backgroundColor: darkBrown,
                  borderRadius: 5.5
                }}
              />
              <View
                style={{ 
                  width: 11, 
                  height: 11, 
                  marginLeft: 5,
                  backgroundColor: darkBrown,
                  borderRadius: 5.5
                }}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* POPULAR SERVICES */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
          <Text
            style={{
              color: darkBrown,
              fontWeight: 'bold',
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
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  width: "48%",
                  marginBottom: 16,
                  borderRadius: 15,
                  overflow: "hidden",
                  backgroundColor: veryLightBeige,
                }}
                onPress={() => router.push("/services")}
              >
                <Image
                  source={{ uri: item.img }}
                  style={{
                    width: "100%",
                    height: 120,
                  }}
                  resizeMode="cover"
                />
                <View style={{ padding: 12 }}>
                  <Text
                    style={{
                      color: darkBrown,
                      fontWeight: '600',
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CATEGORIES SECTION */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          <Text
            style={{
              color: darkBrown,
              fontWeight: 'bold',
              fontSize: 20,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Kaikki palvelut
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={darkBrown} />
          ) : error ? (
            <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
          ) : (
            <View>
              {categoryRows.map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  {row.map((category, categoryIndex) => (
                    <TouchableOpacity
                      key={categoryIndex}
                      style={{
                        width: "48%",
                        backgroundColor: lightBrown,
                        borderRadius: 12,
                        padding: 16,
                        alignItems: "center",
                      }}
                      onPress={() => router.push("/categories")}
                    >
                      <Text
                        style={{
                          color: darkBrown,
                          fontWeight: '600',
                          fontSize: 14,
                          textAlign: "center",
                        }}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* SIDE MENU */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <SideMenu onClose={() => setMenuVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}