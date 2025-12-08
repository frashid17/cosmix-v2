// src/app/(app)/saloons.tsx
import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import getSaloonsByService, { SaloonData } from "../actions/get-saloons-by-service";
import getSalonById from "../actions/get-salon-by-id";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";

const darkBrown = "#3C2C1E";
const beige = "#D9C7AF";
const lightBeige = "#E4D2BA";

const Saloons = () => {
    const router = useRouter();
    const { serviceName, categoryName, serviceId, salonId, workType } = useLocalSearchParams<{
        serviceName?: string;
        serviceId?: string;
        categoryName: string;
        salonId?: string;
        workType?: string;
    }>();

    const [saloons, setSaloons] = useState<SaloonData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMenuVisible, setMenuVisible] = useState(false);

    // Fonts are loaded globally in root _layout.tsx

    // Fetch saloons when component mounts
    useEffect(() => {
        const fetchSaloons = async () => {
            if (!serviceId) {
                setError('No service selected');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // If coming from filtered services (has salonId), fetch only that specific salon
                if (salonId) {
                    const data = await getSalonById(salonId, serviceId);
                    setSaloons(data);
                    console.log('Fetched specific salon for service:', salonId, serviceId, data);
                } else {
                    // Normal flow - fetch all saloons for the service
                    const data = await getSaloonsByService(serviceId, workType);
                    setSaloons(data);
                    console.log('Fetched saloons for service:', serviceId, 'workType:', workType, data);
                }
            } catch (err) {
                console.error('Error fetching saloons:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch saloons');
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchSaloons();
        }
    }, [serviceId, salonId, workType]);

    // Render nothing until fonts are loaded to prevent style flashing
    // (Fonts are loaded globally, so no check needed here)

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            {/* Header - Fixed at Top */}
            <Header
                title="COSMIX"
                showBack={true}
                showMenu={true}
                onBackPress={() => router.back()}
                onMenuPress={() => setMenuVisible(true)}
            />

            {/* SCROLLABLE CONTENT */}
            <ScrollView
                style={{ flex: 1, backgroundColor: "white" }}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* HERO SECTION */}
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
                                }}
                            >
                                {salonId ? `${serviceName || "Service"} ` : (categoryName || "Services")}
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
                            </View>
                        </View>
                    </View>
                </View>
                {/* Loading State */}
                {loading && (
                    <View style={{ alignItems: "center", marginTop: 80 }}>
                        <ActivityIndicator size="large" color={darkBrown} />
                        <Text
                            style={{
                                fontFamily: "Philosopher-Bold",
                                fontSize: 16,
                                color: darkBrown,
                                marginTop: 10,
                            }}
                        >
                            Loading saloons...
                        </Text>
                    </View>
                )}

                {/* Error State */}
                {error && (
                    <View style={{ alignItems: "center", marginTop: 80, paddingHorizontal: 16 }}>
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
                                backgroundColor: beige,
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 8,
                            }}
                            onPress={() => {
                                if (serviceId) {
                                    setError(null);
                                    setLoading(true);
                                    getSaloonsByService(serviceId)
                                        .then(setSaloons)
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

                {/* Saloons List */}
                {!loading && !error && (
                    <>
                        {saloons.length > 0 ? (
                            saloons.map((saloon) => (
                                <TouchableOpacity 
                                    key={saloon.id} 
                                    style={{ alignItems: "center", marginTop: 24, position: "relative" }}
                                    onPress={() => {
                                        console.log(`Selected saloon: ${saloon.name} (ID: ${saloon.id})`);
                                        // Navigate to checkout with the selected saloon service
                                        router.push({
                                            pathname: "/(app)/checkout",
                                            params: { 
                                                saloonId: saloon.id,
                                                saloonName: saloon.name,
                                                serviceId: serviceId,
                                                serviceName: serviceName,
                                                categoryName: categoryName,
                                                price: saloon.price.toString(),
                                                durationMinutes: saloon.durationMinutes.toString()
                                            }
                                        });
                                    }}
                                >
                                    {/* First Box - Top Box (327x300) - Salon Picture */}
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
                                        {saloon.imageUrl ? (
                                            <Image
                                                source={{ uri: saloon.imageUrl }}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    borderRadius: 24
                                                }}
                                                resizeMode="cover"
                                            />
                                        ) : saloon.images && saloon.images.length > 0 ? (
                                            <Image
                                                source={{ uri: saloon.images[0] }}
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
                                                    {saloon.name}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Second Box - Bottom Box (327x200) - Salon Info */}
                                    <View
                                        style={{ 
                                            width: 310, 
                                            height: 190, 
                                            marginTop: 140, 
                                            borderWidth: 2, 
                                            borderColor: '#D7C3A7',
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
                                                    {saloon.name}
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
                                                    {saloon.shortIntro}
                                                </Text>
                                                <Text
                                                    style={{
                                                        fontFamily: "Philosopher-Bold",
                                                        fontSize: 15,
                                                        color: "#423120",
                                                        marginTop: 4
                                                    }}
                                                >
                                                    Price {saloon.price}€
                                                </Text>

                                                <View style={{ 
                                                    flexDirection: "row", 
                                                    alignItems: "center", 
                                                    justifyContent: "space-between", 
                                                    marginTop: 8 
                                                }}>
                                                    <Text
                                                        style={{
                                                            fontFamily: "Philosopher-Bold",
                                                            fontSize: 15,
                                                            color: "#423120",
                                                        }}
                                                    >
                                                        Time {saloon.durationMinutes} min
                                                    </Text>
                                                    {/* Star Rating - 5 stars total */}
                                                    <View style={{ flexDirection: "row" }}>
                                                        {(() => {
                                                            const rating = saloon.rating || 0;
                                                            const filledStars = Math.round(rating);
                                                            const totalStars = 5;
                                                            return [...Array(totalStars)].map((_, index) => (
                                                                <Text
                                                                    key={index}
                                                                    style={{
                                                                        color: index < filledStars ? darkBrown : "#E0CFB9",
                                                                        fontSize: 18,
                                                                    }}
                                                                >
                                                                    ★
                                                                </Text>
                                                            ));
                                                        })()}
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={{ alignItems: "center", marginTop: 80 }}>
                                <Text
                                    style={{
                                        fontFamily: "Philosopher-Bold",
                                        fontSize: 18,
                                        color: darkBrown,
                                        textAlign: "center",
                                    }}
                                >
                                    Saloneja ei ole saatavilla
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: "Philosopher-Regular",
                                        fontSize: 16,
                                        color: darkBrown,
                                        textAlign: "center",
                                        marginTop: 8,
                                        opacity: 0.6,
                                    }}
                                >
                            Ei salonkeja tällä hetkellä tarjoa {serviceName}
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Modal for the side menu */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={isMenuVisible}
                onRequestClose={() => setMenuVisible(false)}
                statusBarTranslucent={true}
            >
                <SideMenu onClose={() => setMenuVisible(false)} />
            </Modal>
        </SafeAreaView>
    );
};

export default Saloons;