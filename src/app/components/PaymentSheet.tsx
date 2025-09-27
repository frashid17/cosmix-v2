// src/app/components/PaymentSheet.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator, Modal, SafeAreaView, TouchableOpacity } from 'react-native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { CheckoutResponse } from '../actions/checkout';

interface PaymentSheetProps {
  paymentData: CheckoutResponse;
  onSuccess: (sessionId: string) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentSheetProps> = ({
  paymentData,
  onSuccess,
  onError,
  onCancel
}) => {
  const { presentPaymentSheet, initPaymentSheet } = useStripe();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Cosmix Beauty',
        paymentIntentClientSecret: paymentData.clientSecret,
        defaultBillingDetails: {
          name: 'Customer',
        },
        allowsDelayedPaymentMethods: true,
      });

      if (error) {
        console.error('Error initializing payment sheet:', error);
        onError(new Error(error.message));
      } else {
        // Automatically present the payment sheet
        const { error: presentError } = await presentPaymentSheet();
        
        if (presentError) {
          if (presentError.code === 'Canceled') {
            onCancel();
          } else {
            console.error('Payment sheet error:', presentError);
            onError(new Error(presentError.message));
          }
        } else {
          // Payment succeeded
          onSuccess(paymentData.sessionId);
        }
      }
    } catch (err) {
      console.error('Error in initializePaymentSheet:', err);
      onError(err instanceof Error ? err : new Error('Failed to initialize payment'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <View style={{ alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#423120" />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: '#423120',
          textAlign: 'center'
        }}>
          Opening payment...
        </Text>
      </View>
    </View>
  );
};

export const PaymentSheet: React.FC<PaymentSheetProps> = (props) => {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here';

  return (
    <StripeProvider publishableKey={publishableKey}>
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F4EDE5' }}>
          <PaymentForm {...props} />
        </SafeAreaView>
      </Modal>
    </StripeProvider>
  );
};

export default PaymentSheet;