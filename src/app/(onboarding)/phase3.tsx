import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../../config/constants';

const darkBrown = '#423120';
const beige = '#D7C3A7';
const lightBeige = '#F4EDE5';
const white = '#FFFFFF';

export default function Phase3Screen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = await getTokenRef.current();
      const res = await fetch(`${API_BASE_URL}/provider/apply/phase3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
          'X-User-Token': token ?? '',
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `${res.status}`);
      }
      router.replace('/(onboarding)/pending' as any);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: beige }}>
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#888', marginBottom: 4 }}>Step 3 of 3</Text>
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 22, color: darkBrown }}>Add your services</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
          {[0, 1, 2].map(i => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: darkBrown }} />
          ))}
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: lightBeige, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="cut-outline" size={40} color={darkBrown} />
        </View>
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 20, color: darkBrown, textAlign: 'center', marginBottom: 12 }}>
          Set up your services
        </Text>
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
          Once approved, you'll add your services and pricing through your provider dashboard.{'\n\n'}
          For now, tap below to submit your application for final review.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: beige }}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{ backgroundColor: darkBrown, borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
        >
          {submitting
            ? <ActivityIndicator color={white} />
            : <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: white }}>Submit for review</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
