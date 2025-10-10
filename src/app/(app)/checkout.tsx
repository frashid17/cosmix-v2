// src/app/(app)/checkout.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Alert, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';
import { CheckoutButton } from '../components/CheckoutButton';
import { CustomerInfo } from '../actions/checkout';
import { SaloonService } from '@/app/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import BookingCalendar from '../components/BookingCalendar';

// Mock data - replace with your actual data
const mockSaloonServices: SaloonService[] = [
  {
    saloonId: 'saloon-1',
    serviceId: 'service-1',
    price: 50.00,
    durationMinutes: 60,
    isAvailable: true,
    saloon: {
      id: 'saloon-1',
      name: 'Beauty Salon',
      userId: 'user-1',
      rating: 4.5,
    },
    service: {
      id: 'service-1',
      name: 'Hair Cut & Style',
      description: 'Professional hair cutting and styling',
      categoryId: 'cat-1',
      isPopular: true,
    }
  },
  {
    saloonId: 'saloon-1',
    serviceId: 'service-2',
    price: 30.00,
    durationMinutes: 30,
    isAvailable: true,
    saloon: {
      id: 'saloon-1',
      name: 'Beauty Salon',
      userId: 'user-1',
      rating: 4.5,
    },
    service: {
      id: 'service-2',
      name: 'Manicure',
      description: 'Professional nail care',
      categoryId: 'cat-1',
      isPopular: false,
    }
  }
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const params = useLocalSearchParams<{
    saloonId?: string;
    saloonName?: string;
    serviceId?: string;
    serviceName?: string;
    categoryName?: string;
    price?: string;
    durationMinutes?: string;
  }>();

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user?.firstName || '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    phone: user?.phoneNumbers?.[0]?.phoneNumber || '',
    bookingTime: new Date().toISOString(),
    notes: ''
  });

  // Booking calendar state
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>('');
  const [selectedBookingTime, setSelectedBookingTime] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);



  // Create SaloonService object from params using useMemo to prevent infinite re-renders
  const saloonService = useMemo(() => {
    if (params.saloonId && params.serviceId && params.price && params.durationMinutes) {
      return {
        saloonId: params.saloonId,
        serviceId: params.serviceId,
        price: parseFloat(params.price),
        durationMinutes: parseInt(params.durationMinutes),
        isAvailable: true,
        saloon: {
          id: params.saloonId,
          name: params.saloonName || 'Unknown Salon',
          userId: 'user-1', // You might want to get this from the API
 // You might want to get this from the API
          rating: 4.5, // You might want to get this from the API
        },
        service: {
          id: params.serviceId,
          name: params.serviceName || 'Unknown Service',
          description: `${params.serviceName} at ${params.saloonName}`,
          categoryId: 'cat-1', // You might want to get this from the API
          isPopular: false,
        }
      } as SaloonService;
    }
    return null;
  }, [params.saloonId, params.serviceId, params.price, params.durationMinutes, params.saloonName, params.serviceName]);

  const handleSuccess = (transactionId: string) => {
    console.log('Payment successful:', { transactionId });
    setIsProcessingPayment(false);
    
    // Show success message
    Alert.alert(
      'Booking Confirmed! 🎉', 
      'Your booking has been successfully confirmed. You can view it in your profile.',
      [
        {
          text: 'View My Bookings',
          onPress: () => {
            // Clear any navigation state and go to profile
            router.dismissAll();
            router.push('/(tabs)/profile');
          }
        }
      ]
    );
  };

  const handleError = (error: Error) => {
    console.error('Checkout error:', error);
    setIsProcessingPayment(false);
  };

  // Booking calendar handlers
  const handleBookingConfirm = (date: string, time: string) => {
    setSelectedBookingDate(date);
    setSelectedBookingTime(time);
    
    // Update customer info with the selected booking time
    const bookingDateTime = new Date(`${date}T${time}:00`);
    setCustomerInfo(prev => ({
      ...prev,
      bookingTime: bookingDateTime.toISOString()
    }));
    
    setShowBookingCalendar(false);
    
    // Don't automatically proceed to payment - let user click "Continue to Payment"
  };

  const handleBookButtonPress = () => {
    if (selectedBookingDate && selectedBookingTime) {
      // Show the CheckoutButton which will handle Paytrail payment
      setShowBookingCalendar(false);
    } else {
      setShowBookingCalendar(true);
    }
  };

  // Use the selected saloon service or fallback to mock data
  const servicesToDisplay = saloonService ? [saloonService] : mockSaloonServices;
  const totalPrice = servicesToDisplay.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = servicesToDisplay.reduce((sum, service) => sum + service.durationMinutes, 0);

  // Check if all customer info is filled from Clerk profile
  const isCustomerInfoComplete = customerInfo.name && customerInfo.email;

  // Show loading if we're still waiting for params
  if (!saloonService && !params.saloonId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F4EDE5' }}>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 24
        }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#423120',
            textAlign: 'center'
          }}>
            Loading your booking...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4EDE5' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: '#F4EDE5'
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
            shadowColor: '#423120',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#423120" />
        </TouchableOpacity>
        <Text style={{ 
          fontSize: 28, 
          fontWeight: 'bold', 
          color: '#423120',
          flex: 1
        }}>
          Checkout
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>

        {/* Selected Services */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '600', 
              color: '#423120',
              marginBottom: 16
            }}>
              Your Booking
            </Text>
            
            <View style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: 16, 
              padding: 20, 
              shadowColor: '#423120',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              borderWidth: 1,
              borderColor: '#E0D7CA'
            }}>
              {servicesToDisplay.map((service, index) => (
                <View key={index} style={{ 
                  paddingBottom: index < servicesToDisplay.length - 1 ? 16 : 0,
                  borderBottomWidth: index < servicesToDisplay.length - 1 ? 1 : 0,
                  borderBottomColor: '#E0D7CA',
                  marginBottom: index < servicesToDisplay.length - 1 ? 16 : 0
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 18, 
                        fontWeight: '600', 
                        color: '#423120',
                        marginBottom: 4
                      }}>
                {service.service?.name}
                      </Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: '#423120', 
                        opacity: 0.7,
                        marginBottom: 2
                      }}>
                        {service.saloon?.name}
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: '#423120', 
                        opacity: 0.6
                      }}>
                        {service.durationMinutes} minutes
                      </Text>
                    </View>
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: '600', 
                      color: '#423120'
                    }}>
                ${service.price.toFixed(2)}
                    </Text>
                  </View>
            </View>
          ))}

          <View style={{ 
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: '#E0D7CA'
              }}>
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  marginBottom: 8
                }}>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#423120', 
                    opacity: 0.7
                  }}>
                    Total Duration:
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: '#423120'
                  }}>
                    {totalDuration} minutes
                  </Text>
                </View>
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text style={{ 
                    fontSize: 20, 
                    fontWeight: 'bold', 
                    color: '#423120'
                  }}>
                    Total Amount:
                  </Text>
                  <Text style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold', 
                    color: '#423120'
                  }}>
                    ${totalPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

        {/* Book Button */}
        <View style={{ marginBottom: 32 }}>
          {selectedBookingDate && selectedBookingTime ? (
            <CheckoutButton
              saloonServices={servicesToDisplay}
              customerInfo={customerInfo}
              onSuccess={handleSuccess}
              onError={handleError}
              disabled={!isCustomerInfoComplete}
            >
              Continue to Payment
            </CheckoutButton>
          ) : (
            <TouchableOpacity
              onPress={handleBookButtonPress}
              disabled={!isCustomerInfoComplete}
              style={{
                backgroundColor: isCustomerInfoComplete ? '#3C2C1E' : '#D0D0D0',
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 12,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
                flexDirection: 'row',
                justifyContent: 'center'
              }}
            >
              <Text style={{
                fontSize: 18,
                fontFamily: 'Philosopher-Bold',
                color: isCustomerInfoComplete ? '#F5F1EB' : '#999'
              }}>
                Book Appointment
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Show selected appointment info */}
        {selectedBookingDate && selectedBookingTime && (
          <View style={{
            marginBottom: 20,
            padding: 16,
            backgroundColor: '#F4E4BC',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#D4AF37'
          }}>
            <Text style={{
              fontSize: 16,
              fontFamily: 'Philosopher-Bold',
              color: '#3C2C1E',
              marginBottom: 8,
              textAlign: 'center'
            }}>
              Selected Appointment
            </Text>
            <Text style={{
              fontSize: 14,
              fontFamily: 'Philosopher-Regular',
              color: '#3C2C1E',
              textAlign: 'center'
            }}>
              {new Date(selectedBookingDate).toLocaleDateString()} at {selectedBookingTime}
            </Text>
          </View>
        )}
        </View>
    </ScrollView>

    {/* Booking Calendar Modal */}
    <BookingCalendar
      visible={showBookingCalendar}
      onClose={() => setShowBookingCalendar(false)}
      onConfirm={handleBookingConfirm}
      salonName={params.saloonName || 'Salon'}
      saloonId={params.saloonId}
      serviceId={params.serviceId}
    />
    </SafeAreaView>
  );
}
