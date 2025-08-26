import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import getCategories from "../actions/get-categories";
import { Category } from "../types";
import SideMenu from "../components/SideMenu";

const Categories: React.FC = () => {
    const navigation = useNavigation();
    const { width } = Dimensions.get("window");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMenuVisible, setMenuVisible] = useState(false);

    const buttonMargin = 8;
    const buttonBorderRadius = 30;
    const baseButtonColor = "#D7C3A7";
    const baseTextColor = "#423120";
    const baseFontSize = 16;
    const buttonHeight = 90;

    const [fontsLoaded] = useFonts({
        PhilosopherBold: require("../assets/fonts/Philosopher-Bold.ttf"),
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getCategories();
                setCategories(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch categories");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (!fontsLoaded) return null;

    const CategoryButton = ({
                                category,
                                style,
                            }: {
        category: Category;
        style?: any;
    }) => (
        <TouchableOpacity
            style={[
                {
                    backgroundColor: baseButtonColor,
                    borderRadius: buttonBorderRadius,
                    margin: buttonMargin,
                    alignItems: "center",
                    justifyContent: "center",
                    height: buttonHeight,
                },
                style,
            ]}
            onPress={() => {
                console.log(`Selected category: ${category.name}`);
            }}
        >
            <Text
                style={{
                    fontFamily: "PhilosopherBold",
                    fontSize: baseFontSize,
                    color: baseTextColor,
                    textAlign: "center",
                }}
            >
                {category.name}
            </Text>
        </TouchableOpacity>
    );

    // 🔥 Alternating row layout
    const createCategoryRows = () => {
        if (categories.length === 0) return null;

        const rows = [];
        let currentIndex = 0;

        const layoutPatterns = [
            { flex1: 1.5, flex2: 1 },
            { flex1: 1.1, flex2: 2 },
            { flex1: 1.8, flex2: 1 },
            { flex1: 1.2, flex2: 2 },
            { flex1: 2, flex2: 1.2 },
        ];

        while (currentIndex < categories.length) {
            const remainingCategories = categories.length - currentIndex;

            if (remainingCategories === 1) {
                rows.push(
                    <CategoryButton
                        key={categories[currentIndex].id}
                        category={categories[currentIndex]}
                        style={{ width: "95%", alignSelf: "center" }}
                    />
                );
                currentIndex++;
            } else {
                const patternIndex = Math.floor(currentIndex / 2) % layoutPatterns.length;
                const pattern = layoutPatterns[patternIndex];

                rows.push(
                    <View
                        key={`row-${currentIndex}`}
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <CategoryButton
                            category={categories[currentIndex]}
                            style={{
                                flex: pattern.flex1,
                                minWidth:
                                    width * (pattern.flex1 / (pattern.flex1 + pattern.flex2)) * 0.85 -
                                    buttonMargin * 2,
                            }}
                        />
                        {currentIndex + 1 < categories.length && (
                            <CategoryButton
                                category={categories[currentIndex + 1]}
                                style={{
                                    flex: pattern.flex2,
                                    minWidth:
                                        width *
                                        (pattern.flex2 / (pattern.flex1 + pattern.flex2)) *
                                        0.85 -
                                        buttonMargin * 2,
                                }}
                            />
                        )}
                    </View>
                );
                currentIndex += 2;
            }
        }

        return rows;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F4EDE5" }}>
            {/* Header */}
            <View style={{ marginVertical: 20, paddingHorizontal: 20 }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                        <Ionicons name="arrow-back" size={24} color={baseTextColor} />
                    </TouchableOpacity>

                    <Text
                        style={{
                            fontFamily: "PhilosopherBold",
                            fontSize: 24,
                            letterSpacing: 3,
                            color: baseTextColor,
                            textAlign: "center",
                        }}
                    >
                        COSMIX
                    </Text>

                    <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ padding: 4 }}>
                        <Ionicons name="menu" size={28} color={baseTextColor} />
                    </TouchableOpacity>
                </View>

                <Text
                    style={{
                        fontFamily: "PhilosopherBold",
                        fontSize: 20,
                        color: baseTextColor,
                        textAlign: "center",
                        marginTop: 8,
                    }}
                >
                    Kategoriat
                </Text>
            </View>

            {/* Loading State */}
            {loading && (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={baseTextColor} />
                    <Text
                        style={{
                            marginTop: 10,
                            fontFamily: "PhilosopherBold",
                            fontSize: 16,
                            color: baseTextColor,
                        }}
                    >
                        Loading categories...
                    </Text>
                </View>
            )}

            {/* Error State */}
            {error && (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text
                        style={{
                            fontFamily: "PhilosopherBold",
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
                            backgroundColor: baseButtonColor,
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 8,
                        }}
                        onPress={() => {
                            setError(null);
                            setLoading(true);
                            getCategories()
                                .then(setCategories)
                                .catch((err) => setError(err.message))
                                .finally(() => setLoading(false));
                        }}
                    >
                        <Text style={{ fontFamily: "PhilosopherBold", color: baseTextColor }}>
                            Retry
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Categories Alternating Grid */}
            {!loading && !error && categories.length > 0 && (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ paddingBottom: 20 }}>{createCategoryRows()}</View>
                </ScrollView>
            )}

            {!loading && !error && categories.length === 0 && (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text
                        style={{
                            fontFamily: "PhilosopherBold",
                            fontSize: 18,
                            color: baseTextColor,
                            textAlign: "center",
                        }}
                    >
                        No categories found
                    </Text>
                </View>
            )}

            {/* Side Menu Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isMenuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View
                        style={{
                            width: "80%",
                            height: "100%",
                            backgroundColor: "#F4EDE5",
                            alignSelf: "flex-end",
                        }}
                    >
                        <SideMenu onClose={() => setMenuVisible(false)} />
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

export default Categories;
