// components/BookingSteps.tsx - Progress indicator component
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import AntDesign from "@expo/vector-icons/AntDesign";

const { width } = Dimensions.get('window');

interface BookingStepsProps {
  currentStep: number;
  steps: string[];
}

export default function BookingSteps({ currentStep, steps }: BookingStepsProps) {
  return (
    <View className="px-6 py-6 bg-white border-b border-[#F4EDE5]">
      <View className="flex-row items-center justify-between">
        {steps.map((step, index) => (
          <View key={index} className="items-center flex-1 relative">
            {/* Step Circle */}
            <View 
              className={`w-12 h-12 rounded-full items-center justify-center border-3 shadow-sm ${
                index < currentStep 
                  ? 'bg-[#423120] border-[#423120]' 
                  : index === currentStep
                  ? 'bg-white border-[#423120] border-2'
                  : 'bg-white border-[#E0D7CA]'
              }`}
            >
              {index < currentStep ? (
                <AntDesign name="check" size={18} color="white" />
              ) : (
                <Text 
                  className={`font-bold font-[Philosopher] text-lg ${
                    index === currentStep ? 'text-[#423120]' : 'text-[#968469]'
                  }`}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            
            {/* Step Label */}
            <Text 
              className={`text-xs font-[Philosopher] mt-2 text-center ${
                index <= currentStep ? 'text-[#423120] font-bold' : 'text-[#968469]'
              }`}
            >
              {step}
            </Text>
            
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <View 
                className={`absolute top-6 left-3/5 right-0 h-1 rounded-full ${
                  index < currentStep ? 'bg-[#423120]' : 'bg-[#E0D7CA]'
                }`}
                style={{ width: width / steps.length - 48 }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}