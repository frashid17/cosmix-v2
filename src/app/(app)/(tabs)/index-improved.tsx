import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function Page() {
  const router = useRouter();
  const [heroText, setHeroText] = useState("Palvelut nyt!");
  
  // Color scheme
  const darkBrown = "#423120";
  const lightBrown = "#D7C3A7";
  const veryLightBeige = "#F4EDE5";
  const white = "#FFFFFF";

  // Sample categories without API calls
  const categories = [
    "Kynsihoidot", "Ripsienpidennykset", "Hieronnat", "Gua Sha hoidot",
    "Hiustenleikkaus", "Värjäys", "Fysioterapia", "Yoga", "Kauneushoito"
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={{ padding: 16, backgroundColor: lightBrown }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: darkBrown,
            textAlign: 'center'
          }}>
            COSMIX
          </Text>
        </View>

        {/* Hero Section */}
        <View style={{ backgroundColor: lightBrown, padding: 16 }}>
          <TouchableOpacity
            style={{
              borderRadius: 20,
              overflow: "hidden",
              alignItems: "center",
              height: 250,
              justifyContent: "center",
              backgroundColor: veryLightBeige
            }}
            onPress={() => router.push("/map")}
            activeOpacity={0.8}
          >
            <View style={{
              justifyContent: "center",
              alignItems: "center",
            }}>
              <Text style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: darkBrown,
                textAlign: 'center'
              }}>
                {heroText}
              </Text>
              <Text style={{
                fontSize: 16,
                color: darkBrown,
                marginTop: 10,
                textAlign: 'center'
              }}>
                Napauta nähdäksesi kartta
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Popular Services */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
          <Text style={{
            color: darkBrown,
            fontWeight: 'bold',
            fontSize: 20,
            marginBottom: 16,
            textAlign: 'center'
          }}>
            Suosituimmat palvelut
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {categories.slice(0, 8).map((category, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  width: '48%',
                  backgroundColor: veryLightBeige,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  alignItems: 'center'
                }}
                onPress={() => router.push('/services')}
              >
                <Text style={{
                  color: darkBrown,
                  fontWeight: '600',
                  fontSize: 14,
                  textAlign: 'center'
                }}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* View All Button */}
          <TouchableOpacity
            style={{
              backgroundColor: darkBrown,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginTop: 16
            }}
            onPress={() => router.push('/services')}
          >
            <Text style={{
              color: white,
              fontWeight: 'bold',
              fontSize: 16
            }}>
              Näytä kaikki palvelut
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}