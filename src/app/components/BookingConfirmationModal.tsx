// components/BookingConfirmation.tsx
import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router'; // Uncommented for navigation

interface BookingConfirmationProps {
  isVisible: boolean;
  onClose: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToHome?: () => void;
  bookingDetails: {
    service?: string;
    staff?: string;
    date?: string;
    time?: string;
    total?: number;
  };
}

export default function BookingConfirmation({ isVisible, onClose, bookingDetails }: BookingConfirmationProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const generateBookingReference = () => {
    const prefix = "SPA";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const bookingRef = generateBookingReference();

  const handleViewAppointments = () => {
    onClose(); // Close the modal first
    router.push('/bookings'); // Navigate to bookings page
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <BlurView intensity={100} tint="light" className="absolute inset-0" />
        
        <View className="bg-white rounded-3xl p-8 mx-6 max-w-sm w-full shadow-2xl">
          {/* Success Animation */}
          <View className="items-center mb-6">
            
            
            <Text className="text-[#423120] text-2xl font-bold font-[Philosopher] text-center mb-2">
              Booking Confirmed! 🎉
            </Text>
            <Text className="text-[#968469] font-[Philosopher] text-center">
              Your spa appointment has been successfully scheduled
            </Text>
          </View>
          
          {/* Booking Reference */}
          <View className="bg-[#F4EDE5] rounded-2xl p-4 mb-6">
            <Text className="text-[#423120] font-bold font-[Philosopher] text-center mb-1">
              Booking Reference
            </Text>
            <View className="flex-row items-center justify-center">
              <Text className="text-[#423120] text-2xl font-bold font-[Philosopher] mr-3">
                #{bookingRef}
              </Text>
              <TouchableOpacity className="p-2">
                <MaterialIcons name="content-copy" size={20} color="#968469" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Quick Summary */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[#968469] font-[Philosopher]">Service</Text>
              <Text className="text-[#423120] font-[Philosopher] font-bold">
                {bookingDetails?.service}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[#968469] font-[Philosopher]">Date</Text>
              <Text className="text-[#423120] font-[Philosopher]">
                {bookingDetails?.date}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[#968469] font-[Philosopher]">Time</Text>
              <Text className="text-[#423120] font-[Philosopher]">
                {bookingDetails?.time}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-[#968469] font-[Philosopher]">Total</Text>
              <Text className="text-[#423120] font-bold font-[Philosopher] text-lg">
                ${bookingDetails?.total?.toFixed(2)}
              </Text>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View className="space-y-3">
            <TouchableOpacity 
              className="bg-[#423120] py-4 rounded-2xl"
              onPress={handleViewAppointments}
            >
              <Text className="text-white font-bold font-[Philosopher] text-center">
                View My Appointments
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Additional Info */}
          <View className="mt-6 pt-4 border-t border-[#F4EDE5]">
            <View className="flex-row items-center justify-center mb-3">
              <MaterialIcons name="email" size={16} color="#968469" />
              <Text className="text-[#968469] font-[Philosopher] text-center text-sm ml-2">
                Confirmation email sent
              </Text>
            </View>
            
            <View className="flex-row items-center justify-center">
              <MaterialIcons name="event" size={16} color="#968469" />
              <Text className="text-[#968469] font-[Philosopher] text-center text-sm ml-2">
                Calendar reminder added
              </Text>
            </View>
          </View>
          
          {/* Pre-Visit Information */}
          {/* <View className="mt-6 bg-blue-50 rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="info" size={18} color="#3b82f6" />
              <Text className="text-blue-800 font-bold font-[Philosopher] ml-2">
                Before Your Visit
              </Text>
            </View>
            <View className="space-y-2">
              <Text className="text-blue-700 font-[Philosopher] text-sm">
                • Arrive 15 minutes early for check-in
              </Text>
              <Text className="text-blue-700 font-[Philosopher] text-sm">
                • Bring a valid ID and payment method
              </Text>
              <Text className="text-blue-700 font-[Philosopher] text-sm">
                • Inform us of any health conditions
              </Text>
              <Text className="text-blue-700 font-[Philosopher] text-sm">
                • Free cancellation up to 24 hours prior
              </Text>
            </View>
          </View> */}
          
          {/* Contact Information */}
          {/* <View className="mt-4 bg-[#F4EDE5] rounded-2xl p-4">
            <Text className="text-[#423120] font-bold font-[Philosopher] mb-2 text-center">
              Need Help?
            </Text>
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity className="flex-row items-center">
                <MaterialIcons name="phone" size={16} color="#423120" />
                <Text className="text-[#423120] font-[Philosopher] ml-1 text-sm">
                  Call Us
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center">
                <MaterialIcons name="chat" size={16} color="#423120" />
                <Text className="text-[#423120] font-[Philosopher] ml-1 text-sm">
                  Live Chat
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center">
                <MaterialIcons name="email" size={16} color="#423120" />
                <Text className="text-[#423120] font-[Philosopher] ml-1 text-sm">
                  Email
                </Text>
              </TouchableOpacity>
            </View>
          </View> */}
        </View>
      </View>
    </Modal>
  );
}