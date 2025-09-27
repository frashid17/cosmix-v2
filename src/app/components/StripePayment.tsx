// src/app/components/StripePayment.tsx
import React, { useState } from 'react';
import { Alert, View, Text } from 'react-native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { Button, ButtonText } from '@/components/ui/button';

interface StripePaymentProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: Error) => void;
}

const PaymentForm: React.FC<StripePaymentProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError
}) => {
  const { confirmPayment } = useStripe();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            // You can pre-fill billing details here if needed
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        onError(new Error(error.message));
      } else if (paymentIntent.status === 'Succeeded') {
        console.log('Payment succeeded:', paymentIntent.id);
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error('Payment error:', err);
      onError(err instanceof Error ? err : new Error('Payment failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Complete Payment
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 16 }}>
        Amount: ${(amount / 100).toFixed(2)}
      </Text>
      
      <Button
        onPress={handlePayment}
        isDisabled={isLoading}
        size="lg"
        variant="solid"
        action="primary"
      >
        <ButtonText>
          {isLoading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
        </ButtonText>
      </Button>
    </View>
  );
};

export const StripePayment: React.FC<StripePaymentProps> = (props) => {
  // You'll need to add your Stripe publishable key here
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here';

  return (
    <StripeProvider publishableKey={publishableKey}>
      <PaymentForm {...props} />
    </StripeProvider>
  );
};

export default StripePayment;
