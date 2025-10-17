// src/app/(app)/bookings.tsx
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { getBookings } from "../actions/get-bookings";
import { Booking } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { API_ENDPOINTS } from "../../../config/constants";
import { router } from "expo-router";
import Header from "../components/Header";
import { useFonts } from "expo-font";

const beige = "#D9C7AF";
const darkBrown = "#423120";

// Function to fetch salon details by ID
const fetchSalonDetails = async (salonId: string) => {
    try {
        const response = await fetch(`${API_ENDPOINTS.SALONS}/${salonId}`);
        if (response.ok) {
            const salon = await response.json();
            return salon.name || "Salon";
        }
    } catch (error) {
        console.error("Error fetching salon details:", error);
    }
    return "Salon";
};

/** Helpers to safely extract names from different possible backend shapes */
function getServiceName(b: Booking) {
    const anyB = b as any;
    return (
        anyB.subService?.name ||
        anyB.service?.subService?.name ||
        anyB.service?.name ||
        anyB.subServiceName ||
        anyB.serviceName ||
        "Palvelu"
    );
}
function getSalonName(b: Booking, salonNames: Record<string, string>) {
    const anyB = b as any;

    // First try to get from fetched salon names
    if (anyB.saloonId && salonNames[anyB.saloonId]) {
        console.log("Using fetched salon name:", salonNames[anyB.saloonId]);
        return salonNames[anyB.saloonId];
    }

    // Fallback to direct fields
    const salonName = (
        anyB.salon?.name ||
        anyB.saloon?.name ||
        anyB.salonName ||
        anyB.saloonName ||
        "Salon"
    );

    console.log("Extracted salon name:", salonName);
    return salonName;
}

