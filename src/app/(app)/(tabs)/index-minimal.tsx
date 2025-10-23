import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Page() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#423120', marginBottom: 20 }}>
          Cosmix Beauty
        </Text>
        <Text style={{ fontSize: 16, color: '#423120', textAlign: 'center', marginBottom: 30 }}>
          App is now working!
        </Text>
        
        <TouchableOpacity
          style={{
            backgroundColor: '#D7C3A7',
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 10,
            marginBottom: 20
          }}
          onPress={() => router.push('/services')}
        >
          <Text style={{ color: '#423120', fontWeight: 'bold' }}>
            View Services
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#D7C3A7',
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 10
          }}
          onPress={() => router.push('/map')}
        >
          <Text style={{ color: '#423120', fontWeight: 'bold' }}>
            View Map
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}