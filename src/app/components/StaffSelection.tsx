// components/StaffSelection.tsx - Staff selection component
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import StaffCard from './StaffCard';

interface StaffSelectionProps {
  selectedStaff: any;
  setSelectedStaff: (staff: any) => void;
  selectedService: any;
}

export default function StaffSelection({ selectedStaff, setSelectedStaff, selectedService }: StaffSelectionProps) {
  const [filterBy, setFilterBy] = useState('all'); // all, available, rating, experience

  const staff = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Massage Therapist",
      specialities: ["Swedish Massage", "Deep Tissue", "Hot Stone"],
      experience: 8,
      rating: 4.9,
      reviewCount: 256,
      bio: "Sarah is our most experienced massage therapist with specialized training in Swedish and deep tissue techniques. She has a gentle yet effective approach that helps clients achieve deep relaxation and pain relief.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
      certifications: ["Licensed Massage Therapist", "Hot Stone Certified", "Aromatherapy Specialist"],
      languages: ["English", "Spanish"],
      availability: {
        today: true,
        thisWeek: true,
        nextWeek: true
      },
      personalityTraits: ["Gentle", "Professional", "Experienced"],
      clientReviews: [
        { text: "Amazing technique and very relaxing", rating: 5 },
        { text: "Best massage I've ever had", rating: 5 },
        { text: "Sarah is incredible, very skilled", rating: 5 }
      ]
    },
    {
      id: 2,
      name: "Emma Wilson",
      title: "Facial & Skincare Specialist",
      specialities: ["Deep Cleanse Facial", "Anti-Aging", "Acne Treatment"],
      experience: 6,
      rating: 4.8,
      reviewCount: 189,
      bio: "Emma specializes in advanced facial treatments and has extensive knowledge of skincare. She provides personalized treatments based on individual skin analysis and needs.",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face",
      certifications: ["Esthetician License", "Chemical Peel Certified", "Microdermabrasion Specialist"],
      languages: ["English", "French"],
      availability: {
        today: true,
        thisWeek: true,
        nextWeek: true
      },
      pricing: {
        premium: 10,
        reason: "Skincare Specialist"
      },
      personalityTraits: ["Detail-oriented", "Knowledgeable", "Caring"],
      clientReviews: [
        { text: "My skin has never looked better", rating: 5 },
        { text: "Very knowledgeable about skincare", rating: 5 },
        { text: "Professional and gentle", rating: 4 }
      ]
    },
    {
      id: 3,
      name: "Maria Garcia",
      title: "Wellness & Body Treatment Expert",
      specialities: ["Body Wraps", "Hot Stone", "Aromatherapy"],
      experience: 10,
      rating: 4.9,
      reviewCount: 342,
      bio: "Maria brings a holistic approach to wellness with over 10 years of experience. She specializes in body treatments and creating a serene, healing environment for every client.",
      image: "https://images.unsplash.com/photo-1594824489509-2ca0abb8deef?w=300&h=300&fit=crop&crop=face",
      certifications: ["Master Therapist", "Aromatherapy Certified", "Reiki Level 2"],
      languages: ["English", "Spanish", "Portuguese"],
      availability: {
        today: false,
        thisWeek: true,
        nextWeek: true
      },
      pricing: {
        premium: 20,
        reason: "Master Therapist"
      },
      personalityTraits: ["Holistic", "Intuitive", "Healing"],
      clientReviews: [
        { text: "Truly transformative experience", rating: 5 },
        { text: "Maria has healing hands", rating: 5 },
        { text: "Most relaxing treatment ever", rating: 5 }
      ]
    },
    {
      id: 4,
      name: "Lisa Chen",
      title: "Therapeutic Massage Specialist",
      specialities: ["Deep Tissue", "Sports Massage", "Injury Recovery"],
      experience: 7,
      rating: 4.7,
      reviewCount: 134,
      bio: "Lisa focuses on therapeutic and sports massage with expertise in injury recovery and pain management. Perfect for those seeking targeted treatment for specific issues.",
      image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=300&h=300&fit=crop&crop=face",
      certifications: ["Therapeutic Massage License", "Sports Massage Certified", "Trigger Point Therapy"],
      languages: ["English", "Mandarin"],
      availability: {
        today: true,
        thisWeek: true,
        nextWeek: false
      },
      pricing: {
        premium: 0,
        reason: null
      },
      personalityTraits: ["Focused", "Therapeutic", "Results-driven"],
      clientReviews: [
        { text: "Great for working out knots", rating: 5 },
        { text: "Very focused on problem areas", rating: 4 },
        { text: "Helped with my back pain", rating: 5 }
      ]
    },
    {
      id: 5,
      name: "Jennifer Adams",
      title: "Relaxation & Wellness Therapist",
      specialities: ["Swedish Massage", "Prenatal", "Couples Massage"],
      experience: 4,
      rating: 4.6,
      reviewCount: 98,
      bio: "Jennifer creates a peaceful, nurturing environment perfect for relaxation and stress relief. She specializes in gentle techniques and prenatal care.",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=300&fit=crop&crop=face",
      certifications: ["Licensed Massage Therapist", "Prenatal Massage Certified"],
      languages: ["English"],
      availability: {
        today: true,
        thisWeek: true,
        nextWeek: true
      },
      pricing: {
        premium: 0,
        reason: null
      },
      personalityTraits: ["Nurturing", "Gentle", "Calming"],
      clientReviews: [
        { text: "So relaxing and peaceful", rating: 5 },
        { text: "Perfect for stress relief", rating: 4 },
        { text: "Very gentle touch", rating: 5 }
      ]
    }
  ];

  const filteredStaff = staff.filter(member => {
    switch (filterBy) {
      case 'available':
        return member.availability.today;
      case 'rating':
        return member.rating >= 4.8;
      case 'experience':
        return member.experience >= 7;
      default:
        return true;
    }
  });

  return (
    <View className="px-6">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-[#423120] text-2xl font-bold font-[Philosopher] mb-2">
          Choose Your Therapist
        </Text>
        <Text className="text-[#968469] font-[Philosopher] leading-5">
          Select your preferred therapist for <Text className="font-bold text-[#423120]">{selectedService?.name}</Text>
        </Text>
      </View>

      {/* Filter Options */}
      <View className="mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'all', name: 'All Therapists', icon: 'people' },
            { id: 'available', name: 'Available Today', icon: 'schedule' },
            { id: 'rating', name: 'Top Rated', icon: 'star' },
            { id: 'experience', name: 'Most Experienced', icon: 'trending-up' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setFilterBy(filter.id)}
              className={`mr-3 px-4 py-2 rounded-full flex-row items-center border ${
                filterBy === filter.id 
                  ? 'bg-[#423120] border-[#423120]' 
                  : 'bg-white border-[#E0D7CA]'
              }`}
            >
              <MaterialIcons 
                name={filter.icon as any} 
                size={16} 
                color={filterBy === filter.id ? 'white' : '#968469'}
              />
              <Text 
                className={`ml-2 font-[Philosopher] ${
                  filterBy === filter.id 
                    ? 'text-white font-bold' 
                    : 'text-[#423120]'
                }`}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Staff List */}
      {filteredStaff.map((member) => (
        <StaffCard
          key={member.id}
          staff={member}
          isSelected={selectedStaff?.id === member.id}
          onSelect={() => setSelectedStaff(member)}
          selectedService={selectedService}
        />
      ))}

      {/* No Staff Found */}
      {filteredStaff.length === 0 && (
        <View className="items-center py-12">
          <View className="bg-[#F4EDE5] w-20 h-20 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="person-search" size={40} color="#968469" />
          </View>
          <Text className="text-[#423120] font-bold font-[Philosopher] text-lg mb-2">
            No Therapists Found
          </Text>
          <Text className="text-[#968469] font-[Philosopher] text-center">
            Try adjusting your filter criteria
          </Text>
          <TouchableOpacity 
            onPress={() => setFilterBy('all')}
            className="bg-[#423120] px-6 py-2 rounded-full mt-4"
          >
            <Text className="text-white font-[Philosopher]">Show All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}