export default function BookingsScreen() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [salonNames, setSalonNames] = useState<Record<string, string>>({});
    const { getToken } = useAuth();
    const { user } = useUser();

    // Load all Philosopher font variants
    const [fontsLoaded] = useFonts({
        'Philosopher-Regular': require("../assets/fonts/Philosopher-Regular.ttf"),
        'Philosopher-Bold': require("../assets/fonts/Philosopher-Bold.ttf"),
        'Philosopher-Italic': require("../assets/fonts/Philosopher-Italic.ttf"),
        'Philosopher-BoldItalic': require("../assets/fonts/Philosopher-BoldItalic.ttf"),
    });

    // Don't render if fonts aren't loaded
    if (!fontsLoaded) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF", justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: "Philosopher-Regular", color: "#423120" }}>Loading fonts...</Text>
            </SafeAreaView>
        );
    }

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const userId = user?.id;
            const userEmail = user?.emailAddresses?.[0]?.emailAddress;

            console.log("Fetching bookings with token:", token ? "Yes" : "No");
            console.log("User ID:", userId);
            console.log("User Email:", userEmail);

            const data = await getBookings(token || undefined, userId, userEmail);
            console.log("Bookings data received:", data);
            setBookings(data);

            // Fetch salon names for each booking
            const salonNamePromises = data.map(async (booking: any) => {
                if (booking.saloonId && !salonNames[booking.saloonId]) {
                    const salonName = await fetchSalonDetails(booking.saloonId);
                    return { salonId: booking.saloonId, salonName };
                }
                return null;
            });

            const salonResults = await Promise.all(salonNamePromises);
            const newSalonNames: Record<string, string> = {};
            salonResults.forEach(result => {
                if (result) {
                    newSalonNames[result.salonId] = result.salonName;
                }
            });

            if (Object.keys(newSalonNames).length > 0) {
                setSalonNames(prev => ({ ...prev, ...newSalonNames }));
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            Alert.alert("Error", "Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBookings();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const confirmCancel = (id: string) => {
        Alert.alert("Cancel Booking", "Are you sure you want to cancel?", [
            { text: "No", style: "cancel" },
            {
                text: "Yes",
                style: "destructive",
                onPress: () => {
                    setBookings((prev) => prev.filter((b) => b.id !== id));
                    Alert.alert("Cancelled", "Booking cancelled (demo only).");
                },
            },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                }}
            >
                <ActivityIndicator size="large" color={darkBrown} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            {/* Header */}
            <Header
                title="COSMIX"
                showBack={true}
                showMenu={true}
                onBackPress={() => router.back()}
            />

            <ScrollView
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* WELCOME SECTION */}
                <View style={{
                    backgroundColor: "#D7C3A7", // tan top section
                    paddingTop: 20,
                    paddingBottom: 40,
                    alignItems: "center",
                }}>
                    {/* Welcome message in arch-shaped panel */}
                    <View style={{
                        backgroundColor: "#F4EDE5",
                        width: 240,
                        height: 240,
                        borderTopLeftRadius: 180,
                        borderTopRightRadius: 180,
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 40,
                        shadowColor: "#423120",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                    }}>
                        <Text style={{
                            fontSize: 25,
                            fontFamily: "Philosopher-Bold",
                            color: "#423120",
                            textAlign: "center",
                            lineHeight: 30,
                        }}>
                            Tervetuloa,{"\n"}
                            {user?.firstName}!
                        </Text>
                    </View>
                </View>

                {/* Tulevat hoidot */}
                <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
                    <Text
                        style={{
                            fontSize: 25,
                            fontFamily: "Philosopher-Bold",
                            color: darkBrown,
                            borderBottomWidth: 1,
                            borderBottomColor: "#D9C7AF",
                            paddingBottom: 4,
                        }}
                    >
                        Tulevat hoidot
                    </Text>

                    {bookings.length === 0 ? (
                        <View
                            style={{
                                marginTop: 20,
                                padding: 20,
                                borderWidth: 1,
                                borderColor: "#D9C7AF",
                                borderRadius: 12,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{
                                color: "#666",
                                fontSize: 15,
                                fontFamily: "Philosopher-Regular"
                            }}>
                                Ei varauksia tällä hetkellä.
                            </Text>
                        </View>
                    ) : (
                        <View
                            style={{
                                marginTop: 16,
                                borderWidth: 1,
                                borderColor: "#D9C7AF",
                                borderRadius: 12,
                                paddingVertical: 12,
                            }}
                        >
                            {bookings.map((b, i) => {
                                const serviceName = getServiceName(b);
                                const salonName = getSalonName(b, salonNames);
                                const bookingDate = new Date(b.bookingTime);
                                const dateStr = bookingDate.toLocaleDateString("fi-FI", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "numeric",
                                    year: "numeric",
                                });
                                const timeStr = bookingDate.toLocaleTimeString("fi-FI", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });

                                return (
                                    <View
                                        key={b.id}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <View style={{ flex: 1, paddingRight: 8 }}>
                                            <Text
                                                style={{
                                                    fontSize: 17,
                                                    fontFamily: "Philosopher-Bold",
                                                    color: darkBrown,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                • {serviceName}
                                            </Text>
                                            <Text style={{
                                                color: "#666",
                                                fontSize: 15,
                                                fontFamily: "Philosopher-Regular",
                                                marginLeft: 12
                                            }}>{dateStr}</Text>
                                            <Text style={{
                                                color: "#666",
                                                fontSize: 15,
                                                fontFamily: "Philosopher-Regular",
                                                marginLeft: 12
                                            }}>
                                                klo {timeStr}
                                            </Text>
                                            <Text style={{
                                                color: "#666",
                                                fontSize: 15,
                                                marginTop: 2,
                                                fontFamily: "Philosopher-Regular",
                                                marginLeft: 12
                                            }}>
                                                {salonName} Salon
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => confirmCancel(b.id)}
                                            style={{
                                                backgroundColor: "#E9E2D8",
                                                borderRadius: 20,
                                                paddingHorizontal: 17,
                                                paddingVertical: 6,
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={{
                                                    color: darkBrown,
                                                    fontFamily: "Philosopher-Bold",
                                                    fontSize: 15,
                                                    textTransform: "lowercase",
                                                }}
                                            >
                                                peru
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}