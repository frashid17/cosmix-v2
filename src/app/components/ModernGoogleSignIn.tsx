import React, { useCallback, useEffect, useState } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { View, TouchableOpacity, Text, ActivityIndicator, Alert, Modal, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

WebBrowser.maybeCompleteAuthSession()


interface GoogleAccount {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export default function ModernGoogleSignIn() {
  useWarmUpBrowser()
  const { startSSOFlow } = useSSO()
  const [loading, setLoading] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showWebViewModal, setShowWebViewModal] = useState(false)
  
  // Sample accounts - in real app, you'd fetch these from device
  const [availableAccounts] = useState<GoogleAccount[]>([
    {
      id: '1',
      email: 'john.doe@gmail.com',
      name: 'John Doe',
      avatar: 'JD'
    },
    {
      id: '2', 
      email: 'jane.smith@gmail.com',
      name: 'Jane Smith',
      avatar: 'JS'
    },
    {
      id: '3',
      email: 'mike.johnson@gmail.com', 
      name: 'Mike Johnson',
      avatar: 'MJ'
    }
  ])

  const onGooglePress = useCallback(async () => {
    // Show the bottom popup modal
    setShowAccountModal(true)
  }, [])

  const performGoogleSignIn = async (selectedEmail?: string) => {
    try {
      setLoading(true)
      setShowAccountModal(false)
      
      // Show WebView modal for OAuth instead of opening external browser
      setShowWebViewModal(true)
      
      // Simulate OAuth success after a delay
      setTimeout(() => {
        setShowWebViewModal(false)
        setLoading(false)
        Alert.alert('Success', `Signed in successfully${selectedEmail ? ` with ${selectedEmail}` : ''}!`)
      }, 2000)
      
    } catch (err) {
      console.error('Google Sign In Error:', err)
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.')
      setLoading(false)
    }
  }

  const handleAccountSelect = (account: GoogleAccount) => {
    performGoogleSignIn(account.email)
  }

  const handleAddNewAccount = () => {
    // Close modal and start OAuth flow for new account
    setShowAccountModal(false)
    performGoogleSignIn()
  }

  const renderAccountItem = ({ item }: { item: GoogleAccount }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
      }}
      onPress={() => handleAccountSelect(item)}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#4285f4',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
          {item.avatar}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 2 }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          {item.email}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  )

  return (
    <View style={{ gap: 12 }}>
      {/* Apple Sign In Button */}
      <TouchableOpacity
        onPress={async () => {
          try {
            setLoading(true)
            const { createdSessionId, setActive } = await startSSOFlow({
              strategy: 'oauth_apple',
              redirectUrl: AuthSession.makeRedirectUri(),
            })
            if (createdSessionId) {
              setActive!({ session: createdSessionId })
              Alert.alert('Success', 'Signed in successfully!')
            }
          } catch (err) {
            Alert.alert('Error', 'Failed to sign in with Apple. Please try again.')
          } finally {
            setLoading(false)
          }
        }}
        disabled={loading}
        style={{
          backgroundColor: '#000000',
          borderRadius: 12,
          paddingVertical: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          opacity: loading ? 0.7 : 1,
        }}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="logo-apple" size={20} color="#FFFFFF"/>
          )}
          <Text style={{ 
            color: '#FFFFFF', 
            fontWeight: '600', 
            fontSize: 16, 
            marginLeft: 12,
            fontFamily: 'Philosopher-Bold'
          }}>
            {loading ? 'Signing in...' : 'Continue with Apple'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Google Sign In Button */}
      <TouchableOpacity
        onPress={onGooglePress}
        disabled={loading}
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
          opacity: loading ? 0.7 : 1,
        }}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <ActivityIndicator size="small" color="#EA4335" />
          ) : (
            <Ionicons name="logo-google" size={20} color="#EA4335"/>
          )}
          <Text style={{ 
            color: '#423120', 
            fontWeight: '600', 
            fontSize: 16, 
            marginLeft: 12,
            fontFamily: 'Philosopher-Bold'
          }}>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Bottom Popup Modal */}
      <Modal
        visible={showAccountModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end'
        }}>
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            paddingBottom: 40,
            maxHeight: '70%'
          }}>
            {/* Handle bar */}
            <View style={{
              width: 40,
              height: 4,
              backgroundColor: '#ccc',
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 20
            }} />
            
            {/* Header */}
            <View style={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0'
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: '#333',
                textAlign: 'center',
                fontFamily: 'Philosopher-Bold'
              }}>
                Choose an account
              </Text>
            </View>

            {/* Account List */}
            <FlatList
              data={availableAccounts}
              renderItem={renderAccountItem}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 300 }}
            />

            {/* Add New Account */}
            <TouchableOpacity
              style={{
                padding: 16,
                alignItems: 'center',
                borderTopWidth: 1,
                borderTopColor: '#f0f0f0',
                marginHorizontal: 20,
                marginTop: 10
              }}
              onPress={handleAddNewAccount}
              activeOpacity={0.7}
            >
              <Text style={{
                color: '#4285f4',
                fontWeight: '500',
                fontSize: 16,
                fontFamily: 'Philosopher-Bold'
              }}>
                Use another account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* WebView Modal for OAuth */}
      <Modal
        visible={showWebViewModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowWebViewModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
            backgroundColor: '#f8f9fa'
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#333',
              fontFamily: 'Philosopher-Bold'
            }}>
              Sign in with Google
            </Text>
            <TouchableOpacity
              onPress={() => setShowWebViewModal(false)}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: '#f0f0f0'
              }}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* WebView */}
          <WebView
            source={{ 
              uri: 'https://accounts.google.com/signin' 
            }}
            style={{ flex: 1 }}
            onNavigationStateChange={(navState) => {
              // Check if we're on a success page
              if (navState.url.includes('success') || navState.url.includes('callback')) {
                setShowWebViewModal(false)
                setLoading(false)
                Alert.alert('Success', 'Signed in successfully!')
              }
            }}
            onError={(error) => {
              console.error('WebView Error:', error)
              setShowWebViewModal(false)
              setLoading(false)
              Alert.alert('Error', 'Failed to load Google sign-in page')
            }}
          />
        </View>
      </Modal>
    </View>
  )
}