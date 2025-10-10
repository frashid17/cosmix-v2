// src/app/components/CheckoutButton.tsx
import React, { useState } from 'react';
import { Alert, Platform, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { initiateCheckout, CustomerInfo, CheckoutResponse } from '../actions/checkout';
import { SaloonService } from '@/app/types';
import { useAuth } from '@clerk/clerk-expo';
import PaytrailPaymentSheet from './PaytrailPaymentSheet';

interface CheckoutButtonProps {
  saloonServices: SaloonService[];
  customerInfo: CustomerInfo;
  onSuccess?: (transactionId: string) => void;
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
  children = "Proceed to Checkout"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [paymentData, setPaymentData] = useState<CheckoutResponse | null>(null);
  const { getToken } = useAuth();

  const handleCheckout = async () => {
    if (saloonServices.length === 0) {
      Alert.alert('Error', 'Please select at least one service');
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      Alert.alert('Error', 'Please fill in your name and email address');
      return;
    }

    setIsLoading(true);

    try {
      // Get the authentication token
      const token = await getToken();
      console.log('Auth token obtained in CheckoutButton:', token ? 'Yes' : 'No');
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const result = await initiateCheckout(saloonServices, customerInfo, token || undefined);
      
      // Set payment data and show Paytrail payment sheet
      setPaymentData(result);
      setShowPaymentSheet(true);
      
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      Alert.alert('Checkout Failed', errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setShowPaymentSheet(false);
    setPaymentData(null);
    onSuccess?.(transactionId);
  };

  const handlePaymentError = (error: Error) => {
    setShowPaymentSheet(false);
    setPaymentData(null);
    onError?.(error);
  };

  const handlePaymentCancel = () => {
    setShowPaymentSheet(false);
    setPaymentData(null);
  };

  return (
    <>
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
              Processing...
            </Text>
          </>
        ) : (
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 18 }}>
            {children}
          </Text>
        )}
      </View>
    </TouchableOpacity>

    {paymentData && (
      <PaytrailPaymentSheet
        paymentData={paymentData}
        visible={showPaymentSheet}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={handlePaymentCancel}
      />
    )}
    </>
  );
};

export const CheckoutButton: React.FC<CheckoutButtonProps> = (props) => {
  return <CheckoutButtonInner {...props} />;
};

export default CheckoutButton;
