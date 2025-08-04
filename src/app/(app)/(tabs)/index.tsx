import { Link, router } from "expo-router";
import React from "react";
import { 
  SafeAreaView, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useUser } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";

export default function Page() {
  const { user } = useUser();
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <WelcomeSection />
        <QuickActions />
        <PopularServices />
        <UpcomingAppointments />
      </ScrollView>
    </SafeAreaView>
  );
}

function Header() {
  const { user } = useUser();
  
  // You can replace this with your actual notification count state
  const notificationCount = 3; // This could come from your state management or API
  
  return (
    <View className="px-6 pt-4 pb-2 bg-[#F4EDE5]">
      <View className="flex-row mt-5 items-center justify-between">
        <View className="flex-1 mt-6">
          <Text className="text-[#968469] text-sm font-[Philosopher]">Welcome back</Text>
          <Text className="text-[#423120] text-xl font-bold font-[Philosopher]">
            {user?.firstName || "Beautiful"} ✨
          </Text>
        </View>
        <TouchableOpacity className="bg-white mb-3 p-3 rounded-full shadow-sm relative">
          <MaterialIcons name="notifications-none" size={24} color="#423120" />
          {notificationCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-[#423120] rounded-full min-w-[20px] h-5 items-center justify-center px-1">
              <Text className="text-white text-xs font-bold">
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function WelcomeSection() {
  return (
    <View className="px-6 py-8 bg-gradient-to-br from-[#F4EDE5] to-white">
      <View className="bg-white rounded-3xl p-6 shadow-lg border border-[#E0D7CA]">
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-[#423120] text-lg font-bold font-[Philosopher] mb-2">
              Ready to Relax?
            </Text>
            <Text className="text-[#968469] text-sm font-[Philosopher] mb-4 leading-5">
              Book your perfect spa experience and let us take care of you today.
            </Text>
            <TouchableOpacity className="bg-[#423120] px-6 py-3 rounded-full self-start">
              <Text className="text-white font-bold font-[Philosopher]">Book Now</Text>
            </TouchableOpacity>
          </View>
          <View className="ml-4">
            <View className="w-20 h-20 bg-[#E0D7CA] rounded-full items-center justify-center">
              <MaterialIcons name="spa" size={40} color="#423120" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function QuickActions() {
  const actions = [
    { icon: "spa", label: "Browse Services", color: "#423120", route: "/service" },
    { icon: "calendar-today", label: "My Bookings", color: "#D7C3A7", route: "/bookings" },
    { icon: "favorite", label: "Favorites", color: "#E0D7CA", route: "/favorites" },
    { icon: "person", label: "Profile", color: "#968469", route: "/profile" },
  ];

  return (
    <View className="px-6 py-6">
      <Text className="text-[#423120] text-lg font-bold font-[Philosopher] mb-4">
        Quick Actions
      </Text>
      <View className="flex-row justify-between">
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            className="items-center flex-1 mx-1"
            onPress={() => router.push(action.route)}
          >
            <View 
              className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
              style={{ backgroundColor: action.color + "20" }}
            >
              <MaterialIcons name={action.icon as any} size={28} color={action.color} />
            </View>
            <Text className="text-[#423120] text-xs font-[Philosopher] text-center">
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function PopularServices() {
  const services = [
    {
      id: 1,
      name: "Swedish Massage",
      category: "Massage Therapy",
      price: 80,
      duration: 60,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop"
    },
    {
      id: 2,
      name: "Deep Cleansing Facial",
      category: "Facial Treatment",
      price: 65,
      duration: 45,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=200&fit=crop"
    }
  ];

  return (
    <View className="px-6 py-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-[#423120] text-lg font-bold font-[Philosopher]">
          Popular Services
        </Text>
        <TouchableOpacity>
          <Text className="text-[#968469] font-[Philosopher]">See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            className="mr-4 w-64"
          >
            <View className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#F4EDE5]">
              <Image 
                source={{ uri: service.image }}
                className="w-full h-32"
                resizeMode="cover"
              />
              <View className="p-4">
                <Text className="text-[#423120] font-bold font-[Philosopher] mb-1">
                  {service.name}
                </Text>
                <Text className="text-[#968469] text-sm font-[Philosopher] mb-2">
                  {service.category}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-[#423120] font-bold font-[Philosopher]">
                      ${service.price}
                    </Text>
                    <Text className="text-[#968469] text-sm font-[Philosopher] ml-2">
                      {service.duration}min
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <AntDesign name="star" size={12} color="#FFD700" />
                    <Text className="text-[#968469] text-sm font-[Philosopher] ml-1">
                      {service.rating}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function UpcomingAppointments() {
  const appointments = [
    {
      id: 1,
      service: "Hot Stone Massage",
      staff: "Sarah Johnson",
      date: "Today, 2:00 PM",
      status: "confirmed"
    }
  ];

  return (
    <View className="px-6 py-4 pb-8">
      <Text className="text-[#423120] text-lg font-bold font-[Philosopher] mb-4">
        Upcoming Appointments
      </Text>
      
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <TouchableOpacity
            key={appointment.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#F4EDE5] mb-3"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-[#E0D7CA] rounded-full items-center justify-center mr-4">
                <MaterialIcons name="spa" size={20} color="#423120" />
              </View>
              <View className="flex-1">
                <Text className="text-[#423120] font-bold font-[Philosopher]">
                  {appointment.service}
                </Text>
                <Text className="text-[#968469] text-sm font-[Philosopher]">
                  with {appointment.staff}
                </Text>
                <Text className="text-[#968469] text-sm font-[Philosopher]">
                  {appointment.date}
                </Text>
              </View>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-800 text-xs font-[Philosopher] capitalize">
                  {appointment.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View className="bg-[#F4EDE5] rounded-2xl p-6 items-center">
          <MaterialIcons name="event-available" size={48} color="#968469" />
          <Text className="text-[#968469] font-[Philosopher] mt-2 text-center">
            No upcoming appointments
          </Text>
          <TouchableOpacity className="bg-[#423120] px-6 py-2 rounded-full mt-3">
            <Text className="text-white font-[Philosopher]">Book Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}