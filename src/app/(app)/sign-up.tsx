import * as React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function GoogleSignIn() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Function to handle and display appropriate error messages
  const handleClerkError = (error) => {
    if (error.errors && error.errors.length > 0) {
      const firstError = error.errors[0];
      
      switch (firstError.code) {
        case 'form_password_pwned':
          Alert.alert(
            "Password Security Issue",
            "This password has been found in a data breach. Please choose a different, more secure password.",
            [{ text: "OK", style: "default" }]
          );
          break;
        case 'form_password_too_common':
          Alert.alert(
            "Password Too Common",
            "Please choose a more unique password that's harder to guess.",
            [{ text: "OK", style: "default" }]
          );
          break;
        case 'form_password_length_too_short':
          Alert.alert(
            "Password Too Short",
            "Password must be at least 8 characters long.",
            [{ text: "OK", style: "default" }]
          );
          break;
        case 'form_identifier_exists':
          Alert.alert(
            "Email Already Registered",
            "An account with this email already exists. Please try signing in instead.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Go to Sign In", onPress: () => router.push("/sign-in") }
            ]
          );
          break;
        case 'form_identifier_invalid':
          Alert.alert(
            "Invalid Email",
            "Please enter a valid email address.",
            [{ text: "OK", style: "default" }]
          );
          break;
        case 'form_password_validation_failed':
          Alert.alert(
            "Password Requirements",
            "Password must contain at least 8 characters with a mix of letters, numbers, and symbols.",
            [{ text: "OK", style: "default" }]
          );
          break;
        default:
          Alert.alert(
            "Sign Up Error",
            firstError.longMessage || firstError.message || "An unexpected error occurred. Please try again.",
            [{ text: "OK", style: "default" }]
          );
      }
    } else {
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  // Handle verification code errors
  const handleVerificationError = (error) => {
    if (error.errors && error.errors.length > 0) {
      const firstError = error.errors[0];
      
      switch (firstError.code) {
        case 'form_code_incorrect':
          Alert.alert(
            "Incorrect Code",
            "The verification code you entered is incorrect. Please try again.",
            [{ text: "OK", style: "default" }]
          );
          break;
        case 'form_code_expired':
          Alert.alert(
            "Code Expired",
            "The verification code has expired. Please request a new code.",
            [{ text: "OK", style: "default" }]
          );
          break;
        default:
          Alert.alert(
            "Verification Error",
            firstError.longMessage || firstError.message || "Failed to verify code. Please try again.",
            [{ text: "OK", style: "default" }]
          );
      }
    } else {
      Alert.alert(
        "Error",
        "Failed to verify code. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (!emailAddress || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    console.log(emailAddress, password);

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // Handle Clerk errors with user-friendly messages
      // Only log in development mode
      // if (__DEV__) {
      //   console.error(JSON.stringify(err, null, 2));
      // }
      handleClerkError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    if (!code) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }
    setIsLoading(true);
    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        if (__DEV__) {
          console.error(JSON.stringify(signUpAttempt, null, 2));
        }
        Alert.alert(
          "Verification Incomplete",
          "Please complete all required steps to verify your account.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (err) {
      // Handle verification errors
      if (__DEV__) {
        console.error(JSON.stringify(err, null, 2));
      }
      handleVerificationError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to resend verification code
  const onResendCode = async () => {
    if (!isLoaded) return;
    
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert(
        "Code Sent",
        "A new verification code has been sent to your email.",
        [{ text: "OK", style: "default" }]
      );
    } catch (err) {
      if (__DEV__) {
        console.error(JSON.stringify(err, null, 2));
      }
      Alert.alert(
        "Error",
        "Failed to resend verification code. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F4EDE5' }}>
       
          <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' }}>
            <View style={{ flex: 1, justifyContent: 'center', minHeight: 400 }}>
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: '#423120',
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="mail" size={40} color="#FFFFFF" />
                </View>
                <Text style={{ 
                  fontSize: 28, 
                  fontWeight: 'bold', 
                  color: '#423120', 
                  marginBottom: 8,
                  fontFamily: 'Philosopher-Bold'
                }}>
                  Check Your Email
                </Text>
                <Text style={{ 
                  fontSize: 16, 
                  color: '#423120', 
                  textAlign: 'center',
                  opacity: 0.8
                }}>
                  We've sent a verification code to {"\n"}
                  {emailAddress}
                </Text>
              </View>

              <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: '#D7C3A7'
              }}>
                <Text style={{ 
                  fontSize: 20, 
                  fontWeight: 'bold', 
                  color: '#423120', 
                  marginBottom: 24, 
                  textAlign: 'center',
                  fontFamily: 'Philosopher-Bold'
                }}>
                  Enter Verification Code
                </Text>
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: '#423120', 
                    marginBottom: 8,
                    fontFamily: 'Philosopher-Bold'
                  }}>
                    Verification Code
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F4EDE5',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderWidth: 1,
                    borderColor: '#D7C3A7'
                  }}>
                    <Ionicons name="key-outline" size={20} color="#423120" />
                    <TextInput
                      value={code}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#D7C3A7"
                      onChangeText={setCode}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        color: '#423120',
                        textAlign: 'center',
                        fontSize: 16,
                        letterSpacing: 4
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onVerifyPress}
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading ? '#D7C3A7' : '#423120',
                    borderRadius: 12,
                    paddingVertical: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                    marginBottom: 16
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {isLoading ? (
                      <Ionicons name="refresh" size={20} color="white" />
                    ) : (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="white"
                      />
                    )}
                    <Text style={{ 
                      color: 'white', 
                      fontWeight: '600', 
                      fontSize: 16, 
                      marginLeft: 8,
                      fontFamily: 'Philosopher-Bold'
                    }}>
                      {isLoading ? "Verifying..." : "Verify Email"}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ paddingVertical: 8 }}
                  onPress={onResendCode}
                  disabled={isLoading}
                >
                  <Text style={{ 
                    color: '#423120', 
                    fontWeight: '500', 
                    textAlign: 'center',
                    opacity: isLoading ? 0.5 : 0.8
                  }}>
                    Didn't receive the code? Resend
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ paddingBottom: 24 }}>
              <Text style={{ 
                textAlign: 'center', 
                color: '#423120', 
                fontSize: 12,
                opacity: 0.6
              }}>
                Almost ready to book your appointment!
              </Text>
            </View>
          </View>
        
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4EDE5' }}>
        <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'space-between' }}>
          <View style={{ flex: 1, justifyContent: 'center', minHeight: 500 }}>
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Text style={{ 
                fontSize: 28, 
                fontWeight: 'bold', 
                color: '#423120', 
                marginBottom: 8,
                fontFamily: 'Philosopher-Bold'
              }}>
                Join Cosmix
              </Text>
              <Text style={{ 
                fontSize: 16, 
                color: '#423120', 
                textAlign: 'center',
                opacity: 0.8
              }}>
                Book your beauty appointment{"\n"}and discover your perfect look
              </Text>
            </View>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: '#D7C3A7'
            }}>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: 'bold', 
                color: '#423120', 
                marginBottom: 24, 
                textAlign: 'center',
                fontFamily: 'Philosopher-Bold'
              }}>
                Create Your Account
              </Text>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600', 
                  color: '#423120', 
                  marginBottom: 8,
                  fontFamily: 'Philosopher-Bold'
                }}>
                  Email
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F4EDE5',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderWidth: 1,
                  borderColor: '#D7C3A7'
                }}>
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
                      color: '#423120'
                    }}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600', 
                  color: '#423120', 
                  marginBottom: 8,
                  fontFamily: 'Philosopher-Bold'
                }}>
                  Password
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F4EDE5',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderWidth: 1,
                  borderColor: '#D7C3A7'
                }}>
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
                      color: '#423120'
                    }}
                    editable={!isLoading}
                  />
                </View>
                <Text style={{ 
                  fontSize: 12, 
                  color: '#423120', 
                  marginTop: 4,
                  opacity: 0.6
                }}>
                  Must be at least 8 characters
                </Text>
              </View>
              <TouchableOpacity
                onPress={onSignUpPress}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#D7C3A7' : '#423120',
                  borderRadius: 12,
                  paddingVertical: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                  marginBottom: 16
                }}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  {isLoading ? (
                    <Ionicons name="refresh" size={20} color="white" />
                  ) : (
                    <Ionicons name="log-in-outline" size={20} color="white" />
                  )}
                  <Text style={{ 
                    color: 'white', 
                    fontWeight: '600', 
                    fontSize: 16, 
                    marginLeft: 8,
                    fontFamily: 'Philosopher-Bold'
                  }}>
                    {isLoading ? "Creating Account..." : "Sign Up"}
                  </Text>
                </View>
              </TouchableOpacity>
              <Text style={{ 
                fontSize: 12, 
                color: '#423120', 
                textAlign: 'center', 
                marginBottom: 16,
                opacity: 0.6
              }}>
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#423120', opacity: 0.8 }}>Already have an account? </Text>
              <Link href="/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={{ 
                    color: '#423120', 
                    fontWeight: '900',
                    fontFamily: 'Philosopher-Bold'
                  }}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
          {/* <View style={{ paddingBottom: 24 }}>
            <Text style={{ 
              textAlign: 'center', 
              color: '#423120', 
              fontSize: 12,
              opacity: 0.6
            }}>
              Ready to transform your beauty routine?
            </Text>
          </View> */}
        </View>
    </SafeAreaView>
  );
}