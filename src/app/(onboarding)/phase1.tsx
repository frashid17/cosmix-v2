import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../../config/constants';

const darkBrown = '#423120';
const beige = '#D7C3A7';
const lightBeige = '#F4EDE5';
const white = '#FFFFFF';
const red = '#c00';

const CITIES = [
  'Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu',
  'Turku', 'Jyväskylä', 'Lahti', 'Kuopio', 'Pori',
  'Kouvola', 'Joensuu', 'Lappeenranta', 'Hämeenlinna', 'Vaasa',
];

type Category = { id: string; name: string };

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={{
      fontFamily: 'Philosopher-Bold', fontSize: 11, color: '#888',
      textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20,
    }}>
      {label}
    </Text>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 13, color: darkBrown, marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  fontFamily: 'Philosopher-Regular' as const,
  fontSize: 15,
  color: darkBrown,
  borderWidth: 1.5,
  borderColor: beige,
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: white,
};

export default function Phase1Screen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const insets = useSafeAreaInsets();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/public/categories`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'Required';
    if (!lastName.trim()) e.lastName = 'Required';
    if (!phone.trim()) e.phone = 'Required';
    if (!city) e.city = 'Required';
    if (!address.trim()) e.address = 'Required';
    if (!selectedCategories.length) e.categories = 'Select at least one service';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = await getTokenRef.current();
      const res = await fetch(`${API_BASE_URL}/provider/apply/phase1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
          'X-User-Token': token ?? '',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          city,
          neighbourhood: neighbourhood.trim() || undefined,
          address: address.trim(),
          serviceCategories: selectedCategories,
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      router.replace('/(onboarding)/pending' as any);
    } catch {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: beige }}>
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#888', marginBottom: 4 }}>Step 1 of 3</Text>
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 22, color: darkBrown }}>Become a service provider</Text>
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#666', marginTop: 2 }}>Tell us about yourself</Text>
        {/* Progress bar */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
          {[0, 1, 2].map(i => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i === 0 ? darkBrown : beige }} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 100 }}>
        <SectionLabel label="About you" />

        <Field label="First name *">
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Matti"
            placeholderTextColor="#bbb"
            style={[inputStyle, errors.firstName ? { borderColor: red } : {}]}
          />
          {errors.firstName ? <Text style={{ color: red, fontSize: 12, marginTop: 4 }}>{errors.firstName}</Text> : null}
        </Field>

        <Field label="Last name *">
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Meikäläinen"
            placeholderTextColor="#bbb"
            style={[inputStyle, errors.lastName ? { borderColor: red } : {}]}
          />
          {errors.lastName ? <Text style={{ color: red, fontSize: 12, marginTop: 4 }}>{errors.lastName}</Text> : null}
        </Field>

        <Field label="Email">
          <View style={[inputStyle, { backgroundColor: lightBeige }]}>
            <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 15, color: '#888' }}>
              {clerkUser?.emailAddresses[0]?.emailAddress ?? ''}
            </Text>
          </View>
        </Field>

        <Field label="Phone *">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={[inputStyle, { paddingHorizontal: 12, justifyContent: 'center', backgroundColor: lightBeige }]}>
              <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 15, color: '#888' }}>+358</Text>
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="40 123 4567"
              placeholderTextColor="#bbb"
              keyboardType="phone-pad"
              style={[inputStyle, { flex: 1 }, errors.phone ? { borderColor: red } : {}]}
            />
          </View>
          {errors.phone ? <Text style={{ color: red, fontSize: 12, marginTop: 4 }}>{errors.phone}</Text> : null}
        </Field>

        <SectionLabel label="Location" />

        <Field label="City *">
          <TouchableOpacity
            onPress={() => setShowCityPicker(true)}
            style={[inputStyle, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, errors.city ? { borderColor: red } : {}]}
          >
            <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 15, color: city ? darkBrown : '#bbb' }}>
              {city || 'Select city'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#aaa" />
          </TouchableOpacity>
          {errors.city ? <Text style={{ color: red, fontSize: 12, marginTop: 4 }}>{errors.city}</Text> : null}
        </Field>

        <Field label="Neighbourhood / area">
          <TextInput
            value={neighbourhood}
            onChangeText={setNeighbourhood}
            placeholder="e.g. Kallio, Töölö (optional)"
            placeholderTextColor="#bbb"
            style={inputStyle}
          />
        </Field>

        <Field label="Home address *">
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Street address"
            placeholderTextColor="#bbb"
            style={[inputStyle, errors.address ? { borderColor: red } : {}]}
          />
          <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 11, color: '#aaa', marginTop: 4 }}>
            Not shown publicly — for verification only
          </Text>
          {errors.address ? <Text style={{ color: red, fontSize: 12, marginTop: 2 }}>{errors.address}</Text> : null}
        </Field>

        <SectionLabel label="Services" />
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#666', marginBottom: 12 }}>
          What services will you offer?
        </Text>
        {errors.categories ? <Text style={{ color: red, fontSize: 12, marginBottom: 8 }}>{errors.categories}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categories.map(cat => {
            const selected = selectedCategories.includes(cat.name);
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => toggleCategory(cat.name)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: selected ? darkBrown : lightBeige,
                  borderWidth: 1.5,
                  borderColor: selected ? darkBrown : beige,
                }}
              >
                <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 13, color: selected ? white : darkBrown }}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Submit */}
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: beige, backgroundColor: white }}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{ backgroundColor: darkBrown, borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
        >
          {submitting
            ? <ActivityIndicator color={white} />
            : <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: white }}>Submit application</Text>
          }
        </TouchableOpacity>
      </View>

      {/* City picker modal */}
      {showCityPicker && (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: insets.bottom + 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
              <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 18, color: darkBrown }}>Select city</Text>
              <TouchableOpacity onPress={() => setShowCityPicker(false)}>
                <Ionicons name="close" size={24} color={darkBrown} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {CITIES.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => { setCity(c); setShowCityPicker(false); }}
                  style={{ paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: lightBeige, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 16, color: darkBrown }}>{c}</Text>
                  {city === c && <Ionicons name="checkmark" size={18} color={darkBrown} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
