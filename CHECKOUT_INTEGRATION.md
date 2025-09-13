# Checkout Integration Guide

This guide explains how to integrate the checkout functionality with your Expo app and Next.js admin API.

## Setup

### 1. Environment Variables
Make sure your Expo app has the correct environment variables in your `.env` file:

```env
EXPO_PUBLIC_STORE_ID=your-store-id
EXPO_PUBLIC_DEV_IP=192.168.0.102   # Your computer's IP address
EXPO_PUBLIC_DEV_PORT=3000
EXPO_PUBLIC_PRODUCTION_DOMAIN=your-production-domain.com
```

### 2. API Configuration
The checkout API is configured to work with your salon booking system. The API expects:
- `saloonServiceIds`: Array of strings in format `"saloonId:serviceId"`
- `customerInfo`: Customer details including name, email, phone, booking time, and notes

## Usage

### Basic Checkout Flow

1. **Select Services**: Use the `ServiceBooking` component to let users select salon services
2. **Customer Info**: Collect customer information (name, email, phone)
3. **Checkout**: Use the `CheckoutButton` component to initiate payment

### Example Integration

```tsx
import { ServiceBooking } from '@/app/components/ServiceBooking';
import { SaloonService } from '@/app/types';

const MyBookingScreen = () => {
  const saloonServices: SaloonService[] = [
    // Your salon services data
  ];

  const handleBookingComplete = (bookingIds: string[]) => {
    console.log('Bookings created:', bookingIds);
    // Handle successful booking
  };

  return (
    <ServiceBooking
      saloonServices={saloonServices}
      onBookingComplete={handleBookingComplete}
    />
  );
};
```

### Custom Checkout Implementation

If you need more control, you can use the checkout action directly:

```tsx
import { initiateCheckout } from '@/app/actions/checkout';
import { SaloonService, CustomerInfo } from '@/app/types';

const handleCustomCheckout = async () => {
  try {
    const saloonServices: SaloonService[] = [
      // Your selected services
    ];
    
    const customerInfo: CustomerInfo = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      bookingTime: new Date().toISOString(),
      notes: 'Optional notes'
    };

    const result = await initiateCheckout(saloonServices, customerInfo);
    console.log('Checkout initiated:', result);
  } catch (error) {
    console.error('Checkout failed:', error);
  }
};
```

## API Endpoints

The checkout integration uses these endpoints:

- **POST** `/api/[storeId]/checkout` - Create checkout session
- **GET** `/api/[storeId]/services` - Get available services
- **GET** `/api/[storeId]/saloons` - Get available salons

## Data Flow

1. User selects salon services in your Expo app
2. App calls `/api/[storeId]/checkout` with service IDs and customer info
3. API creates booking records and Stripe checkout session
4. User is redirected to Stripe checkout
5. After payment, user returns to your app
6. Booking records are marked as paid via webhook

## Testing

1. Start your Next.js admin API: `npm run dev` (port 3000)
2. Start your Expo app: `npm start` (port 8081)
3. Make sure both apps can communicate (check IP addresses)
4. Test the checkout flow with Stripe test cards

## Stripe Configuration

Make sure your Next.js API has:
- Stripe secret key in environment variables
- Webhook endpoint configured for payment confirmation
- Success/cancel URLs pointing to your Expo app

## Troubleshooting

### CORS Issues
- Make sure your Next.js API allows requests from your Expo app
- Check that the IP addresses match between apps

### Network Issues
- Verify both apps are running on correct ports
- Check that your computer's IP address is correct in environment variables
- Test API endpoints directly in browser/Postman

### Stripe Issues
- Verify Stripe keys are correct
- Check webhook configuration
- Test with Stripe test cards
