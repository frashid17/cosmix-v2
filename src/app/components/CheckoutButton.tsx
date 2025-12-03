// src/app/components/CheckoutButton.tsx
import React, { useState } from 'react';
import { Alert, Platform, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { initiateCheckout, CustomerInfo, CheckoutResponse } from '../actions/checkout';
import { SaloonService } from '@/app/types';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';

interface CheckoutButtonProps {
  saloonServices: SaloonService[];
  customerInfo: CustomerInfo;
  onSuccess?: (bookingIds: string[]) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const CheckoutButtonInner: React.FC<CheckoutButtonProps> = ({
  saloonServices,
  customerInfo,
  onSuccess,
  onError,
  disabled = false,
  children = "Confirm Booking"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleCheckout = async () => {
    if (saloonServices.length === 0) {
      Alert.alert('Error', 'Please select at least one service');
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      Alert.alert('Error', 'Please fill in your name and email address');
      return;
    }

    // If not signed in, go to sign-in and then resume
    if (!isSignedIn) {
      router.push({
        pathname: '/sign-in',
        params: {
          redirect: 'checkout',
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get auth token and include user ID in customerInfo
      const authToken = await getToken();
      const customerInfoWithUserId = {
        ...customerInfo,
        userId: user?.id, // Include Clerk user ID
      };
      
      const result = await initiateCheckout(saloonServices, customerInfoWithUserId, authToken);
      Alert.alert(
        'Booking Confirmed! 🎉',
        result.message || 'Your booking has been confirmed. You will receive a confirmation email shortly. Please remember to pay at the venue.',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.(result.bookingIds);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      Alert.alert('Booking Failed', errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleCheckout}
      disabled={disabled || isLoading}
      style={{ 
        backgroundColor: '#423120', 
        borderRadius: 16, 
        padding: 16, 
        shadowColor: '#423120',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        opacity: (disabled || isLoading) ? 0.6 : 1
      }}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 18 }}>
            Vahvistetaan aikataulua...
            </Text>
          </>
        ) : (
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 18 }}>
            {children}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const CheckoutButton: React.FC<CheckoutButtonProps> = (props) => {
  return <CheckoutButtonInner {...props} />;
};

export default CheckoutButton;