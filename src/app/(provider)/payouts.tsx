import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../../config/constants';

const darkBrown = '#423120';
const beige = '#D7C3A7';
const lightBeige = '#F4EDE5';
const white = '#FFFFFF';
const green = '#2d7a2d';

type AccountStatus = 'loading' | 'not_connected' | 'incomplete' | 'active';

type StatusData = {
  status: AccountStatus;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
};

export default function ProviderPayoutsScreen() {
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();

  const [statusData, setStatusData] = useState<StatusData>({ status: 'loading' });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const buildHeaders = async (): Promise<Record<string, string>> => {
    const token = await getTokenRef.current();
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
    };
    if (token) h['X-User-Token'] = token;
    return h;
  };

  const checkStatus = async () => {
    try {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/stripe/account-session`, { headers });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setStatusData(data);
    } catch {
      setStatusData({ status: 'not_connected' });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetup = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const headers = await buildHeaders();
      console.log('[Payouts] Authorization header set:', !!headers['X-User-Token']);
      console.log('[Payouts] Calling POST', `${API_BASE_URL}/stripe/account-session`);

      const res = await fetch(`${API_BASE_URL}/stripe/account-session`, {
        method: 'POST',
        headers,
      });

      console.log('[Payouts] POST response status:', res.status);

      if (!res.ok) {
        const body = await res.text();
        console.log('[Payouts] POST error body:', body);
        throw new Error(`${res.status}`);
      }

      const data = await res.json();
      console.log('[Payouts] POST response data:', JSON.stringify(data));

      const clientSecret = data.client_secret;
      console.log('[Payouts] client_secret:', clientSecret ?? 'NULL/UNDEFINED');

      if (!clientSecret) {
        throw new Error('No client_secret returned');
      }

      // Embedded ConnectAccountOnboarding not yet available in stripe-react-native.
      // Fall back to URL-based onboarding via the existing connect route.
      const connectRes = await fetch(`${API_BASE_URL}/stripe/connect`, { headers });
      if (connectRes.ok) {
        const connectData = await connectRes.json();
        console.log('[Payouts] connect route response:', JSON.stringify(connectData));
        if (connectData.url) {
          await Linking.openURL(connectData.url);
        }
      }

      await checkStatus();
    } catch (err) {
      console.log('[Payouts] handleSetup error:', err);
      setError('Failed to start Stripe setup. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Stripe',
      'Are you sure you want to disconnect your Stripe account? You will stop receiving payouts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            setError(null);
            try {
              const headers = await buildHeaders();
              const res = await fetch(`${API_BASE_URL}/stripe/connect`, {
                method: 'DELETE',
                headers,
              });
              if (!res.ok) throw new Error(`${res.status}`);
              await checkStatus();
            } catch {
              setError('Failed to disconnect. Please try again.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const { status, chargesEnabled, payoutsEnabled } = statusData;

  if (status === 'loading') {
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

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 80, paddingTop: 24 }}>
        {error && (
          <Text style={{ color: '#c00', fontFamily: 'Philosopher-Regular', fontSize: 13, marginBottom: 16 }}>
            {error}
          </Text>
        )}

        {/* Status card */}
        {status === 'active' ? (
          <ActiveCard chargesEnabled={!!chargesEnabled} payoutsEnabled={!!payoutsEnabled} />
        ) : status === 'incomplete' ? (
          <IncompleteCard />
        ) : (
          <NotConnectedCard />
        )}

        {/* Action buttons */}
        <View style={{ marginTop: 20, gap: 12 }}>
          {status === 'not_connected' && (
            <PrimaryButton
              icon="card-outline"
              label="Set up payouts"
              loading={actionLoading}
              onPress={handleSetup}
            />
          )}

          {status === 'incomplete' && (
            <PrimaryButton
              icon="arrow-forward-circle-outline"
              label="Continue setup"
              loading={actionLoading}
              onPress={handleSetup}
            />
          )}

          {(status === 'active' || status === 'incomplete') && (
            <TouchableOpacity
              onPress={handleDisconnect}
              disabled={actionLoading}
              style={{
                backgroundColor: white,
                borderWidth: 1.5,
                borderColor: '#c00',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {actionLoading ? (
                <ActivityIndicator color="#c00" />
              ) : (
                <>
                  <Ionicons name="unlink-outline" size={20} color="#c00" />
                  <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: '#c00' }}>
                    Disconnect Stripe
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Info bullets */}
        <View style={{ marginTop: 28, gap: 12 }}>
          {[
            { icon: 'shield-checkmark-outline', text: 'Payments are handled securely via Stripe Express.' },
            { icon: 'time-outline', text: 'Payouts are typically processed within 2 business days.' },
            { icon: 'globe-outline', text: 'Stripe handles all compliance and identity verification.' },
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

function ActiveCard({ chargesEnabled, payoutsEnabled }: { chargesEnabled: boolean; payoutsEnabled: boolean }) {
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: green,
        borderRadius: 16,
        padding: 20,
        backgroundColor: '#f0fff0',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Ionicons name="checkmark-circle" size={22} color={green} style={{ marginRight: 8 }} />
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 17, color: green }}>
          Stripe Connected
        </Text>
      </View>
      <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 }}>
        You are set up to receive payouts directly to your bank account.
      </Text>
      <View style={{ gap: 8 }}>
        <StatusRow label="Charges enabled" active={chargesEnabled} />
        <StatusRow label="Payouts enabled" active={payoutsEnabled} />
      </View>
    </View>
  );
}

function IncompleteCard() {
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: '#e6a817',
        borderRadius: 16,
        padding: 20,
        backgroundColor: '#fffbf0',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons name="warning-outline" size={22} color="#b07d00" style={{ marginRight: 8 }} />
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 17, color: '#b07d00' }}>
          Setup Incomplete
        </Text>
      </View>
      <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#555', lineHeight: 20 }}>
        Your Stripe account needs more information before you can receive payouts.
      </Text>
    </View>
  );
}

function NotConnectedCard() {
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: beige,
        borderRadius: 16,
        padding: 20,
        backgroundColor: lightBeige,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons name="alert-circle-outline" size={22} color={darkBrown} style={{ marginRight: 8 }} />
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 17, color: darkBrown }}>
          Not Connected
        </Text>
      </View>
      <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#555', lineHeight: 20 }}>
        Connect your Stripe account to receive payments from bookings directly to your bank.
      </Text>
    </View>
  );
}

function StatusRow({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ionicons
        name={active ? 'checkmark-circle' : 'close-circle-outline'}
        size={16}
        color={active ? green : '#aaa'}
      />
      <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: active ? green : '#888' }}>
        {label}
      </Text>
    </View>
  );
}

function PrimaryButton({
  icon,
  label,
  loading,
  onPress,
}: {
  icon: string;
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={{
        backgroundColor: darkBrown,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {loading ? (
        <ActivityIndicator color={white} />
      ) : (
        <>
          <Ionicons name={icon as any} size={20} color={white} />
          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: white }}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
