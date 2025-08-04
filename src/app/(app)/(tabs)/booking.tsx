// BookingPage.tsx - Main booking component
import React, { useState } from "react";
import { 
  SafeAreaView, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Alert
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from 'expo-linear-gradient';

// Import components
import ServiceSelection from '../../components/ServiceSelection';
import StaffSelection from '../../components/StaffSelection';
import DateTimeSelection from '../../components/DateTimeSelection';
import BookingSummary from '../../components/BookingSummary';
import BottomNavigation from '../../components/BottomNavigation';
import BookingConfirmation from '../../components/BookingConfirmationModal';
import LoadingOverlay from '../../components/LoadingOverlay';
import BookingSteps from '../../components/BookingSteps';

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingError, setBookingError] = useState<string>("");

  const steps = ['Service', 'Staff', 'Date & Time', 'Summary'];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedService !== null;
      case 1: return selectedStaff !== null;
      case 2: return Boolean(selectedDate && selectedTime);
      case 3: return true;
      default: return false;
    }
  };

  const resetBooking = () => {
    setCurrentStep(0);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedAddons([]);
    setNotes("");
    setBookingError("");
  };

  const handleBookingSubmit = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setShowConfirmation(true);
    } catch (error) {
      setBookingError("Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    const servicePrice = selectedService?.price || 0;
    const staffPremium = selectedStaff?.pricing?.premium || 0;
    const addonsTotal = selectedAddons.reduce((sum: number, addon: any) => sum + addon.price, 0);
    const subtotal = servicePrice + staffPremium + addonsTotal;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleNavigateToHistory = () => {
    // Handle navigation to history however your app does it
    // For example, if using tab navigation:
    // navigation.navigate('History');
    console.log('Navigate to history');
    Alert.alert('Navigation', 'Would navigate to appointments history');
  };

  const handleNavigateToHome = () => {
    // Handle navigation to home however your app does it
    // For example:
    // navigation.navigate('Home');
    console.log('Navigate to home');
    Alert.alert('Navigation', 'Would navigate to home screen');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#F4EDE5" />
      
      {/* Header */}
      <Header 
        currentStep={currentStep} 
        steps={steps} 
        onBack={currentStep > 0 ? prevStep : undefined}
        onReset={resetBooking}
      />
      
      {/* Progress Steps */}
      <BookingSteps currentStep={currentStep} steps={steps} />
      
      {/* Main Content */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {currentStep === 0 && (
          <ServiceSelection 
            selectedService={selectedService} 
            setSelectedService={setSelectedService} 
          />
        )}
        {currentStep === 1 && (
          <StaffSelection 
            selectedStaff={selectedStaff} 
            setSelectedStaff={setSelectedStaff}
            selectedService={selectedService}
          />
        )}
        {currentStep === 2 && (
          <DateTimeSelection 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            selectedStaff={selectedStaff}
          />
        )}
        {currentStep === 3 && (
          <BookingSummary 
            selectedService={selectedService}
            selectedStaff={selectedStaff}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedAddons={selectedAddons}
            setSelectedAddons={setSelectedAddons}
            notes={notes}
            setNotes={setNotes}
          />
        )}
      </ScrollView>

      {/* Bottom Navigation */}
{/* Add this back */}
<BottomNavigation
  currentStep={currentStep}
  steps={steps}
  canProceed={canProceed()}
  onNext={currentStep === steps.length - 1 ? handleBookingSubmit : nextStep}
  onBack={currentStep > 0 ? prevStep : undefined}
  isLoading={isLoading}
/>

      {/* Confirmation Modal */}
      <BookingConfirmation
        isVisible={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          resetBooking();
        }}
        onNavigateToHistory={handleNavigateToHistory}
        onNavigateToHome={handleNavigateToHome}
        bookingDetails={{
          service: selectedService?.name,
          staff: selectedStaff?.name,
          date: selectedDate,
          time: selectedTime,
          total: calculateTotal().total
        }}
      />

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Error Display */}
      {bookingError && (
        <View className="absolute bottom-20 left-6 right-6">
          <View className="bg-red-100 border border-red-400 rounded-xl p-4">
            <View className="flex-row items-center">
              <MaterialIcons name="error" size={20} color="#dc2626" />
              <Text className="text-red-800 font-[Philosopher] ml-2 flex-1">
                {bookingError}
              </Text>
              <TouchableOpacity onPress={() => setBookingError("")}>
                <AntDesign name="close" size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Header Component
function Header({ currentStep, steps, onBack, onReset }: any) {
  return (
    <View className="bg-[#F4EDE5]">
      <LinearGradient
        colors={['#F4EDE5', '#E0D7CA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row mt-8 items-center flex-1">
            {onBack && (
              <TouchableOpacity 
                onPress={onBack} 
                className="mr-4 p-2 rounded-full bg-white/20"
                activeOpacity={0.7}
              >
                <AntDesign name="arrowleft" size={24} color="#423120" />
              </TouchableOpacity>
            )}
            <View className="flex-1">
              <Text className="text-[#423120] text-xl font-bold font-[Philosopher]">
                Book Appointment
              </Text>
              <Text className="text-[#968469] font-[Philosopher]">
                Step {currentStep + 1} of {steps.length} - {steps[currentStep]}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={onReset}
            className="p-2 rounded-full bg-white/20"
            activeOpacity={0.7}
          >
            <MaterialIcons name="refresh" size={24} color="#423120" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}