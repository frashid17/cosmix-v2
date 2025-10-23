import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function Page() {
  try {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#423120', marginBottom: 20 }}>
            Cosmix Beauty
          </Text>
          <Text style={{ fontSize: 16, color: '#423120', textAlign: 'center' }}>
            App is working! No more crashes.
          </Text>
        </View>
      </SafeAreaView>
    );
  } catch (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'red' }}>
        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center', padding: 20 }}>
          Page Error: {String(error)}
        </Text>
      </View>
    );
  }
}