// src/app/components/CheckoutButton.tsx
import React, { useState } from 'react';
import { Alert, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { initiateCheckout, confirmBooking, CustomerInfo } from '../actions/checkout';
import { SaloonService } from '@/app/types';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useStripe } from '@stripe/stripe-react-native';

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
  
  // Use Stripe hook - this will work if the native module is available
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleCheckout = async () => {
    if (saloonServices.length === 0) {
      Alert.alert('Virhe', 'Valitse vähintään yksi palvelu');
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      Alert.alert('Virhe', 'Täytä nimesi ja sähköpostiosoitteesi');
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
      // Get auth token
      const authToken = await getToken();
      const customerInfoWithUserId = {
        ...customerInfo,
        userId: user?.id,
      };
      
      // Step 1: Create checkout session and get payment intent
      console.log('Creating checkout session...');
      const result = await initiateCheckout(saloonServices, customerInfoWithUserId, authToken || undefined);
      
      if (!result.paymentIntentClientSecret) {
        throw new Error('Maksun alustus epäonnistui');
      }

      console.log('Got payment intent, initializing payment sheet...');

      // Step 2: Initialize the Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: result.paymentIntentClientSecret,
        merchantDisplayName: 'Cosmix Beauty',
        allowsDelayedPaymentMethods: false,
        customFlow: false, // Explicitly set to avoid native crashes
        defaultBillingDetails: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
      });

      if (initError) {
        console.error('Error initializing payment sheet:', initError);
        throw new Error(initError.message || 'Maksulomakkeen alustus epäonnistui');
      }

      console.log('Payment sheet initialized, presenting...');

      // Step 3: Present the Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code === 'Canceled') {
          console.log('Payment canceled by user');
          setIsLoading(false);
          return;
        }
        console.error('Payment failed:', paymentError);
        throw new Error(paymentError.message || 'Maksu epäonnistui');
      }

      // Step 4: Payment successful - confirm the booking
      console.log('Payment successful, confirming booking...');
      
      const confirmResult = await confirmBooking(
        result.bookingIds, 
        result.paymentIntentClientSecret.split('_secret_')[0],
        authToken || undefined
      );

      Alert.alert(
        'Varaus vahvistettu! 🎉',
        confirmResult.message || 'Varauksesi on vahvistettu. Saat vahvistusviestin sähköpostiisi.',
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
      const errorMessage = error instanceof Error ? error.message : 'Odottamaton virhe tapahtui';
      Alert.alert('Varaus epäonnistui', errorMessage);
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
              Käsitellään maksua...
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
