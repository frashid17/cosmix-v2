# Paytrail Integration for React Native App

This document outlines the changes made to integrate Paytrail payment processing in the React Native app.

## Changes Made

### 1. Removed Stripe Dependencies
- Removed `@stripe/stripe-react-native` from package.json
- Deleted Stripe-related components:
  - `StripePayment.tsx`
  - `StripeProvider.tsx`
- Removed StripeProvider from app layout

### 2. Updated Payment Flow
- **Checkout Action**: Updated to work with Paytrail payment URLs instead of Stripe client secrets
- **CheckoutButton**: Now uses Paytrail payment sheet instead of Stripe payment sheet
- **PaymentSheet**: Updated to handle Paytrail redirects and deep linking

### 3. New Paytrail Components
- **PaytrailPayment**: Core payment component that opens Paytrail payment URL
- **PaytrailPaymentSheet**: Modal wrapper for Paytrail payment with deep linking support

### 4. Updated Types
- `CheckoutResponse` now includes:
  - `paymentUrl` (instead of `clientSecret`)
  - `transactionId` (instead of `sessionId`)

## Payment Flow

1. User selects services and booking time
2. User clicks "Continue to Payment"
3. App calls backend `/api/checkout` endpoint
4. Backend creates Paytrail payment and returns `paymentUrl`
5. App opens Paytrail payment URL in browser
6. User completes payment on Paytrail's secure page
7. Paytrail redirects back to app via deep linking
8. App handles success/cancel and updates booking status

## Deep Linking

The app handles Paytrail redirects through deep linking:
- Success: `yourapp://payment/success`
- Cancel: `yourapp://payment/cancel`

## Environment Variables

No additional environment variables needed for the React Native app. The backend handles Paytrail configuration.

## Testing

1. Ensure backend is running with Paytrail configuration
2. Test payment flow in development mode
3. Verify deep linking works correctly
4. Test both success and cancel scenarios

## Notes

- Payment processing is now handled entirely by Paytrail
- No client-side payment processing or card handling
- All payment methods supported by Paytrail are available (Finnish banks, cards, mobile payments)
- Currency is automatically set to EUR for Finnish market
