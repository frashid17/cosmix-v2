import { Link, useRouter, useLocalSearchParams } from "expo-router";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { signIn } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";

export default function SignIn() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string }>();
  const { fetchAuthenticatedUser } = useAuthStore();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [isMenuVisible, setMenuVisible] = React.useState(false);

  const redirectTo = () => {
    let dest = typeof params.redirect === 'string' && params.redirect.length > 0 ? params.redirect : '/';
    try {
      dest = decodeURIComponent(dest);
    } catch {}
    router.replace(dest);
  };

  const onSignInPress = async () => {
    if (!emailAddress || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      await signIn({ email: emailAddress, password });
      // Refresh the auth state
      await fetchAuthenticatedUser();
      Alert.alert("Success", "Signed in successfully!");
      redirectTo();
    } catch (err: any) {
      console.error('Sign in error:', err);
      Alert.alert("Error", err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#D7C3A7" }}>
      <Header 
        title="COSMIX"
        showBack={true}
        showMenu={true}
        onBackPress={() => router.back()}
        onMenuPress={() => setMenuVisible(true)}
      />
      
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Arch-shaped container */}
        <View style={{
          width: 300,
          height: 350,
          backgroundColor: '#F4EDE5',
          borderTopLeftRadius: 150,
          borderTopRightRadius: 150,
          paddingHorizontal: 24,
          paddingTop: 80,
          paddingBottom: 30,
          marginBottom: 24,
          justifyContent: 'center',
        }}>
          {/* Email Field */}
          <View style={{ marginBottom: 20 }}>
           
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="syötä sähköpostiosoite"
              placeholderTextColor="#A89B8C"
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              style={{
                width: '100%',
                height: 47,
                backgroundColor: '#D7C3A7',
                borderRadius: 20,
                paddingHorizontal: 20,
                fontSize: 16,
                color: '#423120',
                fontFamily: 'Philosopher-Regular'
              }}
              editable={!isLoading}
            />
          </View>

          {/* Password Field */}
          <View>
           
            <TextInput
              value={password}
              placeholder="Salasanasyötä salasana"
              placeholderTextColor="#A89B8C"
              secureTextEntry={true}
              onChangeText={setPassword}
              style={{
                width: '100%',
                height: 47,
                backgroundColor: '#D7C3A7',
                borderRadius: 20,
                paddingHorizontal: 20,
                fontSize: 16,
                color: '#423120',
                fontFamily: 'Philosopher-Regular'
              }}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Sign In Button - Outside the arch */}
        <TouchableOpacity
          onPress={onSignInPress}
          disabled={isLoading}
          style={{
            width: 181,
            height: 55,
            backgroundColor: '#F4EDE5',
            borderRadius: 27.5,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ 
            color: '#423120', 
            fontSize: 18, 
            fontFamily: 'Philosopher-Bold'
          }}>
            {isLoading ? "Kirjaudutaan..." : "Kirjaudu sisään"}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          alignItems: 'center',
        }}>
          <Text style={{ color: '#423120', opacity: 0.8, fontSize: 18, fontFamily: 'Philosopher-Regular' }}>
            Ei tiliä?{" "}
          </Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={{ 
                color: '#423120', 
                fontFamily: 'Philosopher-Bold',
                fontSize: 18,
                textDecorationLine: 'underline'
              }}>
                Luo tili
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

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
