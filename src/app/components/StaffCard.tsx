// components/StaffCard.tsx - Individual staff card component
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface StaffCardProps {
  staff: {
    id: number;
    name: string;
    title: string;
    specialities: string[];
    experience: number;
    rating: number;
    reviewCount: number;
    bio: string;
    image: string;
    certifications: string[];
    languages: string[];
    availability: {
      today: boolean;
      thisWeek: boolean;
      nextWeek: boolean;
    };
    personalityTraits: string[];
    clientReviews: Array<{
      text: string;
      rating: number;
    }>;
  };
  isSelected: boolean;
  onSelect: () => void;
  selectedService: any;
}

export default function StaffCard({ staff, isSelected, onSelect, selectedService }: StaffCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`mb-6 rounded-3xl overflow-hidden shadow-lg ${
        isSelected 
          ? 'border-3 border-[#423120] shadow-xl' 
          : 'border border-[#E0D7CA] shadow-md'
      }`}
      activeOpacity={0.9}
    >
      <View className="bg-white">
        {/* Staff Header */}
        <View className="p-6 pb-4">
          <View className="flex-row items-center">
            <View className="relative">
              <Image 
                source={{ uri: staff.image }}
                className="w-24 h-24 rounded-full border-2 border-[#E0D7CA]"
                resizeMode="cover"
              />
              {staff.availability.today && (
                <View className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                  <MaterialIcons name="check" size={12} color="white" />
                </View>
              )}
              {isSelected && (
                <View className="absolute -top-2 -right-2 bg-[#423120] w-8 h-8 rounded-full items-center justify-center">
                  <AntDesign name="check" size={16} color="white" />
                </View>
              )}
            </View>
            
            <View className="flex-1 ml-4">
              <Text className="text-[#423120] font-bold font-[Philosopher] text-lg">
                {staff.name}
              </Text>
              <Text className="text-[#968469] font-[Philosopher] mb-1">
                {staff.title}
              </Text>
              <Text className="text-[#968469] font-[Philosopher] text-sm">
                {staff.experience}+ years experience
              </Text>
              
              {/* Rating & Reviews */}
              <View className="flex-row items-center mt-2">
                <View className="flex-row items-center mr-4">
                  <AntDesign name="star" size={14} color="#FFD700" />
                  <Text className="text-[#423120] font-bold font-[Philosopher] ml-1">
                    {staff.rating}
                  </Text>
                  <Text className="text-[#968469] font-[Philosopher] ml-1 text-sm">
                    ({staff.reviewCount})
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Specialities */}
        <View className="px-6 pb-4">
          <Text className="text-[#423120] font-bold font-[Philosopher] mb-2">
            Specialties:
          </Text>
          <View className="flex-row flex-wrap">
            {staff.specialities.map((specialty: string, index: number) => {
              const isRelevant = selectedService && specialty.toLowerCase().includes(selectedService.name.toLowerCase().split(' ')[0]);
              return (
                <View 
                  key={index} 
                  className={`mr-2 mb-2 px-3 py-1 rounded-full ${
                    isRelevant ? 'bg-[#423120]' : 'bg-[#F4EDE5]'
                  }`}
                >
                  <Text 
                    className={`text-xs font-[Philosopher] ${
                      isRelevant ? 'text-white' : 'text-[#423120]'
                    }`}
                  >
                    {specialty}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bio */}
        <View className="px-6 pb-4">
          <Text className="text-[#968469] font-[Philosopher] text-sm leading-5">
            {staff.bio}
          </Text>
        </View>

        {/* Availability Status */}
        <View className="px-6 pb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons 
                name="schedule" 
                size={16} 
                color={staff.availability.today ? '#10b981' : '#f59e0b'} 
              />
              <Text 
                className={`ml-2 font-[Philosopher] text-sm ${
                  staff.availability.today ? 'text-green-600' : 'text-amber-600'
                }`}
              >
                {staff.availability.today ? 'Available Today' : 'Available This Week'}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => setShowDetails(!showDetails)}
              className="flex-row items-center"
            >
              <Text className="text-[#423120] font-[Philosopher] text-sm mr-1">
                {showDetails ? 'Less Info' : 'More Info'}
              </Text>
              <AntDesign 
                name={showDetails ? "up" : "down"} 
                size={12} 
                color="#423120" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Expandable Details */}
        {showDetails && (
          <View className="px-6 pb-6 pt-2 border-t border-[#F4EDE5]">
            {/* Languages */}
            <View className="mb-4">
              <Text className="text-[#423120] font-bold font-[Philosopher] mb-2">
                Languages:
              </Text>
              <View className="flex-row flex-wrap">
                {staff.languages.map((language: string, index: number) => (
                  <View key={index} className="bg-[#E0D7CA] px-3 py-1 rounded-full mr-2 mb-1">
                    <Text className="text-[#423120] text-xs font-[Philosopher]">
                      {language}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Personality Traits */}
            <View className="mb-4">
              <Text className="text-[#423120] font-bold font-[Philosopher] mb-2">
                Approach:
              </Text>
              <View className="flex-row flex-wrap">
                {staff.personalityTraits.map((trait: string, index: number) => (
                  <View key={index} className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-1">
                    <Text className="text-blue-800 text-xs font-[Philosopher]">
                      {trait}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Reviews */}
            <View>
              <Text className="text-[#423120] font-bold font-[Philosopher] mb-2">
                Recent Reviews:
              </Text>
              {staff.clientReviews.slice(0, 2).map((review: any, index: number) => (
                <View key={index} className="bg-[#F4EDE5] p-3 rounded-xl mb-2">
                  <View className="flex-row items-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <AntDesign 
                        key={i}
                        name="star" 
                        size={12} 
                        color={i < review.rating ? "#FFD700" : "#E0D7CA"} 
                      />
                    ))}
                  </View>
                  <Text className="text-[#423120] font-[Philosopher] text-sm">
                    "{review.text}"
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}