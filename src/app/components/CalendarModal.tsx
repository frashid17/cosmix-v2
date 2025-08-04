// components/CalendarModal.tsx
import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { BlurView } from 'expo-blur';

interface CalendarModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  staffId?: number;
}

export default function CalendarModal({ 
  isVisible, 
  onClose, 
  selectedDate, 
  onDateSelect, 
  staffId 
}: CalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<{[key: string]: 'available' | 'limited' | 'unavailable'}>({});

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateString = current.toISOString().split('T')[0];
      const isPast = current < new Date(new Date().setHours(0, 0, 0, 0));
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === new Date().toDateString();
      const isSelected = selectedDate === dateString;

      days.push({
        date: new Date(current),
        dateString,
        day: current.getDate(),
        isPast,
        isCurrentMonth,
        isToday,
        isSelected,
        availability: availabilityData[dateString] || 'available'
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <BlurView intensity={100} tint="light" className="flex-1" />
        <View className="bg-white rounded-t-3xl max-h-4/5">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-[#F4EDE5]">
            <Text className="text-[#423120] text-xl font-bold font-[Philosopher]">
              Select Date
            </Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="#423120" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Month Navigation */}
            <View className="flex-row items-center justify-between p-6">
              <TouchableOpacity onPress={goToPreviousMonth}>
                <AntDesign name="left" size={24} color="#423120" />
              </TouchableOpacity>
              <Text className="text-[#423120] text-xl font-bold font-[Philosopher]">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={goToNextMonth}>
                <AntDesign name="right" size={24} color="#423120" />
              </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View className="flex-row px-6 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <View key={index} className="flex-1 items-center">
                  <Text className="text-[#968469] font-[Philosopher] text-sm font-bold">
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View className="px-6 pb-6">
              {Array.from({ length: 6 }, (_, weekIndex) => (
                <View key={weekIndex} className="flex-row mb-2">
                  {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((dayInfo, dayIndex) => {
                    const canSelect = !dayInfo.isPast && dayInfo.isCurrentMonth;
                    
                    return (
                      <TouchableOpacity
                        key={dayIndex}
                        onPress={() => canSelect && onDateSelect(dayInfo.dateString)}
                        disabled={!canSelect}
                        className={`flex-1 aspect-square items-center justify-center m-1 rounded-xl ${
                          dayInfo.isSelected
                            ? 'bg-[#423120]'
                            : dayInfo.isToday
                            ? 'bg-[#F4EDE5] border-2 border-[#423120]'
                            : canSelect
                            ? 'bg-white border border-[#E0D7CA]'
                            : 'bg-gray-50'
                        }`}
                      >
                        <Text 
                          className={`font-[Philosopher] ${
                            dayInfo.isSelected
                              ? 'text-white font-bold'
                              : dayInfo.isToday
                              ? 'text-[#423120] font-bold'
                              : canSelect && dayInfo.isCurrentMonth
                              ? 'text-[#423120]'
                              : 'text-gray-400'
                          }`}
                        >
                          {dayInfo.day}
                        </Text>
                        
                        {/* Availability Indicator */}
                        {canSelect && dayInfo.availability !== 'available' && (
                          <View 
                            className={`w-1 h-1 rounded-full mt-1 ${
                              dayInfo.availability === 'limited' ? 'bg-amber-400' : 'bg-red-400'
                            }`} 
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Legend */}
            <View className="px-6 pb-6">
              <Text className="text-[#423120] font-bold font-[Philosopher] mb-3">
                Availability Legend:
              </Text>
              <View className="flex-row flex-wrap">
                <View className="flex-row items-center mr-6 mb-2">
                  <View className="w-4 h-4 bg-white border border-[#E0D7CA] rounded mr-2" />
                  <Text className="text-[#968469] font-[Philosopher] text-sm">
                    Available
                  </Text>
                </View>
                <View className="flex-row items-center mr-6 mb-2">
                  <View className="w-4 h-4 bg-white border border-[#E0D7CA] rounded mr-2 relative">
                    <View className="w-1 h-1 bg-amber-400 rounded-full absolute bottom-0 right-0" />
                  </View>
                  <Text className="text-[#968469] font-[Philosopher] text-sm">
                    Limited
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <View className="w-4 h-4 bg-gray-100 rounded mr-2" />
                  <Text className="text-[#968469] font-[Philosopher] text-sm">
                    Unavailable
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}