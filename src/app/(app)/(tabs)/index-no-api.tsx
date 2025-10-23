import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";

export default function Page() {
  const router = useRouter();
  const [heroText, setHeroText] = useState("Palvelut nyt!");

  // Color scheme
  const darkBrown = "#423120";
  const lightBrown = "#D7C3A7";
  const veryLightBeige = "#F4EDE5";
  const white = "#FFFFFF";

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

  // Mock categories without API
  const mockCategories = [
    "Kynsihoidot", "Ripsienpidennykset", "Hieronnat", "Gua Sha hoidot",
    "Hiustenleikkaus", "Värjäys", "Fysioterapia", "Yoga"
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      {/* SIMPLE HEADER */}
      <View style={{ 
        backgroundColor: lightBrown, 
        paddingVertical: 16, 
        paddingHorizontal: 16, 
        alignItems: 'center' 
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: darkBrown 
        }}>
          COSMIX
        </Text>
      </View>

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
              backgroundColor: veryLightBeige
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
              marginBottom: 20
            }}
          >
            Kauden suosituimmat palvelut.
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
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

          <View style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}>
            {mockCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  width: "48%",
                  backgroundColor: lightBrown,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                  marginBottom: 12
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
            
            <TouchableOpacity
              style={{
                width: "100%",
                backgroundColor: darkBrown,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                marginTop: 8
              }}
              onPress={() => router.push("/categories")}
            >
              <Text
                style={{
                  color: white,
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
              >
                Näytä kaikki palvelut
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}