// src/app/components/StripeProvider.tsx
import React from 'react';
import { StripeProvider as StripeProviderBase } from '@stripe/stripe-react-native';

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error('Stripe publishable key is not set in environment variables');
    return <>{children}</>;
  }

  return (
    <StripeProviderBase
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.cosmix.app" // Optional: for Apple Pay
      urlScheme="cosmix" // Optional: for redirects
    >
      {children}
    </StripeProviderBase>
  );
};

export default StripeProvider;
