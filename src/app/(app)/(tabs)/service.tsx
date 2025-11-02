import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Animated, Easing, ActivityIndicator, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import { useFonts } from "expo-font";
import getCategories from "../../actions/get-categories";
import { Category, Service } from "../../types";
import { Salon } from "../../../../types/salon";
import getSaloonsMap from "../../actions/get-saloons-map";
import { API_ENDPOINTS } from "@/config/constants";

export default function ServicesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isMenuVisible, setMenuVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    'Philosopher-Regular': require("../../assets/fonts/Philosopher-Regular.ttf"),
    'Philosopher-Bold': require("../../assets/fonts/Philosopher-Bold.ttf"),
    'Philosopher-Italic': require("../../assets/fonts/Philosopher-Italic.ttf"),
    'Philosopher-BoldItalic': require("../../assets/fonts/Philosopher-BoldItalic.ttf"),
  });

  const darkBrown = "#423120";
  const lightBeige = "#F4EDE5";
  const chipBeige = "#D7C3A7";

  // Popular categories (home-provided API)
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [popularLoading, setPopularLoading] = useState<boolean>(false);

  // All categories for search
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState<boolean>(false);
  const [catError, setCatError] = useState<string | null>(null);

  // All services for search (including sub-services)
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState<boolean>(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Salons for search
  const [salons, setSalons] = useState<Salon[]>([]);
  const [salonLoading, setSalonLoading] = useState<boolean>(false);
  const [salonError, setSalonError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'category' | 'salon' | 'service'>('category');

  // Fetch popular categories
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setPopularLoading(true);
        const res = await fetch(`${API_ENDPOINTS.CATEGORIES}?popular=true&global=true`);
        const data = await res.json();
        const categoriesData: Category[] = Array.isArray(data) ? data.filter(Boolean) : [];
        setPopularCategories(categoriesData);
      } catch (e) {
        console.warn("Failed to load popular categories", e);
      } finally {
        setPopularLoading(false);
      }
    };
    fetchPopular();
  }, []);

  // Fetch all services (including sub-services) for search
  useEffect(() => {
    const loadAllServices = async () => {
      try {
        setServicesLoading(true);
        setServicesError(null);
        const res = await fetch(API_ENDPOINTS.SERVICES, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch services: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        setAllServices(data);
      } catch (err) {
        setServicesError(err instanceof Error ? err.message : 'Failed to fetch services');
      } finally {
        setServicesLoading(false);
      }
    };
    loadAllServices();
  }, []);

  // Fetch all categories for search
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCatLoading(true);
        setCatError(null);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setCatError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setCatLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Fetch all salons for search
  useEffect(() => {
    const loadSalons = async () => {
      try {
        setSalonLoading(true);
        setSalonError(null);
        const data = await getSaloonsMap();
        setSalons(data);
      } catch (err) {
        setSalonError(err instanceof Error ? err.message : 'Failed to fetch salons');
      } finally {
        setSalonLoading(false);
      }
    };
    loadSalons();
  }, []);

  const onChipPress = (name: string) => {
    router.push({ pathname: "/services", params: { categoryName: name } });
  };

  const onSalonPress = (salon: Salon) => {
    // Navigate to salon-sector page
    router.push({ 
      pathname: "/salon-sector", 
      params: { 
        salonId: salon.id,
        salonName: salon.name 
      } 
    });
  };

  // Determine search type based on query content
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) {
      setSearchType('category');
      return;
    }
    
    // Check salon matches
    const salonMatches = salons.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.address?.toLowerCase().includes(q) ||
      s.shortIntro?.toLowerCase().includes(q)
    ).length;
    
    // Check category matches
    const categoryMatches = categories.filter(c => 
      c.name.toLowerCase().includes(q)
    ).length;
    
    // Check service/sub-service matches
    const serviceMatches = allServices.filter(s => 
      s.name.toLowerCase().includes(q)
    ).length;
    
    // Priority: salon > service > category
    if (salonMatches > 0 && salonMatches >= categoryMatches && salonMatches >= serviceMatches) {
      setSearchType('salon');
    } else if (serviceMatches > 0) {
      setSearchType('service');
    } else {
      setSearchType('category');
    }
  }, [query, salons, categories, allServices]);

  const filteredCategoryNames = query.trim().length === 0
    ? []
    : categories
        .map((c) => c.name)
        .filter(Boolean)
        .filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()));

  const filteredSalons = query.trim().length === 0
    ? []
    : salons.filter((salon) => {
        const q = query.trim().toLowerCase();
        return (
          salon.name.toLowerCase().includes(q) ||
          salon.address?.toLowerCase().includes(q) ||
          salon.shortIntro?.toLowerCase().includes(q)
        );
      });

  // Filter services (including sub-services) - only sub-services (those with parentServiceId)
  const filteredServices = query.trim().length === 0
    ? []
    : allServices.filter((service) => {
        const q = query.trim().toLowerCase();
        return (
          service.name.toLowerCase().includes(q) &&
          service.parentServiceId // Only show sub-services (services that have a parent)
        );
      });

  const onServicePress = (service: Service) => {
    // Navigate to saloons page with serviceId to show salons that provide this service
    router.push({
      pathname: "/saloons",
      params: {
        serviceId: service.id,
        serviceName: service.name,
        categoryName: service.category?.name || "",
      },
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: lightBeige }}>
      {/* Fixed header to match Home */}
      <Header showBack={true} onMenuPress={() => setMenuVisible(true)} onBackPress={() => router.back()} />

      {/* Side menu modal */}
      <Modal visible={isMenuVisible} animationType="slide" transparent={false} onRequestClose={() => setMenuVisible(false)}>
        <SideMenu onClose={() => setMenuVisible(false)} />
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6">
          {/* Search bar - same style as in Map */}
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: 25,
                borderWidth: 1,
                borderColor: darkBrown,
                width: 320,
                height: 80,
                paddingHorizontal: 16,
                paddingVertical: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Ionicons name="search" size={20} color={darkBrown} style={{ marginRight: 12 }} />
              <TextInput
                style={{ flex: 1, fontSize: 23, fontFamily: 'Philosopher-Bold', color: darkBrown }}
                value={query}
                onChangeText={setQuery}
                placeholder="Etsi hoitoja..."
                placeholderTextColor="#999"
                returnKeyType="search"
              />
            </View>
          </View>

          {/* When searching: show matching salon names, services, or categories */}
          {query.trim().length > 0 ? (
            <View style={{ marginTop: 20 }}>
              {(catLoading || salonLoading || servicesLoading) ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                  <ActivityIndicator size="large" color={darkBrown} />
                  <Text style={{ color: darkBrown, fontFamily: 'Philosopher-Regular', marginTop: 10 }}>
                    {searchType === 'salon' ? 'Ladataan salonkeja...' : searchType === 'service' ? 'Ladataan palveluja...' : 'Ladataan kategorioita...'}
                  </Text>
                </View>
              ) : searchType === 'salon' && filteredSalons.length > 0 ? (
                <View>
                  {/* Salon Names as Chips */}
                  {chunkArray(filteredSalons, 2).map((row, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 8 }}>
                      {row.map((salon) => (
                        <Chip 
                          key={salon.id} 
                          label={salon.name} 
                          onPress={() => onSalonPress(salon)} 
                          color={chipBeige} 
                          textColor={darkBrown} 
                        />
                      ))}
                      {row.length === 1 && (
                        <View style={{ width: 147 }} />
                      )}
                    </View>
                  ))}
                </View>
              ) : searchType === 'service' && filteredServices.length > 0 ? (
                <View>
                  {/* Sub-Services as Chips */}
                  {chunkArray(filteredServices, 2).map((row, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 8 }}>
                      {row.map((service) => (
                        <Chip 
                          key={service.id} 
                          label={service.name} 
                          onPress={() => onServicePress(service)} 
                          color={chipBeige} 
                          textColor={darkBrown} 
                        />
                      ))}
                      {row.length === 1 && (
                        <View style={{ width: 147 }} />
                      )}
                    </View>
                  ))}
                </View>
              ) : searchType === 'category' && filteredCategoryNames.length > 0 ? (
                <View>
                  {/* Render results in the same 2-per-row layout */}
                  {chunkArray(filteredCategoryNames, 2).map((row, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 8 }}>
                      {row.map((name) => (
                        <Chip key={name} label={name} onPress={() => onChipPress(name)} color={chipBeige} textColor={darkBrown} />
                      ))}
                      {row.length === 1 && (
                        <View style={{ width: 147 }} />
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginTop: 10 }}>
                  <Text style={{ fontFamily: 'Philosopher-Bold', color: darkBrown, fontSize: 16 }}>
                    Ei löytynyt
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <>
              {/* Section title */}
              <Text style={{ color: darkBrown, fontFamily: 'Philosopher-Bold', fontSize: 20 }} className="mt-8">
                Suosituimmat palvelut
              </Text>

              {/* Popular Categories - 2-1-2-1 pattern */}
              <View className="mt-5">
                {popularLoading ? (
                  <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <ActivityIndicator size="large" color={darkBrown} />
                  </View>
                ) : popularCategories.length > 0 ? (
                  <>
                    {/* First row - 2 categories */}
                    {popularCategories.length > 0 && (
                      <View className="flex-row justify-between mb-5 px-2">
                        {popularCategories.slice(0, 2).map((category) => (
                          <Chip 
                            key={category.id} 
                            label={category.name} 
                            onPress={() => onChipPress(category.name)} 
                            color={chipBeige} 
                            textColor={darkBrown} 
                          />
                        ))}
                        {popularCategories.length === 1 && <View style={{ width: 147 }} />}
                      </View>
                    )}
                    
                    {/* Second row - 1 category centered */}
                    {popularCategories.length > 2 && (
                      <View className="flex-row justify-center mb-5">
                        <Chip 
                          label={popularCategories[2].name} 
                          onPress={() => onChipPress(popularCategories[2].name)} 
                          color={chipBeige} 
                          textColor={darkBrown} 
                        />
                      </View>
                    )}
                    
                    {/* Third row - 2 categories */}
                    {popularCategories.length > 3 && (
                      <View className="flex-row justify-between mb-5 px-2">
                        {popularCategories.slice(3, 5).map((category) => (
                          <Chip 
                            key={category.id} 
                            label={category.name} 
                            onPress={() => onChipPress(category.name)} 
                            color={chipBeige} 
                            textColor={darkBrown} 
                          />
                        ))}
                        {popularCategories.length === 4 && <View style={{ width: 147 }} />}
                      </View>
                    )}
                    
                    {/* Fourth row - 1 category centered */}
                    {popularCategories.length > 5 && (
                      <View className="flex-row justify-center mb-5">
                        <Chip 
                          label={popularCategories[5].name} 
                          onPress={() => onChipPress(popularCategories[5].name)} 
                          color={chipBeige} 
                          textColor={darkBrown} 
                        />
                      </View>
                    )}
                    
                    {/* Continue pattern for remaining categories */}
                    {popularCategories.length > 6 && popularCategories.slice(6).map((category, idx) => {
                      const position = idx % 3;
                      if (position === 0) {
                        const nextCategory = popularCategories[6 + idx + 1];
                        return (
                          <View key={category.id} className="flex-row justify-between mb-5 px-2">
                            <Chip 
                              label={category.name} 
                              onPress={() => onChipPress(category.name)} 
                              color={chipBeige} 
                              textColor={darkBrown} 
                            />
                            {nextCategory ? (
                              <Chip 
                                label={nextCategory.name} 
                                onPress={() => onChipPress(nextCategory.name)} 
                                color={chipBeige} 
                                textColor={darkBrown} 
                              />
                            ) : (
                              <View style={{ width: 147 }} />
                            )}
                          </View>
                        );
                      } else if (position === 2) {
                        return (
                          <View key={category.id} className="flex-row justify-center mb-5">
                            <Chip 
                              label={category.name} 
                              onPress={() => onChipPress(category.name)} 
                              color={chipBeige} 
                              textColor={darkBrown} 
                            />
                          </View>
                        );
                      }
                      return null;
                    })}
                  </>
                ) : (
                  <Text style={{ color: darkBrown, fontFamily: 'Philosopher-Regular', textAlign: 'center', marginTop: 10 }}>
                    No popular categories available
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function SalonCard({ 
  salon, 
  onPress, 
  darkBrown, 
  lightBeige, 
  beige 
}: { 
  salon: Salon; 
  onPress: () => void; 
  darkBrown: string; 
  lightBeige: string; 
  beige: string;
}) {
  return (
    <TouchableOpacity 
      style={{ alignItems: "center", marginBottom: 24, position: "relative" }}
      onPress={onPress}
    >
      {/* Top Box - Salon Picture */}
      <View
        style={{ 
          width: 310, 
          height: 200,
          backgroundColor: lightBeige,
          borderRadius: 24,
          position: "absolute",
          zIndex: 10,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}
      >
        {salon.images && salon.images.length > 0 && salon.images[0].url ? (
          <Image
            source={{ uri: salon.images[0].url }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 24
            }}
            resizeMode="cover"
          />
        ) : (
          <View style={{
            width: "100%",
            height: "100%",
            backgroundColor: lightBeige,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Ionicons name="business-outline" size={48} color={darkBrown} />
            <Text style={{ 
              color: darkBrown, 
              fontFamily: "Philosopher-Regular",
              marginTop: 8,
              fontSize: 14
            }}>
              {salon.name}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Box - Salon Info */}
      <View
        style={{ 
          width: 310, 
          height: 190, 
          marginTop: 140, 
          borderWidth: 2, 
          borderColor: beige,
          backgroundColor: "white",
          borderRadius: 24,
          justifyContent: "center",
          paddingVertical: 16
        }}
      >
        <View style={{ marginTop: 40 }}>
          <View style={{ paddingHorizontal: 16 }}>
            <Text
              style={{
                fontFamily: "Philosopher-Bold",
                fontSize: 20,
                color: darkBrown,
                marginTop: 28
              }}
            >
              {salon.name}
            </Text>
          </View>

          <View style={{ 
            borderBottomWidth: 1, 
            marginTop: 8, 
            borderBottomColor: beige 
          }} />

          <View style={{ paddingHorizontal: 16 }}>
            <Text
              style={{
                fontFamily: "Philosopher-Bold",
                fontSize: 15,
                color: "#423120",
                marginTop: 4
              }}
            >
              {salon.shortIntro || 'No description'}
            </Text>
            <Text
              style={{
                fontFamily: "Philosopher-Bold",
                fontSize: 15,
                color: "#423120",
                marginTop: 4
              }}
            >
              Location: {salon.address || 'Not specified'}
            </Text>

            <View style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              justifyContent: "flex-end", 
              marginTop: 8 
            }}>
              <Text
                style={{
                  color: "#E0CFB9",
                  fontSize: 16,
                  fontFamily: "Philosopher-Bold",
                }}
              >
                {"★".repeat(Math.max(0, Math.min(5, Math.round(salon.averageRating || salon.rating || 0))))}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Chip({ label, onPress, color, textColor }: { label: string; onPress: () => void; color: string; textColor: string }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const H_PADDING = 16; // internal horizontal padding so text doesn't touch edges
  const effectiveWidth = Math.max(0, containerWidth - H_PADDING * 2);
  const shouldScroll = textWidth > effectiveWidth && effectiveWidth > 0;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (shouldScroll) {
      // Start centered if possible, then animate to left and back
      translateX.setValue(0);
      const distance = textWidth - effectiveWidth;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: -distance,
            duration: Math.min(14000, 5000 + distance * 30),
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [shouldScroll, textWidth, effectiveWidth, translateX]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: color, width: 147, height: 45 }}
      className="rounded-full items-center justify-center"
    >
      <View
        style={{ width: "100%", overflow: "hidden", alignItems: "center", paddingHorizontal: H_PADDING }}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={{ transform: [{ translateX: shouldScroll ? translateX : 0 }], alignItems: "center" }}>
          <Text
            onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
            numberOfLines={1}
            style={{ color: textColor, fontFamily: 'Philosopher-Bold', fontSize: 15, textAlign: 'center' }}
          >
            {label}
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}