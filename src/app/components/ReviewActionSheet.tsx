import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height: screenHeight } = Dimensions.get('window');

interface Appointment {
  id: string;
  service: {
    name: string;
    images: string[];
    category: {
      name: string;
    };
  };
  staff: {
    firstName: string;
    lastName: string;
    profileImage: string;
  };
  appointmentDate: string;
  totalPrice: number;
}

interface ReviewActionsheetProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSubmitReview: (reviewData: {
    rating: number;
    title: string;
    comment: string;
    appointmentId: string;
  }) => void;
}

export default function ReviewActionsheet({
  isOpen,
  onClose,
  appointment,
  onSubmitReview,
}: ReviewActionsheetProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    // Reset form when closing
    setRating(0);
    setTitle("");
    setComment("");
    onClose();
  };

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating before submitting your review.");
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert("Review Too Short", "Please write at least 10 characters for your review.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmitReview({
        rating,
        title: title.trim(),
        comment: comment.trim(),
        appointmentId: appointment.id,
      });
      
      Alert.alert("Review Submitted", "Thank you for your feedback!");
      handleClose();
    } catch (error) {
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      return (
        <TouchableOpacity
          key={index}
          onPress={() => handleStarPress(starNumber)}
          style={{ marginHorizontal: 4 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={starNumber <= rating ? "star" : "star-outline"}
            size={32}
            color={starNumber <= rating ? "#F59E0B" : "#D1D5DB"}
          />
        </TouchableOpacity>
      );
    });
  };

  const getRatingText = (rating: number) => {
    const ratingTexts = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || "";
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={handleClose}
    >
      {/* Semi-transparent backdrop */}
      <View style={{ 
        flex: 1, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end'
      }}>
        {/* Backdrop touchable area */}
        <TouchableOpacity 
          style={{ flex: 1 }} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        {/* Modal Content Container with rounded top corners */}
        <View style={{
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: '85%', // Fixed height - shows more content
        }}>
          {/* Drag Indicator */}
          <View style={{
            alignItems: 'center',
            paddingVertical: 12,
          }}>
            <View style={{
              width: 36,
              height: 4,
              backgroundColor: "#D7C3A7",
              borderRadius: 2,
            }} />
          </View>

          <SafeAreaView style={{ flex: 1 }}>
            {/* Header with Close Button */}
            <View 
              className="flex-row justify-between items-center px-6 py-2 border-b"
              style={{ borderBottomColor: "#E0D7CA" }}
            >
              <TouchableOpacity
                onPress={handleClose}
                className="p-2"
                style={{ marginLeft: -8 }}
              >
                <Ionicons name="close" size={24} color="#423120" />
              </TouchableOpacity>
              
              <Text
                className="text-xl font-bold"
                style={{ color: "#423120", fontFamily: "Philosopher" }}
              >
                Write a Review
              </Text>
              
              <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 28}
            >
              <View style={{ flex: 1 }}>
                {/* Sub Header */}
                <View className="px-6 pt-2 pb-4">
                  <Text
                    className="text-center text-sm"
                    style={{ color: "#968469" }}
                  >
                    Share your experience with others
                  </Text>
                </View>

                {/* Appointment Details Card */}
                <View 
                  className="mx-6 mb-6 p-4 rounded-2xl border"
                  style={{ backgroundColor: "#F4EDE5", borderColor: "#E0D7CA" }}
                >
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: appointment.service.images[0] }}
                      className="w-16 h-16 rounded-xl mr-4"
                    />
                    <View className="flex-1">
                      <Text
                        className="text-lg font-bold mb-1"
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
                      <View className="flex-row items-center">
                        <Image
                          source={{ uri: appointment.staff.profileImage }}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <Text
                          className="text-sm mr-3"
                          style={{ color: "#423120" }}
                        >
                          {appointment.staff.firstName} {appointment.staff.lastName}
                        </Text>
                        <Text
                          className="text-sm"
                          style={{ color: "#968469" }}
                        >
                          {formatDate(appointment.appointmentDate)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Rating Section */}
                <View className="px-6 mb-6">
                  <Text
                    className="text-lg font-bold mb-3"
                    style={{ color: "#423120", fontFamily: "Philosopher" }}
                  >
                    How was your experience?
                  </Text>
                  
                  <View className="flex-row justify-center items-center mb-2">
                    {renderStars()}
                  </View>
                  
                  {rating > 0 && (
                    <Text
                      className="text-center text-base font-bold"
                      style={{ color: "#423120", fontFamily: "Philosopher" }}
                    >
                      {getRatingText(rating)}
                    </Text>
                  )}
                </View>

                {/* Review Comment */}
                <View className="px-6 mb-4">
                  <Text
                    className="text-base font-bold mb-2"
                    style={{ color: "#423120", fontFamily: "Philosopher" }}
                  >
                    Your Review
                  </Text>
                  <TextInput
                    className="border rounded-xl px-4 py-3 text-base"
                    style={{ 
                      borderColor: "#E0D7CA", 
                      backgroundColor: "#FFFFFF",
                      color: "#423120",
                      height: 80,
                      textAlignVertical: "top"
                    }}
                    placeholder="Tell us about your experience, what you liked, and any suggestions for improvement..."
                    placeholderTextColor="#968469"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    maxLength={500}
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                  <Text
                    className="text-xs mt-1 text-right"
                    style={{ color: "#968469" }}
                  >
                    {comment.length}/500
                  </Text>
                </View>
              </View>
              
              {/* Fixed Action Buttons at Bottom */}
              <View 
                className="px-6 py-4 border-t"
                style={{ 
                  backgroundColor: "#FFFFFF",
                  borderTopColor: "#E0D7CA"
                }}
              >
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    className="flex-1 mr-3 py-4 rounded-xl border"
                    style={{ borderColor: "#423120" }}
                    onPress={handleClose}
                    disabled={isSubmitting}
                  >
                    <Text
                      className="text-center font-bold"
                      style={{ color: "#423120", fontFamily: "Philosopher" }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="flex-1 py-4 rounded-xl"
                    style={{ 
                      backgroundColor: rating > 0 && comment.trim().length >= 10 ? "#423120" : "#D1D5DB"
                    }}
                    onPress={handleSubmit}
                    disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
                  >
                    {isSubmitting ? (
                      <View className="flex-row justify-center items-center">
                        <Text
                          className="text-center font-bold text-white mr-2"
                          style={{ fontFamily: "Philosopher" }}
                        >
                          Submitting...
                        </Text>
                      </View>
                    ) : (
                      <Text
                        className="text-center font-bold text-white"
                        style={{ fontFamily: "Philosopher" }}
                      >
                        Submit Review
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                {/* Helper Text */}
                <Text
                  className="text-xs text-center mt-3"
                  style={{ color: "#968469" }}
                >
                  Your review helps other customers and helps us improve our services
                </Text>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}