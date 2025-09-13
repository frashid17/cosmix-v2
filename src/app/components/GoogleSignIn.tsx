import React, { useCallback, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { View, TouchableOpacity, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync()
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()

export default function Page() {
  useWarmUpBrowser()

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO()

  const onGooglePress = useCallback(async () => {
    try {
      // Start the Google authentication process
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId })
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error('Google Sign In Error:', JSON.stringify(err, null, 2))
    }
  }, [])

  const onApplePress = useCallback(async () => {
    try {
      // Start the Apple authentication process
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_apple',
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId })
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error('Apple Sign In Error:', JSON.stringify(err, null, 2))
    }
  }, [])

  return (
    <View style={{ gap: 12 }}>
      {/* Apple Sign In Button */}
      <TouchableOpacity
        onPress={onApplePress}
        style={{
          backgroundColor: '#000000',
          borderRadius: 12,
          paddingVertical: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="logo-apple" size={20} color="#FFFFFF"/>
          <Text style={{ 
            color: '#FFFFFF', 
            fontWeight: '600', 
            fontSize: 16, 
            marginLeft: 12,
            fontFamily: 'Philosopher-Bold'
          }}>
            Continue with Apple
          </Text>
        </View>
      </TouchableOpacity>

      {/* Google Sign In Button */}
      <TouchableOpacity
        onPress={onGooglePress}
        style={{
          backgroundColor: '#FFFFFF',
          borderWidth: 2,
          borderColor: '#D7C3A7',
          borderRadius: 12,
          paddingVertical: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="logo-google" size={20} color="#EA4335"/>
          <Text style={{ 
            color: '#423120', 
            fontWeight: '600', 
            fontSize: 16, 
            marginLeft: 12,
            fontFamily: 'Philosopher-Bold'
          }}>
            Continue with Google
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}