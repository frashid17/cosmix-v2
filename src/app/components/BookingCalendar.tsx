// src/app/components/BookingCalendar.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/config/constants';

const { width } = Dimensions.get('window');

// Theme colors matching the app
const darkBrown = "#3C2C1E";
const lightBeige = "#F5F1EB";
const accentGold = "#3C2C1E"; // Changed from gold to dark brown to match app theme
const lightGold = "#F4E4BC";

interface BookingCalendarProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedDate: string, selectedTime: string) => void;
  salonName: string;
  saloonId?: string;
  serviceId?: string;
  storeId?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  visible,
  onClose,
  onConfirm,
  salonName,
  saloonId,
  serviceId,
  storeId
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availabilityData, setAvailabilityData] = useState<{[date: string]: string[]}>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available slots from backend
  const fetchAvailableSlots = async (date: string) => {
    if (!saloonId || !serviceId || !storeId) {
      console.log('Missing required props for fetching slots');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/saloons/${saloonId}/available-slots?serviceId=${serviceId}&date=${date}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const slots = data.availableSlots.map((slot: any) => slot.time);
        setAvailableSlots(slots);
      } else {
        console.log('Failed to fetch available slots');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch slots when date is selected
  useEffect(() => {
    if (selectedDate && saloonId && serviceId && storeId) {
      fetchAvailableSlots(selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, saloonId, serviceId, storeId]);

  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // All possible time slots - we'll show all but grey out unavailable ones
  const allTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      full: date.toISOString().split('T')[0]
    };
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(selectedDate, selectedTime);
      // Close the modal after confirming
      onClose();
    }
  };

  const isTimeSlotAvailable = (time: string) => {
    // Check if the time slot is in the available slots from backend
    return availableSlots.includes(time);
  };

  const isDateAvailable = (date: Date) => {
    // For now, we'll consider all dates as potentially available
    // In a real implementation, you'd check if the date has any available slots
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: lightBeige }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5DCC8',
          backgroundColor: 'white'
        }}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={darkBrown} />
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Philosopher-Bold',
              color: darkBrown
            }}>
              Book Appointment
            </Text>
            <Text style={{
              fontSize: 14,
              fontFamily: 'Philosopher-Regular',
              color: darkBrown,
              opacity: 0.7
            }}>
              {salonName}
            </Text>
          </View>
          
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Date Selection */}
          <View style={{ padding: 20 }}>
            <Text style={{
              fontSize: 20,
              fontFamily: 'Philosopher-Bold',
              color: darkBrown,
              marginBottom: 16
            }}>
              Select Date
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              {generateDates().map((date, index) => {
                const formatted = formatDate(date);
                const isSelected = selectedDate === formatted.full;
                const isToday = index === 0;
                const isAvailable = isDateAvailable(date);
                
                return (
                  <TouchableOpacity
                    key={formatted.full}
                    onPress={() => isAvailable && setSelectedDate(formatted.full)}
                    disabled={!isAvailable}
                    style={{
                      width: 80,
                      height: 90,
                      marginRight: 12,
                      borderRadius: 16,
                      backgroundColor: isSelected ? accentGold : isAvailable ? 'white' : '#F0F0F0',
                      borderWidth: 2,
                      borderColor: isSelected ? accentGold : isAvailable ? '#E5DCC8' : '#D0D0D0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      opacity: isAvailable ? 1 : 0.4
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      fontFamily: 'Philosopher-Regular',
                      color: isSelected ? 'white' : isAvailable ? darkBrown : '#999',
                      opacity: 0.7
                    }}>
                      {formatted.day}
                    </Text>
                    <Text style={{
                      fontSize: 20,
                      fontFamily: 'Philosopher-Bold',
                      color: isSelected ? 'white' : isAvailable ? darkBrown : '#999',
                      marginVertical: 2
                    }}>
                      {formatted.date}
                    </Text>
                    <Text style={{
                      fontSize: 10,
                      fontFamily: 'Philosopher-Regular',
                      color: isSelected ? 'white' : isAvailable ? darkBrown : '#999',
                      opacity: 0.7
                    }}>
                      {formatted.month}
                    </Text>
                    {isToday && (
                      <View style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: isSelected ? 'white' : isAvailable ? accentGold : '#999'
                      }} />
                    )}
                    {!isAvailable && (
                      <View style={{
                        position: 'absolute',
                        top: 2,
                        left: 2,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#FF6B6B'
                      }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Selection */}
          {selectedDate && (
            <View style={{ padding: 20, paddingTop: 0 }}>
              <Text style={{
                fontSize: 20,
                fontFamily: 'Philosopher-Bold',
                color: darkBrown,
                marginBottom: 16
              }}>
                Select Time
              </Text>
              
              {loading ? (
                <View style={{ 
                  flex: 1, 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  paddingVertical: 40 
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'Philosopher-Regular',
                    color: darkBrown,
                    opacity: 0.7
                  }}>
                    Loading available times...
                  </Text>
                </View>
              ) : (
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  {allTimeSlots.map((time) => {
                    const isAvailable = isTimeSlotAvailable(time);
                    const isSelected = selectedTime === time;
                    
                    return (
                      <TouchableOpacity
                        key={time}
                        onPress={() => isAvailable && setSelectedTime(time)}
                        disabled={!isAvailable}
                        style={{
                          width: (width - 80) / 3,
                          height: 50,
                          borderRadius: 12,
                          backgroundColor: isSelected 
                            ? accentGold 
                            : isAvailable 
                              ? 'white' 
                              : '#F0F0F0',
                          borderWidth: 2,
                          borderColor: isSelected 
                            ? accentGold 
                            : isAvailable 
                              ? '#E5DCC8' 
                              : '#D0D0D0',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: isAvailable ? 1 : 0.4
                        }}
                      >
                        <Text style={{
                          fontSize: 16,
                          fontFamily: 'Philosopher-Bold',
                          color: isSelected 
                            ? 'white' 
                            : isAvailable 
                              ? darkBrown 
                              : '#999'
                        }}>
                          {time}
                        </Text>
                        {!isAvailable && (
                          <View style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#FF6B6B'
                          }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Selected Appointment Summary */}
          {selectedDate && selectedTime && (
            <View style={{
              margin: 20,
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 16,
              borderWidth: 2,
              borderColor: accentGold,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5
            }}>
              <Text style={{
                fontSize: 18,
                fontFamily: 'Philosopher-Bold',
                color: darkBrown,
                marginBottom: 12,
                textAlign: 'center'
              }}>
                Appointment Summary
              </Text>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <Ionicons name="calendar-outline" size={20} color={accentGold} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'Philosopher-Regular',
                  color: darkBrown,
                  marginLeft: 8
                }}>
                  {formatDate(new Date(selectedDate)).day}, {formatDate(new Date(selectedDate)).date} {formatDate(new Date(selectedDate)).month}
                </Text>
              </View>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16
              }}>
                <Ionicons name="time-outline" size={20} color={accentGold} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'Philosopher-Regular',
                  color: darkBrown,
                  marginLeft: 8
                }}>
                  {selectedTime}
                </Text>
              </View>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="business-outline" size={20} color={accentGold} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'Philosopher-Regular',
                  color: darkBrown,
                  marginLeft: 8
                }}>
                  {salonName}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Confirm Button */}
        <View style={{
          padding: 20,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5DCC8'
        }}>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            style={{
              backgroundColor: selectedDate && selectedTime ? accentGold : '#D0D0D0',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <Text style={{
              fontSize: 18,
              fontFamily: 'Philosopher-Bold',
              color: selectedDate && selectedTime ? 'white' : '#999'
            }}>
              Confirm Booking
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default BookingCalendar;
