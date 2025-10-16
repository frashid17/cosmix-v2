import React, { useCallback, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { View, TouchableOpacity, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

WebBrowser.maybeCompleteAuthSession()

export default function GoogleSignIn({ onSignedIn }: { onSignedIn?: () => void }) {
  useWarmUpBrowser()

  const { startSSOFlow } = useSSO()

  const onGooglePress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      if (createdSessionId) {
        setActive!({ session: createdSessionId })
        onSignedIn?.()
      }
    } catch (err) {
      console.error('Google Sign In Error:', JSON.stringify(err, null, 2))
    }
  }, [startSSOFlow, onSignedIn])

  const onApplePress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_apple',
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      if (createdSessionId) {
        setActive!({ session: createdSessionId })
        onSignedIn?.()
      }
    } catch (err) {
      console.error('Apple Sign In Error:', JSON.stringify(err, null, 2))
    }
  }, [startSSOFlow, onSignedIn])

  return (
    <View style={{ gap: 12 }}>
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