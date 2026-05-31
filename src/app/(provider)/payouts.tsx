import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../../config/constants';

const ADMIN_API_KEY = process.env.EXPO_PUBLIC_ADMIN_API_KEY || '';

const darkBrown = '#423120';
const beige = '#D7C3A7';
const lightBeige = '#F4EDE5';
const white = '#FFFFFF';
const green = '#2d7a2d';

type PayoutData = {
  pendingBalance: number;
  totalRevenue: number;
  platformFee: number;
  platformFeeRate: number;
  bookingsCount: number;
  iban: string | null;
  bankAccountName: string | null;
};

const formatEur = (n: number) =>
  new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' }).format(n);

const formatIbanForDisplay = (iban: string) =>
  iban.replace(/(.{4})/g, '$1 ').trim();

export default function ProviderPayoutsScreen() {
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchPayout = useCallback(async () => {
    try {
      const token = await getTokenRef.current();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${ADMIN_API_KEY}`,
      };
      if (token) headers['X-User-Token'] = token;

      const res = await fetch(`${API_BASE_URL}/provider/revenue`, { headers });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();

      setData({
        pendingBalance: json.pendingBalance ?? 0,
        totalRevenue: json.totalRevenue ?? 0,
        platformFee: json.platformFee ?? 0,
        platformFeeRate: json.platformFeeRate ?? 0.10,
        bookingsCount: json.bookingsCount ?? 0,
        iban: json.payout?.iban ?? null,
        bankAccountName: json.payout?.bankAccountName ?? null,
      });
    } catch (err) {
      console.log('[Payouts] fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPayout(); }, [fetchPayout]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={darkBrown} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      {/* Hero */}
      <View style={{ backgroundColor: beige, paddingTop: 16, paddingBottom: 28, alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: lightBeige,
            width: 200,
            height: 200,
            borderTopLeftRadius: 160,
            borderTopRightRadius: 160,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 16,
          }}
        >
          <Ionicons name="card-outline" size={28} color={darkBrown} style={{ marginBottom: 6 }} />
          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 22, color: darkBrown }}>Payouts</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 80, paddingTop: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchPayout(); }}
            tintColor={darkBrown}
          />
        }
      >
        {/* Pending balance */}
        <View style={{ borderWidth: 2, borderColor: green, borderRadius: 16, padding: 20, backgroundColor: '#f0fff0', marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 12, color: green, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Pending balance
          </Text>
          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 36, color: darkBrown, marginBottom: 6 }}>
            {formatEur(data?.pendingBalance ?? 0)}
          </Text>
          <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#555' }}>
            From {data?.bookingsCount ?? 0} bookings · after {Math.round((data?.platformFeeRate ?? 0.10) * 100)}% platform fee
          </Text>
        </View>

        {/* Schedule */}
        <View style={{ borderWidth: 2, borderColor: beige, borderRadius: 16, padding: 20, backgroundColor: lightBeige, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="calendar-outline" size={20} color={darkBrown} style={{ marginRight: 8 }} />
            <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: darkBrown }}>
              Payout schedule
            </Text>
          </View>
          <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#555', lineHeight: 20 }}>
            Payouts are processed manually every Friday via SEPA bank transfer.
          </Text>
        </View>

        {/* Bank details */}
        <View style={{ borderWidth: 2, borderColor: beige, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Ionicons name="business-outline" size={20} color={darkBrown} style={{ marginRight: 8 }} />
            <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: darkBrown }}>
              Bank account
            </Text>
          </View>
          <Row label="Holder" value={data?.bankAccountName ?? '—'} />
          <Row label="IBAN" value={data?.iban ? formatIbanForDisplay(data.iban) : '—'} mono />
          <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#888', marginTop: 10 }}>
            To update your bank details, contact support.
          </Text>
        </View>

        {/* Breakdown */}
        <View style={{ borderWidth: 2, borderColor: beige, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: darkBrown, marginBottom: 14 }}>
            Breakdown
          </Text>
          <Row label="Total revenue" value={formatEur(data?.totalRevenue ?? 0)} />
          <Row label="Platform fee" value={`− ${formatEur(data?.platformFee ?? 0)}`} />
          <View style={{ height: 1, backgroundColor: beige, marginVertical: 10 }} />
          <Row label="Your payout" value={formatEur(data?.pendingBalance ?? 0)} bold />
        </View>

        {/* Info bullets */}
        <View style={{ marginTop: 4, gap: 12 }}>
          {[
            { icon: 'shield-checkmark-outline', text: 'Cosmix processes manual SEPA transfers to your IBAN.' },
            { icon: 'time-outline', text: 'Funds typically arrive within 1–2 business days after Friday’s transfer.' },
            { icon: 'help-circle-outline', text: 'Questions about a payout? Contact support@cosmix.fi.' },
          ].map(({ icon, text }) => (
            <View key={icon} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Ionicons name={icon as any} size={16} color={darkBrown} style={{ marginTop: 2 }} />
              <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#666', flex: 1, lineHeight: 18 }}>
                {text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#666' }}>{label}</Text>
      <Text
        style={{
          fontFamily: bold ? 'Philosopher-Bold' : 'Philosopher-Regular',
          fontSize: bold ? 16 : 14,
          color: darkBrown,
          fontVariant: mono ? ['tabular-nums'] : undefined,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
