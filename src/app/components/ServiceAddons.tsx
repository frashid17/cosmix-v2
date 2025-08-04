// components/ServiceAddons.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ServiceAddonsProps {
  selectedAddons: any[];
  setSelectedAddons: (addons: any[]) => void;
}

export default function ServiceAddons({ selectedAddons, setSelectedAddons }: ServiceAddonsProps) {
  const addons = [
    {
      id: 1,
      name: "Aromatherapy Enhancement",
      description: "Premium essential oils blend for deeper relaxation and stress relief",
      price: 20,
      duration: 15,
      icon: "🌿",
      category: "Enhancement",
      popular: true
    },
    {
      id: 2,
      name: "Hot Towel Treatment",
      description: "Luxurious hot towel service for ultimate comfort and warmth",
      price: 15,
      duration: 10,
      icon: "🔥",
      category: "Comfort",
      popular: false
    },
    {
      id: 3,
      name: "Scalp Massage Add-on",
      description: "Relaxing scalp massage to release tension and promote circulation",
      price: 25,
      duration: 20,
      icon: "💆‍♀️",
      category: "Massage",
      popular: true
    },
    {
      id: 4,
      name: "CBD Oil Treatment",
      description: "Therapeutic CBD-infused oils for enhanced pain relief and relaxation",
      price: 35,
      duration: 0,
      icon: "🌱",
      category: "Therapeutic",
      popular: false
    },
    {
      id: 5,
      name: "Reflexology Session",
      description: "Targeted foot reflexology to stimulate healing throughout the body",
      price: 30,
      duration: 25,
      icon: "🦶",
      category: "Wellness",
      popular: false
    }
  ];

  const toggleAddon = (addon: any) => {
    const isSelected = selectedAddons.some((item: any) => item.id === addon.id);
    if (isSelected) {
      setSelectedAddons(selectedAddons.filter((item: any) => item.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  return (
    <View>
      <Text className="text-[#968469] font-[Philosopher] mb-4 text-center">
        Enhance your experience with our premium add-on services
      </Text>
      
      {addons.map((addon) => {
        const isSelected = selectedAddons.some((item: any) => item.id === addon.id);
        
        return (
          <TouchableOpacity
            key={addon.id}
            onPress={() => toggleAddon(addon)}
            className={`mb-4 rounded-2xl border-2 overflow-hidden ${
              isSelected 
                ? 'border-[#423120] bg-[#423120] shadow-lg' 
                : 'border-[#E0D7CA] bg-white shadow-sm'
            }`}
          >
            <View className="p-4">
              <View className="flex-row items-start">
                <View className="mr-4">
                  <Text className="text-3xl">{addon.icon}</Text>
                  {addon.popular && !isSelected && (
                    <View className="absolute -top-1 -right-1 bg-orange-500 w-4 h-4 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">!</Text>
                    </View>
                  )}
                </View>
                
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text 
                      className={`font-bold font-[Philosopher] text-lg ${
                        isSelected ? 'text-white' : 'text-[#423120]'
                      }`}
                    >
                      {addon.name}
                    </Text>
                    <View className="flex-row">
                      <View 
                        className={`px-2 py-1 rounded-full ${
                          isSelected ? 'bg-white/20' : 'bg-[#F4EDE5]'
                        }`}
                      >
                        <Text 
                          className={`text-xs font-[Philosopher] ${
                            isSelected ? 'text-white' : 'text-[#423120]'
                          }`}
                        >
                          {addon.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text 
                    className={`font-[Philosopher] text-sm mb-3 leading-5 ${
                      isSelected ? 'text-[#E0D7CA]' : 'text-[#968469]'
                    }`}
                  >
                    {addon.description}
                  </Text>
                  
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text 
                        className={`font-bold font-[Philosopher] text-lg ${
                          isSelected ? 'text-white' : 'text-[#423120]'
                        }`}
                      >
                        +${addon.price}
                      </Text>
                      {addon.duration > 0 && (
                        <Text 
                          className={`font-[Philosopher] text-sm ml-3 ${
                            isSelected ? 'text-[#D7C3A7]' : 'text-[#968469]'
                          }`}
                        >
                          +{addon.duration} min
                        </Text>
                      )}
                    </View>
                    
                    <View 
                      className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                        isSelected 
                          ? 'bg-white border-white' 
                          : 'border-[#E0D7CA]'
                      }`}
                    >
                      {isSelected && (
                        <AntDesign name="check" size={16} color="#423120" />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
      
      {selectedAddons.length === 0 && (
        <View className="bg-[#F4EDE5] rounded-2xl p-6 items-center mt-4">
          <MaterialIcons name="add-circle-outline" size={48} color="#968469" />
          <Text className="text-[#423120] font-bold font-[Philosopher] mt-3 text-center">
            No Add-ons Selected
          </Text>
          <Text className="text-[#968469] font-[Philosopher] text-center mt-1">
            Select add-ons to enhance your spa experience
          </Text>
        </View>
      )}
    </View>
  );
}