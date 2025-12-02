// src/app/(app)/checkout.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckoutButton } from '../components/CheckoutButton';
import { CustomerInfo } from '../actions/checkout';
import { SaloonService } from '@/app/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BookingCalendar from '../components/BookingCalendar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import useAuthStore from '@/store/auth.store';

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
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuthStore();
  const params = useLocalSearchParams<{
    saloonId?: string;
    saloonName?: string;
    serviceId?: string;
    serviceName?: string;
    categoryName?: string;
    price?: string;
    durationMinutes?: string;
    date?: string;
    time?: string;
  }>();

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bookingTime: new Date().toISOString(),
    notes: ''
  });

  // Keep customerInfo in sync with Appwrite user after sign-in
  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Booking calendar state
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>('');
  const [selectedBookingTime, setSelectedBookingTime] = useState<string>('');
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);

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

  // Hydrate selected date/time from URL params if present (e.g., after sign-in redirect)
  useEffect(() => {
    const pDate = typeof params.date === 'string' ? params.date : '';
    const pTime = typeof params.time === 'string' ? params.time : '';
    if (pDate) setSelectedBookingDate(pDate);
    if (pTime) setSelectedBookingTime(pTime);
    if (pDate && pTime) {
      const bookingDateTime = new Date(`${pDate}T${pTime}:00`);
      setCustomerInfo(prev => ({ ...prev, bookingTime: bookingDateTime.toISOString() }));
    }
  }, [params.date, params.time]);

  const handleSuccess = (bookingIds: string[]) => {
    console.log('Booking successful:', { bookingIds });
    setIsProcessingBooking(false);

    // Navigate to profile to view bookings without using POP_TO_TOP
    router.replace('/(tabs)/profile');
  };

  const handleError = (error: Error) => {
    console.error('Booking error:', error);
    setIsProcessingBooking(false);
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
  };

  const handleBookButtonPress = () => {
    if (selectedBookingDate && selectedBookingTime) {
      setShowBookingCalendar(false);
    } else {
      setShowBookingCalendar(true);
    }
  };

  // No auto-resume; user explicitly taps the button to open the calendar

  // Use the selected saloon service or fallback to mock data
  const servicesToDisplay = saloonService ? [saloonService] : mockSaloonServices;
  const totalPrice = servicesToDisplay.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = servicesToDisplay.reduce((sum, service) => sum + service.durationMinutes, 0);

  // Check if all customer info is filled from Appwrite profile
  const isCustomerInfoComplete = customerInfo.name && customerInfo.email;

  // Allow rendering even without params; fallback services are used

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4EDE5' }}>
      {/* Header */}
      <Header title="COSMIX" showBack={true} showMenu={true} onBackPress={() => router.back()} onMenuPress={() => setMenuVisible(true)} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 24, alignContent: 'center', justifyContent: 'center', marginTop: 24 }}>



          {/* Selected Services */}
          <View style={{ marginBottom: 24 }}>

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
                  paddingBottom: 0,
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
                      <Text style={{ fontSize: 14, color: '#423120', opacity: 0.7, fontFamily: 'Philosopher-Regular', marginBottom: 2 }}>
                        {service.saloon?.name}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: '#423120',
                        opacity: 0.6
                      }}>

                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#423120'
                    }}>
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
                    Duration:
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
                    Kokonaismäärä:
                  </Text>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#423120'
                  }}>
                    €{totalPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Book Button */}
          <View style={{ marginBottom: 32 }}>
            {selectedBookingDate && selectedBookingTime ? (
              isAuthenticated ? (
                <CheckoutButton
                  saloonServices={servicesToDisplay}
                  customerInfo={customerInfo}
                  onSuccess={handleSuccess}
                  onError={handleError}
                  disabled={!isCustomerInfoComplete}
                >
                  Vahvista varaus
                </CheckoutButton>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    // Build redirect back to checkout with all current params + selected date/time
                    const search = new URLSearchParams({
                      ...(params.saloonId ? { saloonId: String(params.saloonId) } : {}),
                      ...(params.saloonName ? { saloonName: String(params.saloonName) } : {}),
                      ...(params.serviceId ? { serviceId: String(params.serviceId) } : {}),
                      ...(params.serviceName ? { serviceName: String(params.serviceName) } : {}),
                      ...(params.categoryName ? { categoryName: String(params.categoryName) } : {}),
                      ...(params.price ? { price: String(params.price) } : {}),
                      ...(params.durationMinutes ? { durationMinutes: String(params.durationMinutes) } : {}),
                      date: selectedBookingDate,
                      time: selectedBookingTime,
                    }).toString();
                    const redirectPath = `/(app)/checkout?${search}`;
                    router.push({ pathname: '/sign-in', params: { redirect: encodeURIComponent(redirectPath) } });
                  }}
                  style={{
                    backgroundColor: '#423120',
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
                  <Text style={{ fontSize: 18, fontFamily: 'Philosopher-Bold', color: '#F5F1EB' }}>
                    Kirjaudu sisään Aikatauluun
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                onPress={() => {
                  handleBookButtonPress();
                }}
                style={{
                  backgroundColor: '#423120',
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="calendar-outline" size={28} color="#F5F1EB" style={{ marginBottom: 6 }} />
                <Text style={{ fontSize: 18, fontFamily: 'Philosopher-Bold', color: '#F5F1EB' }}>
                  Ajoittaa
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Show selected appointment info */}
          {selectedBookingDate && selectedBookingTime && (
            <View style={{
              marginBottom: 20,
              padding: 16,
              backgroundColor: '#D7C3A7',
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
                Valittu tapaaminen
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

      {/* Modal for the side menu */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isMenuVisible}
        onRequestClose={() => setMenuVisible(false)}
        statusBarTranslucent={true}
      >
        <SideMenu onClose={() => setMenuVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}