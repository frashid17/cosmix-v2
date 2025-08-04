// components/DateTimeSelection.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface DateTimeSelectionProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  selectedStaff: any;
}

export default function DateTimeSelection({ 
  selectedDate, 
  setSelectedDate, 
  selectedTime, 
  setSelectedTime, 
  selectedStaff 
}: DateTimeSelectionProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const generateWeekDates = (startDate: Date) => {
    const dates = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en', { month: 'short' }),
        isToday: date.toDateString() === new Date().toDateString(),
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    return dates;
  };

  const generateTimeSlots = () => {
    const slots = [];
    // Generate slots from 9 AM to 8 PM
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHours = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayTime = `${displayHours}:${minute.toString().padStart(2, '0')} ${period}`;
        
        // Simple availability - make most slots available
        const isAvailable = Math.random() > 0.3; // 70% available
        
        slots.push({
          time: timeString,
          displayTime,
          isAvailable
        });
      }
    }
    return slots;
  };

  const weekDates = generateWeekDates(currentWeek);
  const timeSlots = generateTimeSlots();

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <View style={{ paddingHorizontal: 24 }}>
      {/* Header */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ 
          color: '#423120', 
          fontSize: 24, 
          fontWeight: 'bold', 
          fontFamily: 'Philosopher',
          marginBottom: 8
        }}>
          Choose Date & Time
        </Text>
        <Text style={{ 
          color: '#968469', 
          fontFamily: 'Philosopher',
          lineHeight: 20
        }}>
          Select your preferred appointment slot with{' '}
          <Text style={{ fontWeight: 'bold', color: '#423120' }}>
            {selectedStaff?.name}
          </Text>
        </Text>
      </View>

      {/* Week Navigation */}
      <View style={{ marginBottom: 24 }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          <TouchableOpacity 
            onPress={goToPreviousWeek}
            style={{
              padding: 12,
              borderRadius: 20,
              backgroundColor: '#F4EDE5'
            }}
          >
            <AntDesign name="left" size={20} color="#423120" />
          </TouchableOpacity>
          
          <Text style={{ 
            color: '#423120', 
            fontWeight: 'bold', 
            fontFamily: 'Philosopher',
            fontSize: 18
          }}>
            {weekDates[0].month} {weekDates[0].dayNumber} - {weekDates[6].month} {weekDates[6].dayNumber}
          </Text>
          
          <TouchableOpacity 
            onPress={goToNextWeek}
            style={{
              padding: 12,
              borderRadius: 20,
              backgroundColor: '#F4EDE5'
            }}
          >
            <AntDesign name="right" size={20} color="#423120" />
          </TouchableOpacity>
        </View>

        {/* Week Days */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekDates.map((dateInfo, index) => {
            const isSelected = selectedDate === dateInfo.date;
            const canSelect = !dateInfo.isPast;
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => canSelect && setSelectedDate(dateInfo.date)}
                disabled={!canSelect}
                style={{
                  marginRight: 12,
                  padding: 16,
                  borderRadius: 16,
                  minWidth: 80,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: isSelected ? '#423120' : canSelect ? '#E0D7CA' : '#E5E5E5',
                  backgroundColor: isSelected ? '#423120' : canSelect ? 'white' : '#F5F5F5',
                  shadowOffset: isSelected ? { width: 0, height: 2 } : undefined,
                  shadowOpacity: isSelected ? 0.2 : undefined,
                  shadowRadius: isSelected ? 4 : undefined,
                  elevation: isSelected ? 2 : undefined
                }}
              >
                <Text style={{ 
                  fontFamily: 'Philosopher',
                  fontSize: 14,
                  marginBottom: 4,
                  color: isSelected ? 'white' : canSelect ? '#968469' : '#999'
                }}>
                  {dateInfo.dayName}
                </Text>
                <Text style={{ 
                  fontWeight: 'bold',
                  fontFamily: 'Philosopher',
                  fontSize: 20,
                  color: isSelected ? 'white' : canSelect ? '#423120' : '#999'
                }}>
                  {dateInfo.dayNumber}
                </Text>
                <Text style={{ 
                  fontFamily: 'Philosopher',
                  fontSize: 12,
                  color: isSelected ? '#E0D7CA' : canSelect ? '#968469' : '#999'
                }}>
                  {dateInfo.month}
                </Text>
                
                {dateInfo.isToday && (
                  <View style={{
                    width: 8,
                    height: 8,
                    backgroundColor: '#f97316',
                    borderRadius: 4,
                    marginTop: 4
                  }} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Time Slots Section */}
      {selectedDate && (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ 
            color: '#423120', 
            fontWeight: 'bold', 
            fontFamily: 'Philosopher',
            fontSize: 18,
            marginBottom: 16
          }}>
            Available Times
          </Text>

          <ScrollView style={{ maxHeight: 300 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {timeSlots.map((slot, index) => {
                const isSelected = selectedTime === slot.time;
                const canSelect = slot.isAvailable;
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => canSelect && setSelectedTime(slot.time)}
                    disabled={!canSelect}
                    style={{
                      marginRight: 12,
                      marginBottom: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? '#423120' : canSelect ? '#E0D7CA' : '#E5E5E5',
                      backgroundColor: isSelected ? '#423120' : canSelect ? 'white' : '#F5F5F5',
                      shadowOffset: isSelected ? { width: 0, height: 2 } : undefined,
                      shadowOpacity: isSelected ? 0.2 : undefined,
                      shadowRadius: isSelected ? 4 : undefined,
                      elevation: isSelected ? 2 : undefined
                    }}
                  >
                    <Text style={{ 
                      fontFamily: 'Philosopher',
                      textAlign: 'center',
                      color: isSelected ? 'white' : canSelect ? '#423120' : '#999',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}>
                      {slot.displayTime}
                    </Text>
                    
                    {!canSelect && (
                      <Text style={{
                        fontSize: 10,
                        color: '#999',
                        fontFamily: 'Philosopher',
                        textAlign: 'center',
                        marginTop: 4
                      }}>
                        Booked
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <View style={{
          backgroundColor: '#F4EDE5',
          borderRadius: 24,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#D7C3A7'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              backgroundColor: '#423120',
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16
            }}>
              <AntDesign name="checkcircle" size={24} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: '#423120',
                fontWeight: 'bold',
                fontFamily: 'Philosopher',
                fontSize: 18
              }}>
                Appointment Selected
              </Text>
              <Text style={{
                color: '#968469',
                fontFamily: 'Philosopher'
              }}>
                Ready to proceed to summary
              </Text>
            </View>
          </View>

          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialIcons name="calendar-today" size={20} color="#423120" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{
                  color: '#423120',
                  fontWeight: 'bold',
                  fontFamily: 'Philosopher'
                }}>
                  {formatDate(selectedDate)}
                </Text>
                <Text style={{
                  color: '#968469',
                  fontFamily: 'Philosopher'
                }}>
                  {timeSlots.find(s => s.time === selectedTime)?.displayTime}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="schedule" size={20} color="#968469" />
              <Text style={{
                color: '#968469',
                fontFamily: 'Philosopher',
                marginLeft: 12
              }}>
                Duration: 60 minutes
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}