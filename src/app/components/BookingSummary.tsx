// components/BookingSummary.tsx
import React, { useState } from 'react';
import { 
  ScrollView,
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  Image
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import ServiceAddons from './ServiceAddons';

interface BookingSummaryProps {
  selectedService: any;
  selectedStaff: any;
  selectedDate: string;
  selectedTime: string;
  selectedAddons: any[];
  setSelectedAddons: (addons: any[]) => void;
  notes: string;
  setNotes: (notes: string) => void;
}

export default function BookingSummary({ 
  selectedService, 
  selectedStaff, 
  selectedDate, 
  selectedTime, 
  selectedAddons, 
  setSelectedAddons, 
  notes, 
  setNotes 
}: BookingSummaryProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'mobile'>('card');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isPromoValid, setIsPromoValid] = useState<boolean | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showAddons, setShowAddons] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    
    const period = endHours >= 12 ? 'PM' : 'AM';
    const displayHours = endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours;
    return `${displayHours}:${endMins.toString().padStart(2, '0')} ${period}`;
  };

  const calculatePricing = () => {
    const servicePrice = selectedService?.price || 0;
    const staffPremium = selectedStaff?.pricing?.premium || 0;
    const addonsTotal = selectedAddons.reduce((sum: number, addon: any) => sum + addon.price, 0);
    const subtotal = servicePrice + staffPremium + addonsTotal;
    const discount = (subtotal * promoDiscount) / 100;

    const taxableAmount = subtotal - discount;
    const total = taxableAmount 

    return {
      servicePrice,
      staffPremium,
      addonsTotal,
      subtotal,
      discount,
      total,
      savings: (selectedService?.originalPrice || servicePrice) - servicePrice + discount
    };
  };

  const pricing = calculatePricing();
  const totalDuration = (selectedService?.duration || 0) + 
                       selectedAddons.reduce((sum: number, addon: any) => sum + addon.duration, 0);

  const validatePromoCode = async (code: string) => {
    if (!code.trim()) {
      setIsPromoValid(null);
      setPromoDiscount(0);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      const validCodes = {
        'FIRST20': 20,
        'RELAX10': 10,
        'WEEKEND15': 15,
        'NEWCLIENT25': 25
      };

      if (validCodes[code.toUpperCase() as keyof typeof validCodes]) {
        setIsPromoValid(true);
        setPromoDiscount(validCodes[code.toUpperCase() as keyof typeof validCodes]);
      } else {
        setIsPromoValid(false);
        setPromoDiscount(0);
      }
    }, 500);
  };

  return (
    <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-[#423120] text-2xl font-bold font-[Philosopher] mb-2">
          Booking Summary
        </Text>
        <Text className="text-[#968469] font-[Philosopher] leading-5">
          Review your appointment details and complete your booking
        </Text>
      </View>

      {/* Main Booking Card */}
      <View className="bg-white rounded-3xl shadow-lg border border-[#F4EDE5] mb-6 overflow-hidden">
        {/* Service Header */}
        <LinearGradient
          colors={['#F4EDE5', '#E0D7CA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-6"
        >
          <View className="flex-row items-center">
            <Image 
              source={{ uri: selectedService?.images?.[0] }}
              className="w-20 h-20 rounded-2xl mr-4"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-[#423120] text-xl font-bold font-[Philosopher] mb-1">
                {selectedService?.name}
              </Text>
              <Text className="text-[#968469] font-[Philosopher] mb-1">
                {selectedService?.categoryName}
              </Text>
              <View className="flex-row items-center">
                <MaterialIcons name="schedule" size={16} color="#968469" />
                <Text className="text-[#968469] font-[Philosopher] ml-1">
                  {totalDuration} minutes
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[#423120] text-2xl font-bold font-[Philosopher]">
                ${selectedService?.price}
              </Text>
              {selectedService?.originalPrice && selectedService.originalPrice > selectedService.price && (
                <Text className="text-[#968469] text-sm font-[Philosopher] line-through">
                  ${selectedService.originalPrice}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Appointment Details */}
        <View className="p-6">
          {/* Date & Time */}
          <View className="mb-6">
            <Text className="text-[#423120] font-bold font-[Philosopher] mb-3">
              📅 Appointment Details
            </Text>
            <View className="bg-[#F4EDE5] rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[#423120] font-bold font-[Philosopher]">
                  {formatDate(selectedDate)}
                </Text>
                <View className="bg-[#423120] px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold font-[Philosopher]">
                    CONFIRMED
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="access-time" size={18} color="#968469" />
                <Text className="text-[#968469] font-[Philosopher] ml-2">
                  {formatTime(selectedTime)} - {calculateEndTime(selectedTime, totalDuration)}
                </Text>
              </View>
            </View>
          </View>

          {/* Therapist Details */}
          <View className="mb-6">
            <Text className="text-[#423120] font-bold font-[Philosopher] mb-3">
              👩‍⚕️ Your Therapist
            </Text>
            <View className="flex-row items-center bg-[#F4EDE5] rounded-2xl p-4">
              <Image 
                source={{ uri: selectedStaff?.image }}
                className="w-16 h-16 rounded-full mr-4"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-[#423120] font-bold font-[Philosopher]">
                  {selectedStaff?.name}
                </Text>
                <Text className="text-[#968469] font-[Philosopher] mb-1">
                  {selectedStaff?.title}
                </Text>
                <View className="flex-row items-center">
                  <AntDesign name="star" size={14} color="#FFD700" />
                  <Text className="text-[#968469] font-[Philosopher] ml-1">
                    {selectedStaff?.rating} ({selectedStaff?.reviewCount} reviews)
                  </Text>
                </View>
              </View>
              {selectedStaff?.pricing?.premium > 0 && (
                <View className="bg-amber-100 px-3 py-1 rounded-full">
                  <Text className="text-amber-800 text-xs font-[Philosopher]">
                    +${selectedStaff.pricing.premium}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Service Add-ons */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#423120] font-bold font-[Philosopher]">
                ✨ Enhance Your Experience
              </Text>
              <TouchableOpacity 
                onPress={() => setShowAddons(!showAddons)}
                className="flex-row items-center"
              >
                <Text className="text-[#968469] font-[Philosopher] mr-1">
                  {selectedAddons.length} selected
                </Text>
                <AntDesign 
                  name={showAddons ? "up" : "down"} 
                  size={16} 
                  color="#968469" 
                />
              </TouchableOpacity>
            </View>
            
            {showAddons && (
              <ServiceAddons 
                selectedAddons={selectedAddons}
                setSelectedAddons={setSelectedAddons}
              />
            )}
            
            {selectedAddons.length > 0 && (
              <View className="bg-green-50 rounded-2xl p-4 mt-3">
                <Text className="text-green-800 font-bold font-[Philosopher] mb-2">
                  Selected Add-ons:
                </Text>
                {selectedAddons.map((addon: any, index: number) => (
                  <View key={index} className="flex-row items-center justify-between mb-1">
                    <Text className="text-green-700 font-[Philosopher]">
                      • {addon.name} (+{addon.duration}min)
                    </Text>
                    <Text className="text-green-800 font-bold font-[Philosopher]">
                      +${addon.price}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

        </View>
      </View>

      {/* Pricing Breakdown */}
      <View className="bg-white rounded-3xl shadow-lg border border-[#F4EDE5] mb-6 p-6">
        <Text className="text-[#423120] font-bold font-[Philosopher] text-lg mb-4">
          💰 Pricing Breakdown
        </Text>
        
        <View className="space-y-3">
          <View className="flex-row justify-between">
            <Text className="text-[#968469] font-[Philosopher]">
              {selectedService?.name}
            </Text>
            <Text className="text-[#423120] font-[Philosopher]">
              ${pricing.servicePrice.toFixed(2)}
            </Text>
          </View>
          
          {pricing.staffPremium > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-[#968469] font-[Philosopher]">
                {selectedStaff?.pricing?.reason}
              </Text>
              <Text className="text-[#423120] font-[Philosopher]">
                +${pricing.staffPremium.toFixed(2)}
              </Text>
            </View>
          )}
          
          {selectedAddons.map((addon: any, index: number) => (
            <View key={index} className="flex-row justify-between">
              <Text className="text-[#968469] font-[Philosopher]">
                {addon.name}
              </Text>
              <Text className="text-[#423120] font-[Philosopher]">
                +${addon.price.toFixed(2)}
              </Text>
            </View>
          ))}
          
          <View className="border-t border-[#F4EDE5] pt-3">
            <View className="flex-row justify-between">
              <Text className="text-[#968469] font-[Philosopher]">
                Subtotal
              </Text>
              <Text className="text-[#423120] font-bold font-[Philosopher]">
                ${pricing.subtotal.toFixed(2)}
              </Text>
            </View>
          </View>
          
          {/* Promo Code Section */}

          
          {pricing.discount > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-green-600 font-[Philosopher]">
                Discount ({promoDiscount}%)
              </Text>
              <Text className="text-green-600 font-[Philosopher]">
                -${pricing.discount.toFixed(2)}
              </Text>
            </View>
          )}

          
          <View className="border-t-2 border-[#423120] pt-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-[#423120] font-bold font-[Philosopher] text-xl">
                Total Amount
              </Text>
              <Text className="text-[#423120] font-bold font-[Philosopher] text-2xl">
                ${pricing.total.toFixed(2)}
              </Text>
            </View>
          </View>
          
          {pricing.savings > 0 && (
            <View className="bg-green-100 rounded-xl p-3 mt-3">
              <Text className="text-green-800 font-bold font-[Philosopher] text-center">
                🎉 You're saving ${pricing.savings.toFixed(2)} today!
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Loyalty Points Preview
      <View className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 mb-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full items-center justify-center mr-4">
              <AntDesign name="star" size={24} color="white" />
            </View>
            <View>
              <Text className="text-purple-800 font-bold font-[Philosopher] text-lg">
                Earn Loyalty Points
              </Text>
              <Text className="text-purple-600 font-[Philosopher]">
                You'll earn points with this booking
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-purple-800 font-bold font-[Philosopher] text-2xl">
              +{Math.floor(pricing.total / 5)}
            </Text>
            <Text className="text-purple-600 font-[Philosopher] text-sm">
              points
            </Text>
          </View>
        </View>
        
        <View className="mt-4 bg-white/50 rounded-xl p-3">
          <Text className="text-purple-700 font-[Philosopher] text-sm text-center">
            💡 Tip: Collect 500 points for a free 30-minute relaxation session!
          </Text>
        </View>
      </View> */}
    </ScrollView>
  );
}