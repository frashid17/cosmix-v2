import React, { useEffect, useCallback, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../config/constants';

const ADMIN_API_KEY = process.env.EXPO_PUBLIC_ADMIN_API_KEY || '';
const darkBrown = '#423120';
const white = '#FFFFFF';

export default function Phase3Screen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [error, setError] = useState(false);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const activate = useCallback(async () => {
    setError(false);
    try {
      const token = await getTokenRef.current();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_API_KEY}`,
      };
      if (token) headers['X-User-Token'] = token;
      const res = await fetch(`${API_BASE_URL}/provider/apply/phase3`, { method: 'POST', headers });
      if (!res.ok) throw new Error();
      router.replace('/(provider)/bookings' as any);
    } catch {
      setError(true);
    }
  }, [router]);

  useEffect(() => { activate(); }, [activate]);

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <Ionicons name="alert-circle-outline" size={48} color="#c00" style={{ marginBottom: 16 }} />
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 18, color: darkBrown, textAlign: 'center', marginBottom: 8 }}>
          Something went wrong
        </Text>
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 }}>
          We couldn't activate your account. Please try again.
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={activate}
          style={{ backgroundColor: darkBrown, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 }}
        >
          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 15, color: white }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={darkBrown} />
      <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#888', marginTop: 12 }}>
        Activating your account…
      </Text>
    </SafeAreaView>
  );
}
