// src/app/(app)/bookings.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { getBookings } from '../actions/get-bookings';
import { Booking } from '../types';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getToken } = useAuth();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      console.log('Fetching bookings with token:', token ? 'Yes' : 'No');
      
      const data = await getBookings(token || undefined);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#666' }}>Loading bookings...</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#423120' }}>
        My Bookings
      </Text>

      {bookings.length === 0 ? (
        <View style={{ 
          padding: 20, 
          alignItems: 'center', 
          backgroundColor: '#f5f5f5', 
          borderRadius: 12,
          marginTop: 20
        }}>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
            No bookings found. Book a service to see your appointments here.
          </Text>
        </View>
      ) : (
        bookings.map((booking) => (
          <View 
            key={booking.id} 
            style={{ 
              backgroundColor: 'white', 
              padding: 16, 
              borderRadius: 12, 
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              borderWidth: 1,
              borderColor: '#E0D7CA'
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#423120', marginBottom: 4 }}>
                  {booking.service?.name || 'Service'}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>
                  {new Date(booking.bookingTime).toLocaleDateString()} at {new Date(booking.bookingTime).toLocaleTimeString()}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>
                  Status: {booking.status}
                </Text>
                {booking.totalAmount && (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#423120', marginTop: 4 }}>
                    ${booking.totalAmount.toFixed(2)}
                  </Text>
                )}
              </View>
              
              <View style={{ 
                backgroundColor: booking.status === 'confirmed' ? '#4CAF50' : '#FF9800',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12
              }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 12, 
                  fontWeight: 'bold',
                  textTransform: 'capitalize'
                }}>
                  {booking.status}
                </Text>
              </View>
            </View>
            
            {booking.notes && (
              <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E0D7CA' }}>
                <Text style={{ fontSize: 14, color: '#666' }}>
                  Notes: {booking.notes}
                </Text>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}
