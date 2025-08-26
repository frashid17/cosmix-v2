// Page.js
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import SideMenu from '../../components/SideMenu';

export default function Page() {
  const router = useRouter();
  const [isMenuVisible, setMenuVisible] = useState(false);

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

  // Don't render if fonts aren't loaded
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      {/* FIXED HEADER - Outside ScrollView */}
      <View
        style={{
          backgroundColor: white,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
          elevation: 2, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }}
        className="flex-row items-center justify-center px-4 py-5 mt-8"
      >
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Philosopher-Bold",
            letterSpacing: 3,
            color: darkBrown,
          }}
        >
          COSMIX
        </Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={{ position: "absolute", right: 16 }}
        >
          <Ionicons name="menu" size={28} color={darkBrown} />
        </TouchableOpacity>
      </View>

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
            }}
          >
            Kategoriat
          </Text>
          <View className="mt-4">
            {[
              ["Kynnet", "Ripset"],
              ["Hieronnat", "Karvanpoistot"],
              ["Kasvohoidot", "Hiukset"],
              ["Parturi", "Jalkahoidot"],
              ["Meikki", "Esteettiset hoidot"],
              ["Kulmat", "Lisää"],
            ].map((row, rowIdx) => (
              <View key={rowIdx} style={{ flexDirection: "row", justifyContent: "center", gap: 51, marginBottom: 20 }}>
                {row.map((cat, colIdx) => (
                  <TouchableOpacity
                    key={colIdx}
                    style={{
                      backgroundColor: "#D7C3A7",
                      width: 127,
                      height: 47,
                      borderRadius: 30,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      if (cat === "Lisää") {
                        router.push("/categories");
                      }
                    }}
                  >
                    <Text
                      style={{
                        color: darkBrown,
                        textAlign: "center",
                        fontFamily: "Philosopher-Bold",
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* LOGIN & ENTREPRENEURS */}
                <View
          style={{ backgroundColor: lightBrown }}
          className="py-8"
        >
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

      {/* BOTTOM NAV */}

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