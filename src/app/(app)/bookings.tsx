import React, { useState } from "react";
import { 
  SafeAreaView, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  TextInput,
  RefreshControl
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import ReviewActionsheet from "../components/ReviewActionSheet";

// Hide the navigation header
export const options = {
  headerShown: false,
  title: '', // Remove title
};

// Mock data based on your Prisma schema
const mockAppointments = [
  {
    id: "1",
    appointmentDate: "2024-01-15T14:30:00Z",
    startTime: "14:30",
    endTime: "15:30",
    duration: 60,
    totalPrice: 120.00,
    status: "COMPLETED",
    paymentStatus: "COMPLETED",
    service: {
      name: "Swedish Massage",
      images: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300"],
      category: {
        name: "Massage Therapy",
        color: "#423120"
      }
    },
    staff: {
      firstName: "Emma",
      lastName: "Thompson",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    },
    review: {
      rating: 5,
      comment: "Amazing experience! Emma was very professional."
    }
  },
  {
    id: "2",
    appointmentDate: "2024-01-10T10:00:00Z",
    startTime: "10:00",
    endTime: "11:30",
    duration: 90,
    totalPrice: 85.00,
    status: "COMPLETED",
    paymentStatus: "COMPLETED",
    service: {
      name: "Deep Cleansing Facial",
      images: ["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300"],
      category: {
        name: "Facial Treatment",
        color: "#D7C3A7"
      }
    },
    staff: {
      firstName: "Sarah",
      lastName: "Johnson",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    },
    review: null
  },
  {
    id: "3",
    appointmentDate: "2024-01-05T16:00:00Z",
    startTime: "16:00",
    endTime: "17:00",
    duration: 60,
    totalPrice: 95.00,
    status: "CANCELLED",
    paymentStatus: "REFUNDED",
    cancellationReason: "Personal emergency",
    service: {
      name: "Hot Stone Therapy",
      images: ["https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=300"],
      category: {
        name: "Massage Therapy",
        color: "#423120"
      }
    },
    staff: {
      firstName: "Michael",
      lastName: "Davis",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    },
    review: null
  },
  {
    id: "4",
    appointmentDate: "2023-12-20T13:00:00Z",
    startTime: "13:00",
    endTime: "14:30",
    duration: 90,
    totalPrice: 150.00,
    status: "COMPLETED",
    paymentStatus: "COMPLETED",
    service: {
      name: "Aromatherapy Treatment",
      images: ["https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300"],
      category: {
        name: "Wellness",
        color: "#E0D7CA"
      }
    },
    staff: {
      firstName: "Lisa",
      lastName: "Wilson",
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    },
    review: {
      rating: 4,
      comment: "Very relaxing, will definitely book again!"
    }
  }
];

const statusConfig = {
  COMPLETED: {
    color: "#10B981",
    bgColor: "#D1FAE5",
    text: "Completed",
    icon: "checkmark-circle"
  },
  CANCELLED: {
    color: "#EF4444",
    bgColor: "#FEE2E2",
    text: "Cancelled",
    icon: "close-circle"
  },
  PENDING: {
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    text: "Pending",
    icon: "time"
  },
  CONFIRMED: {
    color: "#3B82F6",
    bgColor: "#DBEAFE",
    text: "Confirmed",
    icon: "checkmark-circle"
  },
  NO_SHOW: {
    color: "#6B7280",
    bgColor: "#F3F4F6",
    text: "No Show",
    icon: "alert-circle"
  }
};

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  
  // Review Actionsheet state
  const [showReviewActionsheet, setShowReviewActionsheet] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Handle write review button press
  const handleWriteReview = (appointment: any) => {
    console.log("Write review clicked for:", appointment.service.name); // Debug log
    setSelectedAppointment(appointment);
    setShowReviewActionsheet(true);
  };

  // Handle closing review actionsheet
  const handleCloseReview = () => {
    console.log("Closing review actionsheet"); // Debug log
    setShowReviewActionsheet(false);
    setSelectedAppointment(null);
  };

  // Handle review submission
  const handleSubmitReview = async (reviewData: {
    rating: number;
    title: string;
    comment: string;
    appointmentId: string;
  }) => {
    try {
      // Here you would make your API call to submit the review
      console.log("Submitting review:", reviewData);
      
      // Example API call:
      // await apiClient.post('/reviews', {
      //   serviceId: selectedAppointment.service.id,
      //   staffId: selectedAppointment.staff.id,
      //   appointmentId: reviewData.appointmentId,
      //   rating: reviewData.rating,
      //   title: reviewData.title,
      //   comment: reviewData.comment
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you could also update the local state or refetch appointments
      console.log("Review submitted successfully!");
      
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error; // Re-throw to show error in the component
    }
  };

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.staff.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.staff.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || appointment.status.toLowerCase() === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? "star" : "star-outline"}
        size={12}
        color="#F59E0B"
      />
    ));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} className="flex-1">
      {/* Header with Back Arrow */}
      <View className="px-6 pt-4 pb-2" style={{ paddingTop: 32, paddingBottom: 24, backgroundColor: "#F4EDE5" }}>
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4 p-2"
          >
            <AntDesign name="arrowleft" size={24} color="#423120" />
          </TouchableOpacity>
          <Text 
            className="text-xl font-bold flex-1" 
            style={{ color: "#423120", fontFamily: "Philosopher" }}
          >
            My Bookings
          </Text>
        </View>
        <Text 
          className="text-sm mb-4" 
          style={{ color: "#968469" }}
        >
          Track your wellness journey
        </Text>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row space-x-3">
            {["all", "completed", "cancelled", "pending"].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                className="px-4 mr-3 py-2 rounded-full"
                style={{
                  backgroundColor: selectedFilter === filter ? "#423120" : "#E0D7CA"
                }}
              >
                <Text
                  className="text-sm font-bold capitalize"
                  style={{
                    color: selectedFilter === filter ? "#FFFFFF" : "#423120",
                    fontFamily: "Philosopher"
                  }}
                >
                  {filter === "all" ? "All" : filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Appointments List */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAppointments.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="calendar-outline" size={64} color="#D7C3A7" />
            <Text
              className="text-xl font-bold mt-4 mb-2"
              style={{ color: "#423120", fontFamily: "Philosopher" }}
            >
              No Appointments Found
            </Text>
            <Text
              className="text-center"
              style={{ color: "#968469" }}
            >
              {searchQuery || selectedFilter !== "all" 
                ? "Try adjusting your search or filter" 
                : "Your appointment history will appear here"}
            </Text>
          </View>
        ) : (
          <View className="py-4 space-y-4">
            {filteredAppointments.map((appointment) => {
              const status = statusConfig[appointment.status as keyof typeof statusConfig];
              
              return (
                <TouchableOpacity
                  key={appointment.id}
                  className="bg-white mb-5 rounded-2xl p-4 shadow-sm border"
                  style={{ borderColor: "#E0D7CA" }}
                  activeOpacity={0.7}
                >
                  {/* Header with Date and Status */}
                  <View className="flex-row justify-between  items-center mb-3">
                    <Text
                      className="text-lg font-bold"
                      style={{ color: "#423120", fontFamily: "Philosopher" }}
                    >
                      {formatDate(appointment.appointmentDate)}
                    </Text>
                    <View
                      className="px-3 py-1 rounded-full flex-row items-center"
                      style={{ backgroundColor: status.bgColor }}
                    >
                      <Ionicons
                        name={status.icon as any}
                        size={12}
                        color={status.color}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        className="text-xs font-bold"
                        style={{ color: status.color }}
                      >
                        {status.text}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row ">
                    {/* Service Image */}
                    <Image
                      source={{ uri: appointment.service.images[0] }}
                      className="w-16 h-16 rounded-xl mr-4"
                    />

                    {/* Content */}
                    <View className="flex-1 ">
                      {/* Service Name and Category */}
                      <Text
                        className="text-base font-bold mb-1"
                        style={{ color: "#423120", fontFamily: "Philosopher" }}
                      >
                        {appointment.service.name}
                      </Text>
                      <Text
                        className="text-sm mb-2"
                        style={{ color: "#968469" }}
                      >
                        {appointment.service.category.name}
                      </Text>

                      {/* Staff and Time */}
                      <View className="flex-row items-center mb-2">
                        <Image
                          source={{ uri: appointment.staff.profileImage }}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <Text
                          className="text-sm"
                          style={{ color: "#423120" }}
                        >
                          {appointment.staff.firstName} {appointment.staff.lastName}
                        </Text>                       
                      </View>

                      {/* Price and Duration */}
                      <View className="flex-row justify-between items-center">
                        <Text
                          className="text-lg font-bold"
                          style={{ color: "#423120", fontFamily: "Philosopher" }}
                        >
                          ${appointment.totalPrice.toFixed(2)}
                        </Text>
                        <Text
                          className="text-sm"
                          style={{ color: "#968469" }}
                        >
                          {appointment.duration} min
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Review Section */}
                  {appointment.review && (
                    <View 
                      className="mt-3 pt-3 border-t"
                      style={{ borderTopColor: "#E0D7CA" }}
                    >
                      <View className="flex-row items-center mb-2">
                        <Text
                          className="text-sm font-bold mr-2"
                          style={{ color: "#423120" }}
                        >
                          Your Review:
                        </Text>
                        <View className="flex-row">
                          {renderStars(appointment.review.rating)}
                        </View>
                      </View>
                      <Text
                        className="text-sm italic"
                        style={{ color: "#968469" }}
                      >
                        "{appointment.review.comment}"
                      </Text>
                    </View>
                  )}

                  {/* Cancellation Reason */}
                  {appointment.status === "CANCELLED" && appointment.cancellationReason && (
                    <View 
                      className="mt-3 pt-3 border-t"
                      style={{ borderTopColor: "#E0D7CA" }}
                    >
                      <Text
                        className="text-sm"
                        style={{ color: "#968469" }}
                      >
                        <Text className="font-bold">Reason: </Text>
                        {appointment.cancellationReason}
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons for Completed Appointments without Reviews */}
                  {appointment.status === "COMPLETED" && !appointment.review && (
                    <View className="mt-3 pt-3 flex-row space-x-3">
                      <TouchableOpacity
                        className="flex-1 mr-3 py-2 rounded-xl border"
                        style={{ borderColor: "#423120" }}
                        onPress={() => handleWriteReview(appointment)}
                      >
                        <Text
                          className="text-center font-bold"
                          style={{ color: "#423120", fontFamily: "Philosopher" }}
                        >
                          Write Review
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 py-2 rounded-xl"
                        style={{ backgroundColor: "#423120" }}
                        onPress={() => router.push('/service')}
                      >
                        <Text
                          className="text-center font-bold text-white"
                          style={{ fontFamily: "Philosopher" }}
                        >
                          Book Again
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ backgroundColor: "#423120" }}
        onPress={() => router.push('/service')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Review Actionsheet Component */}
      {selectedAppointment && (
        <ReviewActionsheet
          isOpen={showReviewActionsheet}
          onClose={handleCloseReview}
          appointment={selectedAppointment}
          onSubmitReview={handleSubmitReview}
        />
      )}
    </SafeAreaView>
  );
}