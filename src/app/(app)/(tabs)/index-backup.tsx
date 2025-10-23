import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Page() {
  const router = useRouter();
  
  // Color scheme
  const darkBrown = "#423120";
  const lightBrown = "#D7C3A7"; 
  const white = "#FFFFFF";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: darkBrown, marginBottom: 20 }}>
          Cosmix Beauty
        </Text>
        
        <Text style={{ fontSize: 16, color: darkBrown, textAlign: 'center', marginBottom: 30 }}>
          Welcome to Cosmix Beauty App
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: lightBrown,
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 10,
            marginBottom: 20
          }}
          onPress={() => router.push('/services')}
        >
          <Text style={{ color: darkBrown, fontWeight: 'bold' }}>
            View Services
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: lightBrown,
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 10
          }}
          onPress={() => router.push('/map')}
        >
          <Text style={{ color: darkBrown, fontWeight: 'bold' }}>
            View Map
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}