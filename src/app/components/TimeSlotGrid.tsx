// components/TimeSlotsGrid.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface TimeSlotsGridProps {
  slots: any[];
  selectedTime: string;
  onTimeSelect: (time: string, slot: any) => void;
  isLoading?: boolean;
}

export default function TimeSlotsGrid({ slots, selectedTime, onTimeSelect, isLoading }: TimeSlotsGridProps) {
  if (isLoading) {
    return <TimeSlotsSkeleton />;
  }

  const morningSlots = slots.filter((slot: any) => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour < 12;
  });

  const afternoonSlots = slots.filter((slot: any) => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 12 && hour < 17;
  });

  const eveningSlots = slots.filter((slot: any) => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 17;
  });

  const TimeSlotSection = ({ title, slots, icon }: any) => (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <MaterialIcons name={icon} size={18} color="#968469" />
        <Text className="text-[#423120] font-bold font-[Philosopher] ml-2">
          {title}
        </Text>
        <Text className="text-[#968469] font-[Philosopher] ml-2 text-sm">
          ({slots.filter((s: any) => s.isAvailable).length} available)
        </Text>
      </View>
      
      <View className="flex-row flex-wrap">
        {slots.map((slot: any, index: number) => {
          const isSelected = selectedTime === slot.time;
          const canSelect = slot.isAvailable;
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => canSelect && onTimeSelect(slot.time, slot)}
              disabled={!canSelect}
              className={`mr-3 mb-3 px-4 py-3 rounded-xl border ${
                isSelected 
                  ? 'bg-[#423120] border-[#423120] shadow-lg' 
                  : canSelect
                  ? 'bg-white border-[#E0D7CA] shadow-sm'
                  : 'bg-gray-100 border-gray-200'
              }`}
            >
              <Text 
                className={`font-[Philosopher] text-center ${
                  isSelected 
                    ? 'text-white font-bold' 
                    : canSelect 
                    ? 'text-[#423120]' 
                    : 'text-gray-500'
                }`}
              >
                {slot.displayTime}
              </Text>
              
              {!canSelect && (
                <Text className="text-xs text-gray-400 font-[Philosopher] text-center mt-1">
                  {slot.reason}
                </Text>
              )}
              
              {canSelect && slot.price > 0 && (
                <Text className="text-xs text-amber-600 font-[Philosopher] text-center mt-1">
                  +${slot.price}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {slots.filter((s: any) => s.isAvailable).length === 0 && (
        <View className="bg-gray-50 rounded-xl p-4 items-center">
          <MaterialIcons name="event-busy" size={24} color="#968469" />
          <Text className="text-[#968469] font-[Philosopher] text-center mt-2">
            No available slots in {title.toLowerCase()}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View>
      <TimeSlotSection 
        title="Morning" 
        slots={morningSlots} 
        icon="wb-sunny" 
      />
      <TimeSlotSection 
        title="Afternoon" 
        slots={afternoonSlots} 
        icon="wb-cloudy" 
      />
      <TimeSlotSection 
        title="Evening" 
        slots={eveningSlots} 
        icon="brightness-3" 
      />
    </View>
  );
}

// Time Slots Loading Skeleton
function TimeSlotsSkeleton() {
  return (
    <View>
      {['Morning', 'Afternoon', 'Evening'].map((period, periodIndex) => (
        <View key={periodIndex} className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-5 h-5 bg-gray-200 rounded mr-2" />
            <View className="w-20 h-4 bg-gray-200 rounded" />
          </View>
          <View className="flex-row flex-wrap">
            {[...Array(6)].map((_, index) => (
              <View 
                key={index}
                className="w-20 h-12 bg-gray-200 rounded-xl mr-3 mb-3"
              >
                <ActivityIndicator size="small" color="#968469" style={{ marginTop: 8 }} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}