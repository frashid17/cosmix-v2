// src/app/actions/checkout.ts
import { API_ENDPOINTS } from "@/config/constants";
import { SaloonService } from "@/app/types";

export interface CustomerInfo {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  bookingTime: string; // ISO string
  notes?: string;
}

export interface CheckoutResponse {
  success: boolean;
  paymentIntentClientSecret: string;
  publishableKey: string;
  bookingIds: string[];
  amount: number;
  paymentMethod: string;
  status: string;
}

export interface ConfirmBookingResponse {
  success: boolean;
  message: string;
  bookingIds: string[];
  status: string;
}

export interface CheckoutError {
  message: string;
  status?: number;
}

const createCheckoutSession = async (
  saloonServiceIds: string[],
  customerInfo: CustomerInfo,
  authToken?: string
): Promise<CheckoutResponse> => {
  try {
    console.log('Creating checkout session for services:', saloonServiceIds);
    console.log('Customer info:', customerInfo);
    console.log('Auth token provided:', authToken ? 'Yes' : 'No');
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token is available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    console.log('Request headers:', headers);
    console.log('Request URL:', API_ENDPOINTS.CHECKOUT);
    
    const response = await fetch(API_ENDPOINTS.CHECKOUT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        saloonServiceIds,
        customerInfo,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Checkout API error:', response.status, errorText);
      throw new Error(`Checkout failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Checkout session created successfully:', { 
      ...data, 
      paymentIntentClientSecret: data.paymentIntentClientSecret ? '***hidden***' : undefined 
    });
    
    return data;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    throw error;
  }
};

// Confirm booking after successful payment
export const confirmBooking = async (
  bookingIds: string[],
  paymentIntentId: string,
  authToken?: string
): Promise<ConfirmBookingResponse> => {
  try {
    console.log('Confirming booking after payment:', { bookingIds, paymentIntentId });
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(API_ENDPOINTS.CHECKOUT, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        bookingIds,
        paymentIntentId,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Confirm booking API error:', response.status, errorText);
      throw new Error(`Confirm booking failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Booking confirmed successfully:', data);
    
    return data;
  } catch (error) {
    console.error('Error in confirmBooking:', error);
    throw error;
  }
};

export const initiateCheckout = async (
  saloonServices: SaloonService[],
  customerInfo: CustomerInfo,
  authToken?: string
): Promise<CheckoutResponse> => {
  try {
    // Convert SaloonService objects to the format expected by the API
    const saloonServiceIds = saloonServices.map(service => 
      `${service.saloonId}:${service.serviceId}`
    );
    
    console.log('Initiating checkout with service IDs:', saloonServiceIds);
    
    // Create checkout session and get payment intent
    const checkoutData = await createCheckoutSession(saloonServiceIds, customerInfo, authToken);
    
    return checkoutData;
  } catch (error) {
    console.error('Error in initiateCheckout:', error);
    throw error;
  }
};

export default createCheckoutSession;
