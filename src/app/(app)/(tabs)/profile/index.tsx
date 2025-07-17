import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Animated from 'react-native-reanimated';

const { ScrollView } = Animated;

export default function ProfilepPage() {
  const  { signOut } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date();
  const daysSinceJoining = Math.floor(
    (new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
  };

    const handleSignOut = () => {
      Alert.alert("Sign Out", "Are you sure you wanna sign out?", [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => signOut(),
        },
      ]);
    };

    // Fixed: Change condition to check if loading is true
    if (loading) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F4EDE5' }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#423120" />
          </View>
        </SafeAreaView>
      )
    }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4EDE5' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#423120' }}>My Profile</Text>
          <Text style={{ fontSize: 18, color: '#423120', marginTop: 4, opacity: 0.8 }}>
            Your beauty & wellness journey
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 16, 
            padding: 24, 
            shadowColor: '#423120',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: '#E0D7CA'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ 
                width: 64, 
                height: 64, 
                backgroundColor: '#D7C3A7', 
                borderRadius: 32, 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: 16 
              }}>
                <Image 
                  source={{
                    uri: user.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
                  }}
                  style={{ width: 64, height: 64, borderRadius: 32 }}       
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: '600', color: '#423120' }}>
                  {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                : user?.firstName || "User"}
                </Text>
                <Text style={{ color: '#423120', opacity: 0.7 }}>
                  {user?.emailAddresses?.[0]?.emailAddress}
                </Text>
                <Text style={{ fontSize: 14, color: '#423120', marginTop: 4, opacity: 0.6 }}>
                  Client since {formatJoinDate(joinDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 16, 
            padding: 24, 
            shadowColor: '#423120',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: '#E0D7CA'
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#423120', marginBottom: 16 }}>
              Your Beauty Stats
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#423120' }}>
                  12
                </Text>
                <Text style={{ fontSize: 14, color: '#423120', textAlign: 'center', opacity: 0.7 }}>
                  Total{"\n"}Bookings
                </Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#423120' }}>
                  28h
                </Text>
                <Text style={{ fontSize: 14, color: '#423120', textAlign: 'center', opacity: 0.7 }}>
                  Relaxation{"\n"}Time
                </Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#423120' }}>
                  {daysSinceJoining}
                </Text>
                <Text style={{ fontSize: 14, color: '#423120', textAlign: 'center', opacity: 0.7 }}> 
                  Days as{"\n"}Client
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={{ 
              backgroundColor: '#423120', 
              borderRadius: 16, 
              padding: 16, 
              shadowColor: '#423120',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 18, marginLeft: 8 }}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}