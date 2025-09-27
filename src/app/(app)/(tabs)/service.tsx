import React, { useState } from "react";
import { 
  SafeAreaView, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  TextInput,
  FlatList
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All", color: "#423120" },
    { id: "massage", name: "Massage", color: "#D7C3A7" },
    { id: "facial", name: "Facial", color: "#E0D7CA" },
    { id: "body", name: "Body", color: "#968469" },
    { id: "nails", name: "Nails", color: "#F4EDE5" },
  ];

  const services = [
    {
      id: 1,
      name: "Swedish Massage",
      category: "Massage Therapy",
      price: 80,
      originalPrice: 100,
      duration: 60,
      rating: 4.9,
      reviews: 124,
      isPopular: true,
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop",
      benefits: ["Stress Relief", "Muscle Relaxation", "Improved Circulation"]
    },
    {
      id: 2,
      name: "Deep Cleansing Facial",
      category: "Facial Treatment",
      price: 65,
      duration: 45,
      rating: 4.8,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=200&fit=crop",
      benefits: ["Deep Cleansing", "Pore Minimizing", "Skin Brightening"]
    },
    {
      id: 3,
      name: "Hot Stone Therapy",
      category: "Massage Therapy",
      price: 95,
      duration: 75,
      rating: 4.9,
      reviews: 156,
      isPopular: true,
      image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300&h=200&fit=crop",
      benefits: ["Deep Relaxation", "Pain Relief", "Stress Reduction"]
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <CategoryFilter 
        categories={categories} 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory} 
      />
      <ServicesList services={services} />
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View className="px-6 py-4 bg-[#F4EDE5]">
      <View className="flex-row mt-7 items-center justify-between">
        <View>
          <Text className="text-[#423120] text-2xl font-bold font-[Philosopher]">
            Our Services
          </Text>
          <Text className="text-[#968469] font-[Philosopher]">
            Choose your perfect treatment
          </Text>
        </View>
        <TouchableOpacity className="bg-white p-3 rounded-full shadow-sm">
          <MaterialIcons name="filter-list" size={24} color="#423120" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SearchBar({ searchQuery, setSearchQuery }: any) {
  return (
    <View className="px-6 py-4">
      <View className="bg-[#F4EDE5] rounded-2xl flex-row items-center px-4 py-3">
        <AntDesign name="search1" size={20} color="#968469" />
        <TextInput
          className="flex-1 ml-3 font-[Philosopher] text-[#423120]"
          placeholder="Search services..."
          placeholderTextColor="#968469"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );
}

function CategoryFilter({ categories, activeCategory, setActiveCategory }: any) {
  return (
    <View className="px-6 mb-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setActiveCategory(category.id)}
            className={`mr-3 px-6 py-3 rounded-full ${
              activeCategory === category.id 
                ? 'bg-[#423120]' 
                : 'bg-[#F4EDE5]'
            }`}
          >
            <Text 
              className={`font-[Philosopher] font-bold ${
                activeCategory === category.id 
                  ? 'text-white' 
                  : 'text-[#423120]'
              }`}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function ServicesList({ services }: any) {
  const renderService = ({ item }: any) => (
    <TouchableOpacity className="mx-6 mb-6">
      <View className="bg-white rounded-3xl shadow-lg overflow-hidden border border-[#F4EDE5]">
        <View className="relative">
          <Image 
            source={{ uri: item.image }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <TouchableOpacity className="absolute top-4 right-4 bg-white/90 p-2 rounded-full">
            <AntDesign name="hearto" size={20} color="#423120" />
          </TouchableOpacity>
          {item.originalPrice && (
            <View className="absolute bottom-4 right-4 bg-red-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-bold font-[Philosopher]">
                SAVE ${item.originalPrice - item.price}
              </Text>
            </View>
          )}
        </View>
        
        <View className="p-6">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-[#423120] text-lg font-bold font-[Philosopher] mb-1">
                {item.name}
              </Text>
              <Text className="text-[#968469] font-[Philosopher]">
                {item.category}
              </Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center">
                {item.originalPrice && (
                  <Text className="text-[#968469] text-sm font-[Philosopher] line-through mr-2">
                    ${item.originalPrice}
                  </Text>
                )}
                <Text className="text-[#423120] text-xl font-bold font-[Philosopher]">
                  ${item.price}
                </Text>
              </View>
              <Text className="text-[#968469] text-sm font-[Philosopher]">
                {item.duration} minutes
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-3">
            <View className="flex-row items-center mr-4">
              <AntDesign name="star" size={16} color="#FFD700" />
              <Text className="text-[#423120] font-[Philosopher] ml-1">
                {item.rating}
              </Text>
              <Text className="text-[#968469] font-[Philosopher] ml-1">
                ({item.reviews} reviews)
              </Text>
            </View>
          </View>
          
          <View className="mb-4">
            <Text className="text-[#423120] font-bold font-[Philosopher] mb-2">
              Benefits:
            </Text>
            <View className="flex-row flex-wrap">
              {item.benefits.map((benefit: string, index: number) => (
                <View key={index} className="bg-[#E0D7CA] px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-[#423120] text-xs font-[Philosopher]">
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          <TouchableOpacity className="bg-[#423120] py-4 rounded-2xl">
            <Text className="text-white text-center font-bold font-[Philosopher]">
              Book This Service
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={services}
      renderItem={renderService}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}