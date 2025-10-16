import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import GoogleSignIn from "../components/GoogleSignIn";
import { Ionicons } from "@expo/vector-icons";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string }>();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [password, setPassword] = React.useState("");

  const redirectTo = () => {
    let dest = typeof params.redirect === 'string' && params.redirect.length > 0 ? params.redirect : '/';
    try {
      dest = decodeURIComponent(dest);
    } catch {}
    router.replace(dest);
  };

  const onSignInPress = async () => {
    if (!isLoaded) return;
    if (!emailAddress || !password) {
      Alert.alert("Error", "please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        redirectTo();
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4EDE5" }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#423120",
                marginBottom: 8,
                fontFamily: "Philosopher-Bold",
              }}
            >
              Cosmix
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#423120",
                textAlign: "center",
                opacity: 0.8,
              }}
            >
              Book your beauty appointment{"\n"}and discover your perfect look
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 15,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "#D7C3A7",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#423120",
                marginBottom: 24,
                textAlign: "center",
                fontFamily: "Philosopher-Bold",
              }}
            >
              Welcome Back
            </Text>
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#423120",
                  marginBottom: 8,
                  fontFamily: "Philosopher-Bold",
                }}
              >
                Email
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F4EDE5",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderWidth: 1,
                  borderColor: "#D7C3A7",
                }}
              >
                <Ionicons name="mail-outline" size={20} color="#423120" />
                <TextInput
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Enter your email"
                  placeholderTextColor="#D7C3A7"
                  onChangeText={setEmailAddress}
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    color: "#423120",
                  }}
                  editable={!isLoading}
                />
              </View>
            </View>
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#423120",
                  marginBottom: 8,
                  fontFamily: "Philosopher-Bold",
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F4EDE5",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderWidth: 1,
                  borderColor: "#D7C3A7",
                }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#423120"
                />
                <TextInput
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor="#D7C3A7"
                  secureTextEntry={true}
                  onChangeText={setPassword}
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    color: "#423120",
                    height: 40,
                  }}
                  editable={!isLoading}
                />
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={onSignInPress}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? "#D7C3A7" : "#423120",
              borderRadius: 12,
              paddingVertical: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              marginBottom: 16,
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoading ? (
                <Ionicons name="refresh" size={20} color="white" />
              ) : (
                <Ionicons name="log-in-outline" size={20} color="white" />
              )}
              <Text
                style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: 16,
                  marginLeft: 8,
                  fontFamily: "Philosopher-Bold",
                }}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </View>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 16,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "#D7C3A7" }} />
            <Text
              style={{
                paddingHorizontal: 16,
                color: "#423120",
                fontSize: 14,
                opacity: 0.6,
              }}
            >
              Or
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#D7C3A7" }} />
          </View>
          <GoogleSignIn onSignedIn={redirectTo} />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ color: "#423120", opacity: 0.8 }}>
            Don't have an account?{" "}
          </Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text
                style={{
                  color: "#423120",
                  fontWeight: "900",
                  fontFamily: "Philosopher-Bold",
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
