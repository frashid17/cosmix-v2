// src/app/(app)/services.tsx
import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Modal, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from 'expo-font';
import { useRouter, useLocalSearchParams } from "expo-router";
import getServicesByCategory from "../actions/get-services";
import getServicesBySalon from "../actions/get-services-by-salon";
import { Service } from "../types";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";

// Colors
const darkBrown = "#423120";
const lightBrown = "#D7C3A7";
const beige = "#D9C7AF";
const veryLightBeige = "#FFFF";

export default function ServicesPage() {
  const router = useRouter();
  const { categoryName, salonId, salonName } = useLocalSearchParams<{ 
    categoryName: string;
    salonId?: string;
    salonName?: string;
  }>();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dynamicCategoryName, setDynamicCategoryName] = useState<string>('');
  const [isMenuVisible, setMenuVisible] = useState(false);
  
  // Store pricing info for salon services (serviceId -> { price, durationMinutes })
  const [salonServicePricing, setSalonServicePricing] = useState<Map<string, { price: number; durationMinutes: number }>>(new Map());
  
  const [fontsLoaded] = useFonts({
    'Philosopher-Regular': require("../assets/fonts/Philosopher-Regular.ttf"),
    'Philosopher-Bold': require("../assets/fonts/Philosopher-Bold.ttf"),
    'Philosopher-Italic': require("../assets/fonts/Philosopher-Italic.ttf"),
    'Philosopher-BoldItalic': require("../assets/fonts/Philosopher-BoldItalic.ttf"),
  });

  // Function to extract category names from services
  const extractCategoryNames = (services: Service[]) => {
    const categoryNames = new Set<string>();
    
    services.forEach(service => {
      if (service.category?.name) {
        categoryNames.add(service.category.name);
      }
      // Also check parent service category
      if (service.parentService?.category?.name) {
        categoryNames.add(service.parentService.category.name);
      }
    });
    
    return Array.from(categoryNames);
  };

  // Fetch services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      // If coming from salon-sector (has salonId), fetch services for that specific salon
      if (salonId) {
        try {
          setLoading(true);
          setError(null);
          const data = await getServicesBySalon(salonId);
          
          // Extract pricing info from saloonServices and store in map
          const pricingMap = new Map<string, { price: number; durationMinutes: number }>();
          data.forEach(service => {
            // Check if service has saloonServices array
            if (service.saloonServices && service.saloonServices.length > 0) {
              const salonServiceInfo = service.saloonServices.find(ss => ss.saloonId === salonId);
              if (salonServiceInfo) {
                pricingMap.set(service.id, {
                  price: salonServiceInfo.price,
                  durationMinutes: salonServiceInfo.durationMinutes
                });
                console.log(`Pricing from saloonServices for ${service.name}:`, salonServiceInfo.price, salonServiceInfo.durationMinutes);
              }
            } else {
              // API might return services with pricing directly as properties
              // Check if the service object itself has price and durationMinutes
              const serviceAny = service as any;
              if (serviceAny.price !== undefined && serviceAny.durationMinutes !== undefined) {
                pricingMap.set(service.id, {
                  price: serviceAny.price,
                  durationMinutes: serviceAny.durationMinutes
                });
                console.log(`Pricing from service object for ${service.name}:`, serviceAny.price, serviceAny.durationMinutes);
              } else {
                console.warn(`No pricing info found for service: ${service.name} (ID: ${service.id})`);
              }
            }
          });
          setSalonServicePricing(pricingMap);
          console.log('Salon service pricing map size:', pricingMap.size);
          console.log('Salon service pricing map:', Object.fromEntries(pricingMap));
          
          // Filter by category if categoryName is provided (coming from salon-sector category click)
          let filteredData = data;
          if (categoryName) {
            filteredData = data.filter(service => 
              service.category?.name === categoryName || 
              service.parentService?.category?.name === categoryName
            );
            console.log('Filtered services by category:', categoryName, filteredData.length, 'of', data.length);
          }
          
          setServices(filteredData);
          
          // Set dynamic category name - use categoryName if provided, otherwise extract from services
          if (categoryName) {
            setDynamicCategoryName(categoryName);
          } else {
            const categoryNames = extractCategoryNames(filteredData);
            const categoryDisplayName = categoryNames.length > 0 
              ? categoryNames.join(', ') 
              : 'Palvelut';
            setDynamicCategoryName(categoryDisplayName);
          }
          
          console.log('Fetched services for salon:', salonId, filteredData);
          console.log('Category name:', categoryName || 'All');
        } catch (err) {
          console.error('Error fetching salon services:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch salon services');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Normal flow - fetch services by category
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
  }, [categoryName, salonId]);

  if (!fontsLoaded) {
    return null;
  }

  // Group services by parent-child relationship
  const groupServices = (services: Service[]) => {
    // If coming from salon (salonId exists), handle sub-services differently
    if (salonId) {
      console.log('Grouping salon services, salonId:', salonId);
      console.log('Services to group:', services.length);
      
      // For salon-specific services, group by their parent services
      const parentServices = new Map();
      
      services.forEach(service => {
        console.log('Processing service:', service.name, 'parentService:', !!service.parentService);
        if (service.parentService) {
          const parentId = service.parentService.id;
          console.log('Adding to parent:', parentId, service.parentService.name);
          if (!parentServices.has(parentId)) {
            parentServices.set(parentId, {
              ...service.parentService,
              subServices: []
            });
          }
          parentServices.get(parentId).subServices.push(service);
        } else {
          console.log('No parent service, treating as main service');
          // If no parent service, treat as main service
          if (!parentServices.has(service.id)) {
            parentServices.set(service.id, {
              ...service,
              subServices: []
            });
          }
        }
      });
      
      const result = Array.from(parentServices.values());
      console.log('Grouped result:', result.length, 'groups');
      return result;
    }
    
    // Normal flow - group by parent-child relationship
    const mainServices = services.filter(service => !service.parentServiceId);
    
    // For each main service, find its sub-services
    return mainServices.map(mainService => ({
      ...mainService,
      subServices: services.filter(service => service.parentServiceId === mainService.id)
    }));
  };

  const groupedServices = groupServices(services);
  
  // Debug logging
  console.log('Services count:', services.length);
  console.log('Grouped services count:', groupedServices.length);
  console.log('Grouped services:', groupedServices.map(g => ({ name: g.name, subServicesCount: g.subServices?.length || 0 })));

  const handleServicePress = (service: Service) => {
    console.log(`Selected service: ${service.name} (ID: ${service.id})`);
    console.log('Current salonId:', salonId);
    console.log('Current salonName:', salonName);
    console.log('Salon service pricing map size:', salonServicePricing.size);
    
    // If coming from a salon, navigate directly to checkout
    if (salonId) {
      // Get pricing info from our pricing map
      const pricingInfo = salonServicePricing.get(service.id);
      
      console.log('Found pricing info:', pricingInfo);
      
      if (pricingInfo) {
        console.log(`✅ Navigating directly to checkout for salon: ${salonName}`);
        router.push({
          pathname: "/(app)/checkout",
          params: { 
            saloonId: salonId,
            saloonName: salonName || 'Salon',
            serviceId: service.id,
            serviceName: service.name,
            categoryName: categoryName || dynamicCategoryName || 'Service',
            price: pricingInfo.price.toString(),
            durationMinutes: pricingInfo.durationMinutes.toString()
          }
        });
        return;
      } else {
        console.warn('⚠️ No pricing info found for this service, falling back to saloons page');
        // Fallback to saloons page
        router.push({
          pathname: "/(app)/saloons",
          params: { 
            serviceId: service.id,
            serviceName: service.name,
            categoryName: categoryName || dynamicCategoryName || 'Service',
            salonId: salonId
          }
        });
        return;
      }
    }
    
    // Normal flow - Navigate to saloons page with serviceId and serviceName
    console.log('Normal flow - navigating to saloons page');
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
        onMenuPress={() => setMenuVisible(true)}
      />

      {/* Salon Info Header - Show when coming from map */}
      
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* HERO SECTION - Conditional rendering based on flow */}
        {salonId ? (
          // Hero section when coming from salon-sector (salon-selector)
          <View style={{ backgroundColor: beige, height: 320, position: "relative" }}>
            {/* Background vectors (left/right) - behind the hero card */}
            <Image
              source={require("../../../assets/vector-left.png")}
              style={{
                position: "absolute",
                top: 97,
                left: -45,
                width: 220,
                height: 200,
                opacity: 0.9,
              }}
              resizeMode="contain"
            />
            <Image
              source={require("../../../assets/vector-right.png")}
              style={{
                position: "absolute",
                top: 18,
                right: -45,
                width: 220,
                height: 200,
                opacity: 0.9,
              }}
              resizeMode="contain"
            />
            
            {/* White Box - Centered */}
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <View
                style={{ 
                  width: 300, 
                  height: 195,
                  backgroundColor: "white",
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  position: "relative"
                }}
              >
                {/* Title */}
                <Text
                  style={{
                    fontFamily: "Philosopher-Bold",
                    fontSize: 40,
                    color: darkBrown,
                    textAlign: "center",
                    paddingHorizontal: 16
                  }}
                >
                  {(salonName || "Salon") + " Salonki"}
                </Text>

                {/* Ellipses at bottom */}
                <View style={{ 
                  position: "absolute", 
                  bottom: 16, 
                  flexDirection: "row" 
                }}>
                  <View
                    style={{ 
                      width: 11, 
                      height: 11,
                      backgroundColor: darkBrown,
                      borderRadius: 5.5
                    }}
                  />
                  <View
                    style={{ 
                      width: 11, 
                      height: 11, 
                      marginLeft: 5,
                      backgroundColor: darkBrown,
                      borderRadius: 5.5
                    }}
                  />
                  <View
                    style={{ 
                      width: 11, 
                      height: 11, 
                      marginLeft: 5,
                      backgroundColor: darkBrown,
                      borderRadius: 5.5
                    }}
                  />
                  <View
                    style={{ 
                      width: 11, 
                      height: 11, 
                      marginLeft: 5,
                      backgroundColor: darkBrown,
                      borderRadius: 5.5
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        ) : (
          // Normal hero section
          <View style={{ backgroundColor: lightBrown, paddingBottom: 30 }}>
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <View style={{ position: "relative", width: 320, height: 200, borderRadius: 24, overflow: "hidden" }}>
                <Image
                  source={require("../../../assets/Vector-2.png")}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />

                {/* Title centered over image */}
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
                      paddingHorizontal: 20,
                    }}
                  >
                    {categoryName || "Services"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

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
        {/* Bottom spacer so last card is fully visible above tab bar */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal for the side menu */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#F4EDE5',
              alignSelf: 'flex-end',
            }}
          >
            <SideMenu onClose={() => setMenuVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}