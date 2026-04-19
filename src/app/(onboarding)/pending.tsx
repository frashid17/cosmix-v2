import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../../config/constants';

const darkBrown = '#423120';
const beige = '#D7C3A7';
const lightBeige = '#F4EDE5';
const white = '#FFFFFF';
const yellow = '#b07d00';

const STATUS_MESSAGES: Record<string, string> = {
  PHASE1_PENDING: "We're reviewing your expression of interest.",
  PHASE2_PENDING: "We're verifying your documents and contract.",
  PHASE3_PENDING: "We're reviewing your service listings.",
};

const STATUS_NEXT_ROUTES: Record<string, string> = {
  PHASE1_APPROVED: '/(onboarding)/phase2',
  PHASE2_APPROVED: '/(onboarding)/phase3',
  ACTIVE: '/(provider)/bookings',
  REJECTED: '/(onboarding)/rejected',
};

export default function PendingScreen() {
  const router = useRouter();
  const { getToken, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [status, setStatus] = React.useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const token = await getTokenRef.current();
      const res = await fetch(`${API_BASE_URL}/provider/apply/status`, {
        headers: {
          Authorization: `Bearer ${token ?? ''}`,
          'X-User-Token': token ?? '',
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      const s: string = data.status;
      setStatus(s);

      const nextRoute = STATUS_NEXT_ROUTES[s];
      if (nextRoute) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        router.replace(nextRoute as any);
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    checkStatus();
    intervalRef.current = setInterval(checkStatus, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkStatus]);

  const message = status ? STATUS_MESSAGES[status] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <View style={{
          width: 96, height: 96, borderRadius: 48,
          backgroundColor: lightBeige, justifyContent: 'center', alignItems: 'center', marginBottom: 24,
        }}>
          <Ionicons name="time-outline" size={48} color={yellow} />
        </View>

        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 24, color: darkBrown, textAlign: 'center', marginBottom: 12 }}>
          Application under review
        </Text>

        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 10 }}>
          {message ?? "We'll review your application and get back to you within 2–3 business days."}
        </Text>

        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#aaa', textAlign: 'center', lineHeight: 18 }}>
          This page checks for updates automatically. You'll be redirected as soon as we process your application.
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24 }}>
          <ActivityIndicator size="small" color={beige} />
          <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#bbb' }}>Checking for updates…</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          onPress={() => signOut()}
          style={{ borderWidth: 1.5, borderColor: beige, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 15, color: darkBrown }}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
