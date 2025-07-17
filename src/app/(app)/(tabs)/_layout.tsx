import { Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "react-native";
import { useUser } from "@clerk/clerk-expo";

function Layout() {
    const { user } = useUser();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#423120", // Dark brown for active state
        tabBarInactiveTintColor: "#968469", // Light beige for inactive state
        tabBarStyle: {
          backgroundColor: "#F4EDE5", // Very light beige background
          borderTopColor: "#E0D7CA", // Hover color for border
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "900", // Bold weight as specified
          fontFamily: "Philosopher", // Your specified font
        },
      }}
    >
        <Tabs.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign 
              name="home" 
              color={focused ? "#423120" : "#D7C3A7"} 
              size={size} 
            />
          ),
        }} />
        
        {/* <Tabs.Screen 
        name="another" 
        options={{ 
          headerShown: false,
          title: "",
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign 
              name="book" 
              color={focused ? "#423120" : "#D7C3A7"} 
              size={size} 
            />
          ),
        }} /> */}
        
        <Tabs.Screen 
        name="service" 
        options={{ 
          headerShown: false,
          title: "Service",
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign 
              name="pluscircle" 
              color={focused ? "#423120" : "#968469"} 
              size={size} 
            />
          ),
        }} />
        
        {/* <Tabs.Screen 
        name="active-service" 
        options={{ 
          headerShown: false,
          title: "Active Service",
          href: null,
          tabBarStyle: {
            display: "none",
          },
        }} /> */}
        
        <Tabs.Screen 
        name="history" 
        options={{ 
          headerShown: false,
          title: "History",
          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign 
              name="clockcircleo" 
              color={focused ? "#423120" : "#968469"} 
              size={size} 
            />
          ),
        }} />
        
        <Tabs.Screen 
        name="profile" 
        options={{ 
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Image
              source={{
                uri: user?.imageUrl ?? user?.externalAccounts[0]?.imageUrl,
              }}
              className="rounded-full"
              style={{ 
                width: 28, 
                height: 28, 
                borderRadius: 100,
                borderWidth: focused ? 2 : 1,
                borderColor: focused ? "#423120" : "#968469",
              }}
            />
          ),
        }} 
        />
    </Tabs>
  );
}

export default Layout