// src/app/(app)/services.tsx
import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from 'expo-font';
import Svg, { Path } from "react-native-svg";
import { useRouter, useLocalSearchParams } from "expo-router";
import getServicesByCategory from "../actions/get-services";
import { Service } from "../types";
import Header from "../components/Header";

// Colors
const darkBrown = "#423120";
const lightBrown = "#D7C3A7";
const veryLightBeige = "#FFFF";
const blobFill = "#E9DCCC";

export default function ServicesPage() {
  const router = useRouter();
  const { categoryName } = useLocalSearchParams<{ categoryName: string }>();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [fontsLoaded] = useFonts({
    'Philosopher-Regular': require("../assets/fonts/Philosopher-Regular.ttf"),
    'Philosopher-Bold': require("../assets/fonts/Philosopher-Bold.ttf"),
    'Philosopher-Italic': require("../assets/fonts/Philosopher-Italic.ttf"),
    'Philosopher-BoldItalic': require("../assets/fonts/Philosopher-BoldItalic.ttf"),
  });

  // Fetch services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      if (!categoryName) {
        setError('No category selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getServicesByCategory(categoryName);
        setServices(data);
        console.log('Fetched services for category:', categoryName, data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [categoryName]);

  if (!fontsLoaded) {
    return null;
  }

  // Group services by parent-child relationship
  const groupServices = (services: Service[]) => {
    // Find main services (those without parentServiceId)
    const mainServices = services.filter(service => !service.parentServiceId);
    
    // For each main service, find its sub-services
    return mainServices.map(mainService => ({
      ...mainService,
      subServices: services.filter(service => service.parentServiceId === mainService.id)
    }));
  };

  const groupedServices = groupServices(services);

  const handleServicePress = (service: Service) => {
    console.log(`Selected service: ${service.name} (ID: ${service.id})`);
    // Navigate to saloons page with serviceId and serviceName
    router.push({
      pathname: "/(app)/saloons",
      params: { 
        serviceId: service.id,
        serviceName: service.name,
        categoryName: categoryName
      }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: veryLightBeige }}>
      {/* Header - Full Width */}
      <Header 
        showBack={true}
        showMenu={true}
        onBackPress={() => router.back()}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO SECTION with Blob */}
        <View style={{ backgroundColor: lightBrown, paddingBottom: 30 }}>
          {/* Blob with title */}
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <View style={{ position: "relative", width: 300, height: 200 }}>
              <Svg width="100%" height="100%" viewBox="0 0 600 400">
                <Path
                  d="M100,200 C150,99 100,50 450,100 C600,150 550,300 400,350 C250,380 80,300 100,200 Z"
                  fill={blobFill}
                />
              </Svg>

              {/* Title centered inside blob */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 40,
                    color: "#423120",
                    fontFamily: "Philosopher-Bold",
                    textAlign: "center",
                  }}
                >
                  {categoryName || "Services"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content with padding */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* Loading State */}
          {loading && (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}>
              <ActivityIndicator size="large" color={darkBrown} />
              <Text
                style={{
                  marginTop: 10,
                  fontFamily: "Philosopher-Bold",
                  fontSize: 16,
                  color: darkBrown,
                }}
              >
                Loading services...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}>
              <Text
                style={{
                  fontFamily: "Philosopher-Bold",
                  fontSize: 16,
                  color: "red",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                Error: {error}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: lightBrown,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
                onPress={() => {
                  // Retry fetching
                  if (categoryName) {
                    setError(null);
                    setLoading(true);
                    getServicesByCategory(categoryName)
                      .then(setServices)
                      .catch((err) => setError(err.message))
                      .finally(() => setLoading(false));
                  }
                }}
              >
                <Text style={{ fontFamily: "Philosopher-Bold", color: darkBrown }}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* SERVICE CATEGORIES */}
          {!loading && !error && (
            <View>
              {groupedServices.length > 0 ? (
                groupedServices.map((service, idx) => (
                  <View
                    key={service.id}
                    style={{
                      marginTop: idx === 0 ? 30 : 40,
                    }}
                  >
                    {/* Main Service as Category Title */}
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 30,
                        color: darkBrown,
                        fontFamily: "Philosopher-Bold",
                        marginBottom: 20,
                      }}
                    >
                      {service.name}
                    </Text>

                    {/* Sub Service Buttons */}
                    {service.subServices && service.subServices.length > 0 ? (
                      service.subServices.map((subService) => (
                        <TouchableOpacity
                          key={subService.id}
                          style={{
                            backgroundColor: "white",
                            borderRadius: 30,
                            borderWidth: 2,
                            borderColor: lightBrown,
                            width: 330,
                            minHeight: 84,
                            justifyContent: "center",
                            marginBottom: 12,
                            alignSelf: "center",
                            paddingVertical: 12,
                          }}
                          onPress={() => handleServicePress(subService)}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16 }}>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 20,
                                  color: darkBrown,
                                  fontFamily: "Philosopher-Bold",
                                }}
                              >
                                {subService.name}
                              </Text>
                              
                              {/* Add description here */}
                              {subService.description && (
                                <Text
                                  style={{
                                    fontSize: 15,
                                    color: darkBrown,
                                    fontFamily: "Philosopher-Bold",
                                    opacity: 0.6,
                                    marginTop: 4,
                                    lineHeight: 20,
                                  }}
                                  numberOfLines={2}
                                >
                                  {subService.description}
                                </Text>
                              )}
                              
                              {subService.price && (
                                <Text
                                  style={{
                                    fontSize: 16,
                                    color: darkBrown,
                                    fontFamily: "Philosopher-Regular",
                                    opacity: 0.7,
                                    marginTop: 4,
                                  }}
                                >
                                  €{subService.price}
                                </Text>
                              )}
                            </View>
                            {subService.durationMinutes && (
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: darkBrown,
                                  fontFamily: "Philosopher-Regular",
                                  opacity: 0.6,
                                  marginTop: 2,
                                }}
                              >
                                {subService.durationMinutes} min
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      // If no sub-services, show the main service as a clickable button
                      <TouchableOpacity
                        style={{
                          backgroundColor: "white",
                          borderRadius: 30,
                          borderWidth: 2,
                          borderColor: lightBrown,
                          width: 330,
                          minHeight: 84,
                          justifyContent: "center",
                          marginBottom: 12,
                          alignSelf: "center",
                          paddingVertical: 12,
                        }}
                        onPress={() => handleServicePress(service)}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16 }}>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 20,
                                color: darkBrown,
                                fontFamily: "Philosopher-Bold",
                              }}
                            >
                              {service.name}
                            </Text>
                            
                            {/* Add description here */}
                            {service.description && (
                              <Text
                                style={{
                                  fontSize: 15,
                                  color: darkBrown,
                                  fontFamily: "Philosopher-Bold",
                                  opacity: 0.6,
                                  marginTop: 4,
                                  lineHeight: 20,
                                }}
                                numberOfLines={2}
                              >
                                {service.description}
                              </Text>
                            )}
                            
                            {service.price && (
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: darkBrown,
                                  fontFamily: "Philosopher-Regular",
                                  opacity: 0.7,
                                  marginTop: 4,
                                }}
                              >
                                €{service.price}
                              </Text>
                            )}
                          </View>
                          {service.durationMinutes && (
                            <Text
                              style={{
                                fontSize: 14,
                                color: darkBrown,
                                fontFamily: "Philosopher-Regular",
                                opacity: 0.6,
                                marginTop: 2,
                              }}
                            >
                              {service.durationMinutes} min
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}>
                  <Text
                    style={{
                      fontFamily: "Philosopher-Bold",
                      fontSize: 18,
                      color: darkBrown,
                      textAlign: "center",
                    }}
                  >
                    No services found for {categoryName}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}