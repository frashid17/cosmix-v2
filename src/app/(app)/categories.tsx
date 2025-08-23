import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import getCategories from "../actions/get-categories";
import { Category } from "../types";


const Categories: React.FC = () => {
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buttonMargin = 6;
  const buttonBorderRadius = 30;
  const baseButtonColor = "#D7C3A7";
  const baseTextColor = "#423120";
  const baseFontSize = 16;
  const basePaddingVertical = 14;
  const basePaddingHorizontal = 24;

  const [fontsLoaded] = useFonts({
    PhilosopherBold: require("../assets/fonts/Philosopher-Bold.ttf"),
  });

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCategories();
        setCategories(data);
        console.log('Fetched categories:', data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const CategoryButton = ({ category, style }: { category: Category, style?: any }) => (
    <TouchableOpacity
      style={{
        backgroundColor: baseButtonColor,
        borderRadius: buttonBorderRadius,
        margin: buttonMargin,
        alignItems: "center",
        justifyContent: "center",
        height: 100,
        ...style,
      }}
      onPress={() => {
        console.log(`Selected category: ${category.name} (ID: ${category.id})`);
        // Add your navigation logic here
        // navigation.navigate('CategoryProducts', { categoryId: category.id });
      }}
    >
      <Text
        style={{
          fontFamily: "PhilosopherBold",
          fontSize: baseFontSize,
          color: baseTextColor,
          textAlign: "center",
          paddingVertical: basePaddingVertical,
          paddingHorizontal: basePaddingHorizontal,
        }}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  // Function to create rows dynamically based on the number of categories
  const createCategoryRows = () => {
    if (categories.length === 0) return null;

    const rows = [];
    let currentIndex = 0;

    // Define layout patterns for different numbers of categories
    const layoutPatterns = [
      // Pattern for rows of 2 items with varying flex ratios
      { flex1: 1.5, flex2: 1 },    // Row 1: larger + smaller
      { flex1: 1.1, flex2: 2 },      // Row 2: smaller + larger
      { flex1: 1.8, flex2: 1 },    // Row 3: larger + smaller
      { flex1: 1.2, flex2: 2 },      // Row 4: smaller + larger
      { flex1: 2, flex2: 1.2 },      // Row 5: larger + smaller
    ];

    while (currentIndex < categories.length) {
      const remainingCategories = categories.length - currentIndex;
      
      if (remainingCategories === 1) {
        // Single category - full width
        rows.push(
          <CategoryButton
            key={categories[currentIndex].id}
            category={categories[currentIndex]}
            style={{ width: "95%", alignSelf: "center" }}
          />
        );
        currentIndex++;
      } else {
        // Two categories in a row
        const patternIndex = Math.floor(currentIndex / 2) % layoutPatterns.length;
        const pattern = layoutPatterns[patternIndex];
        
        rows.push(
          <View key={`row-${currentIndex}`} style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            <CategoryButton
              category={categories[currentIndex]}
              style={{ 
                flex: pattern.flex1, 
                minWidth: (width * (pattern.flex1 / (pattern.flex1 + pattern.flex2)) * 0.85) - (buttonMargin * 2), 
                maxWidth: "auto" 
              }}
            />
            {currentIndex + 1 < categories.length && (
              <CategoryButton
                category={categories[currentIndex + 1]}
                style={{ 
                  flex: pattern.flex2, 
                  minWidth: (width * (pattern.flex2 / (pattern.flex1 + pattern.flex2)) * 0.85) - (buttonMargin * 2), 
                  maxWidth: "auto" 
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
    <View style={{ flex: 1, backgroundColor: "#F4EDE5", paddingHorizontal: 20 }}>
      {/* Header */}
      <View className="mt-9" style={{ flexDirection: "row", alignItems: "center", marginVertical: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={baseTextColor} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "PhilosopherBold",
            fontSize: 22,
            color: baseTextColor,
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
              // Retry fetching
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

      {/* Categories List with Custom Layout */}
      {!loading && !error && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: "column", alignItems: "center", paddingBottom: 20 }}>
            {createCategoryRows()}
          </View>
        </ScrollView>
      )}

      {/* Empty State */}
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
    </View>
  );
};

export default Categories;