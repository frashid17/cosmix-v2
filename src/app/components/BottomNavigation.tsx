// components/BottomNavigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

interface BottomNavigationProps {
  currentStep: number;
  steps: string[];
  canProceed: boolean;
  onNext: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function BottomNavigation({ 
  currentStep, 
  steps, 
  canProceed, 
  onNext, 
  onBack, 
  isLoading 
}: BottomNavigationProps) {
  // Debug: Log props to see what's being passed
  console.log('BottomNavigation props:', { currentStep, canProceed, isLoading });

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#F4EDE5',
      paddingHorizontal: 24,
      paddingVertical: 16,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4
    }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            disabled={isLoading}
            style={{
              flex: 1,
              backgroundColor: '#F4EDE5',
              paddingVertical: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#E0D7CA'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <AntDesign name="arrowleft" size={18} color="#423120" />
              <Text style={{ 
                color: '#423120', 
                fontWeight: 'bold', 
                marginLeft: 8,
                fontFamily: 'Philosopher'
              }}>
                Back
              </Text>
            </View>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={onNext}
          disabled={!canProceed || isLoading}
          style={{
            flex: 1,
            paddingVertical: 16,
            borderRadius: 16,
            backgroundColor: (canProceed && !isLoading) ? '#423120' : '#968469',
            shadowOffset: (canProceed && !isLoading) ? { width: 0, height: 2 } : undefined,
            shadowOpacity: (canProceed && !isLoading) ? 0.2 : undefined,
            shadowRadius: (canProceed && !isLoading) ? 4 : undefined,
            elevation: (canProceed && !isLoading) ? 2 : undefined
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  marginLeft: 8,
                  fontFamily: 'Philosopher'
                }}>
                  Processing...
                </Text>
              </>
            ) : (
              <>
                <Text style={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontFamily: 'Philosopher'
                }}>
                  {currentStep === steps.length - 1 ? 'Confirm Booking' : 'Continue'}
                </Text>
                <AntDesign 
                  name={currentStep === steps.length - 1 ? "checkcircle" : "arrowright"} 
                  size={18} 
                  color="white" 
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      {!canProceed && !isLoading && (
        <Text style={{ 
          color: '#968469', 
          textAlign: 'center', 
          fontSize: 14, 
          marginTop: 8,
          fontFamily: 'Philosopher'
        }}>
          {currentStep === steps.length - 1 
            ? 'Please accept terms and conditions to proceed'
            : 'Complete all required fields to continue'
          }
        </Text>
      )}
    </View>
  );
}