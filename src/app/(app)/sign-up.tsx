import * as React from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { createUser } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";

export default function SignUp() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { fetchAuthenticatedUser } = useAuthStore();

  const [name, setName] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isMenuVisible, setMenuVisible] = React.useState(false);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!name || !emailAddress || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await createUser({ email: emailAddress, password, name });
      // Refresh the auth state
      await fetchAuthenticatedUser();
      Alert.alert("Success", "Account created successfully!");
      router.replace("/");
    } catch (err: any) {
      console.error('Sign up error:', err);
      Alert.alert("Error", err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4EDE5' }}>
      <Header
        title="COSMIX"
        showBack={true}
        showMenu={true}
        onBackPress={() => router.back()}
        onMenuPress={() => setMenuVisible(true)}
      />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          width: 327,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 0,
          borderWidth: 2,
          borderColor: '#D7C3A7',
          overflow: 'hidden',
        }}>
          {/* Title with separator line */}
          <View style={{
            paddingHorizontal: 17,
            paddingTop: 24,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#D7C3A7',
          }}>
            <Text style={{
              fontSize: 32,
              color: '#423120',
              fontFamily: 'Philosopher-Bold'
            }}>
              Luo tili
            </Text>
          </View>

          {/* Form Content */}
          <View style={{ paddingHorizontal: 17, paddingTop: 24, paddingBottom: 24 }}>

            {/* Form Fields */}
            <View>
              {/* Name Field */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#423120',
                  marginBottom: 8,
                  fontFamily: 'Philosopher-Bold'
                }}>
                  Nimi
                </Text>
                <TextInput
                  value={name}
                  placeholder="Kirjoita nimesi"
                  placeholderTextColor="#A89B8C"
                  onChangeText={setName}
                  style={{
                    width: 293,
                    height: 47,
                    backgroundColor: '#F4EDE5',
                    borderRadius: 20,
                    paddingHorizontal: 20,
                    fontSize: 16,
                    color: '#423120',
                    fontFamily: 'Philosopher-Regular'
                  }}
                  editable={!isLoading}
                />
              </View>

              {/* Email Field */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#423120',
                  marginBottom: 8,
                  fontFamily: 'Philosopher-Bold'
                }}>
                  Sähköpostiosoite
                </Text>
                <TextInput
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Kirjoita sähköpostiosoitteesi"
                  placeholderTextColor="#A89B8C"
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                  style={{
                    width: 293,
                    height: 47,
                    backgroundColor: '#F4EDE5',
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
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#423120',
                  marginBottom: 8,
                  fontFamily: 'Philosopher-Bold'
                }}>
                  salasana
                </Text>
                <TextInput
                  value={password}
                  placeholder="Kirjoita salasanasi"
                  placeholderTextColor="#A89B8C"
                  secureTextEntry={true}
                  onChangeText={setPassword}
                  style={{
                    width: 293,
                    height: 47,
                    backgroundColor: '#F4EDE5',
                    borderRadius: 20,
                    paddingHorizontal: 20,
                    fontSize: 16,
                    color: '#423120',
                    fontFamily: 'Philosopher-Regular'
                  }}
                  editable={!isLoading}
                />
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={onSignUpPress}
                disabled={isLoading}
                style={{
                  width: 293,
                  height: 47,
                  backgroundColor: isLoading ? '#5C4A3A' : '#423120',
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 18,
                  fontFamily: 'Philosopher-Bold'
                }}>
                  {isLoading ? "Luodaan..." : "Rekisteröidy"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sign In Link */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 24
        }}>
          <Text style={{ color: '#423120', opacity: 0.8, fontSize: 15 }}>
            Onko sinulla jo tili?{" "}
          </Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Text style={{
                color: '#423120',
                fontWeight: '900',
                fontFamily: 'Philosopher-Bold',
                fontSize: 15,
                textDecorationLine: 'underline'
              }}>
                Kirjaudu sisään
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

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
}