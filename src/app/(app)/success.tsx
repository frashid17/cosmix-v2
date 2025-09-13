import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button, ButtonText } from '@/components/ui/button';

export default function SuccessScreen() {
  const { session_id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      // Here you could verify the session with your backend
      console.log('Payment successful, session ID:', session_id);
      
      // Simulate processing
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Payment Successful!',
          'Your booking has been confirmed. You will receive a confirmation email shortly.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(app)/bookings')
            }
          ]
        );
      }, 2000);
    } else {
      setIsLoading(false);
      Alert.alert('Error', 'No session ID found');
    }
  }, [session_id]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 20, fontSize: 16, textAlign: 'center' }}>
          Processing your payment...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Payment Successful!
      </Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 30 }}>
        Your booking has been confirmed. You will receive a confirmation email shortly.
      </Text>
      <Button
        onPress={() => router.replace('/(app)/bookings')}
        size="lg"
        variant="solid"
        action="primary"
      >
        <ButtonText>View My Bookings</ButtonText>
      </Button>
    </View>
  );
}
