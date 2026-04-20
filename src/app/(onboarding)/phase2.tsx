import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator, Alert, Image, Linking,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../../config/constants';

const darkBrown = '#423120';
const beige = '#D7C3A7';
const lightBeige = '#F4EDE5';
const white = '#FFFFFF';
const green = '#2d7a2d';
const red = '#c00';

const TOTAL_STEPS = 9;

const NATIONALITIES = ['Finnish', 'Swedish', 'Estonian', 'Russian', 'Other'];
const BUSINESS_TYPES = ['Sole trader', 'Ltd (Oy)', 'Partnership', 'Other'];

const QUESTIONS = [
  { question: 'What is your full legal name?', hint: 'As it appears on your ID document' },
  { question: 'What is your date of birth?', hint: 'DD/MM/YYYY' },
  { question: 'What is your Finnish ID?', hint: 'Henkilötunnus — e.g. 010190-123A' },
  { question: 'What is your nationality?' },
  { question: 'What is your business name?' },
  { question: 'What is your Y-tunnus?', hint: 'Optional — leave blank if you don\'t have one' },
  { question: 'What type of business is it?' },
  { question: 'Upload your documents', hint: 'ID and any business certificates — at least one required' },
  { question: 'Almost done', hint: 'Accept terms and set up payouts to submit' },
];

const bigInput = {
  fontFamily: 'Philosopher-Regular' as const,
  fontSize: 20,
  color: darkBrown,
  borderWidth: 2,
  borderColor: beige,
  borderRadius: 14,
  paddingHorizontal: 18,
  paddingVertical: 16,
  backgroundColor: white,
};

export default function Phase2Screen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [step, setStep] = useState(0);

  const [legalName, setLegalName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [finnishId, setFinnishId] = useState('');
  const [nationality, setNationality] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [yTunnus, setYTunnus] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<'loading' | 'not_connected' | 'incomplete' | 'active'>('not_connected');
  const [stripeSetupLoading, setStripeSetupLoading] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showNationalityPicker, setShowNationalityPicker] = useState(false);
  const [showBusinessTypePicker, setShowBusinessTypePicker] = useState(false);

  const legalNameRef = useRef<TextInput>(null);
  const dobRef = useRef<TextInput>(null);
  const finnishIdRef = useRef<TextInput>(null);
  const businessNameRef = useRef<TextInput>(null);
  const yTunnusRef = useRef<TextInput>(null);

  useEffect(() => {
    const refs = [legalNameRef, dobRef, finnishIdRef, null, businessNameRef, yTunnusRef, null, null, null];
    const ref = refs[step];
    if (ref) {
      const t = setTimeout(() => ref.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (step === 8) fetchStripeStatus();
  }, [step]);

  const buildHeaders = async () => {
    const token = await getTokenRef.current();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
      'X-User-Token': token ?? '',
    };
  };

  const fetchStripeStatus = async () => {
    setStripeStatus('loading');
    try {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/stripe/account-session`, { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStripeStatus(data.status ?? 'not_connected');
    } catch {
      setStripeStatus('not_connected');
    }
  };

  const handleStripeSetup = async () => {
    setStripeSetupLoading(true);
    try {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/stripe/account-session`, { method: 'POST', headers });
      if (!res.ok) throw new Error();
      const connectRes = await fetch(`${API_BASE_URL}/stripe/connect`, { headers });
      if (connectRes.ok) {
        const { url } = await connectRes.json();
        if (url) await Linking.openURL(url);
      }
      await fetchStripeStatus();
    } catch {
      Alert.alert('Error', 'Failed to start Stripe setup. Please try again.');
    } finally {
      setStripeSetupLoading(false);
    }
  };

  const pickAndUpload = async () => {
    if (documentUrls.length >= 5) {
      Alert.alert('Limit reached', 'Maximum 5 documents allowed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const token = await getTokenRef.current();
      const photoForm = new FormData();
      photoForm.append('file', { uri: asset.uri, type: asset.mimeType ?? 'image/jpeg', name: asset.fileName ?? 'doc.jpg' } as any);
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}`, 'X-User-Token': token ?? '' },
        body: photoForm,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const { url } = await res.json();
      setDocumentUrls(prev => [...prev, url]);
      setError('');
    } catch {
      Alert.alert('Upload failed', 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const validate = (): boolean => {
    if (step === 0 && !legalName.trim()) { setError('Please enter your full legal name'); return false; }
    if (step === 1 && !dateOfBirth.trim()) { setError('Please enter your date of birth'); return false; }
    if (step === 2 && !finnishId.trim()) { setError('Please enter your Finnish ID'); return false; }
    if (step === 3 && !nationality) { setError('Please select your nationality'); return false; }
    if (step === 4 && !businessName.trim()) { setError('Please enter your business name'); return false; }
    if (step === 6 && !businessType) { setError('Please select a business type'); return false; }
    if (step === 7 && !documentUrls.length) { setError('Upload at least one document'); return false; }
    if (step === 8) {
      if (!termsAccepted) { setError('You must accept the terms to continue'); return false; }
      if (stripeStatus !== 'active') { setError('Payout setup is required before submitting'); return false; }
    }
    setError('');
    return true;
  };

  const goNext = () => {
    if (!validate()) return;
    if (step === TOTAL_STEPS - 1) { handleSubmit(); return; }
    setStep(s => s + 1);
  };

  const goBack = () => {
    setError('');
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const headers = await buildHeaders();
      const res = await fetch(`${API_BASE_URL}/provider/apply/phase2`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          legalName: legalName.trim(),
          dateOfBirth: dateOfBirth.trim(),
          finnishId: finnishId.trim(),
          nationality,
          businessName: businessName.trim(),
          yTunnus: yTunnus.trim() || undefined,
          businessType,
          documentUrls,
          termsAccepted: true,
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      router.replace('/(onboarding)/pending' as any);
    } catch {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const q = QUESTIONS[step];

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <TextInput
            ref={legalNameRef}
            value={legalName}
            onChangeText={v => { setLegalName(v); setError(''); }}
            placeholder="Full name"
            placeholderTextColor="#ccc"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={goNext}
            style={bigInput}
          />
        );

      case 1:
        return (
          <TextInput
            ref={dobRef}
            value={dateOfBirth}
            onChangeText={v => { setDateOfBirth(v); setError(''); }}
            placeholder="01/01/1990"
            placeholderTextColor="#ccc"
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
            onSubmitEditing={goNext}
            style={bigInput}
          />
        );

      case 2:
        return (
          <TextInput
            ref={finnishIdRef}
            value={finnishId}
            onChangeText={v => { setFinnishId(v); setError(''); }}
            placeholder="010190-123A"
            placeholderTextColor="#ccc"
            autoCapitalize="characters"
            returnKeyType="next"
            onSubmitEditing={goNext}
            style={bigInput}
          />
        );

      case 3:
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowNationalityPicker(true)}
            style={[bigInput, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
          >
            <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 20, color: nationality ? darkBrown : '#ccc', flex: 1 }}>
              {nationality || 'Select nationality…'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#aaa" />
          </TouchableOpacity>
        );

      case 4:
        return (
          <TextInput
            ref={businessNameRef}
            value={businessName}
            onChangeText={v => { setBusinessName(v); setError(''); }}
            placeholder="Your business name"
            placeholderTextColor="#ccc"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={goNext}
            style={bigInput}
          />
        );

      case 5:
        return (
          <TextInput
            ref={yTunnusRef}
            value={yTunnus}
            onChangeText={v => { setYTunnus(v); setError(''); }}
            placeholder="0000000-0"
            placeholderTextColor="#ccc"
            returnKeyType="next"
            onSubmitEditing={goNext}
            style={bigInput}
          />
        );

      case 6:
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowBusinessTypePicker(true)}
            style={[bigInput, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
          >
            <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 20, color: businessType ? darkBrown : '#ccc', flex: 1 }}>
              {businessType || 'Select type…'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#aaa" />
          </TouchableOpacity>
        );

      case 7:
        return (
          <View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              {documentUrls.map((url, i) => (
                <View key={i} style={{ width: 90, height: 90, borderRadius: 10, overflow: 'hidden' }}>
                  <Image source={{ uri: url }} style={{ width: 90, height: 90 }} resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => setDocumentUrls(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 2 }}
                  >
                    <Ionicons name="close" size={14} color={white} />
                  </TouchableOpacity>
                </View>
              ))}
              {documentUrls.length < 5 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={pickAndUpload}
                  disabled={uploading}
                  style={{ width: 90, height: 90, borderRadius: 10, borderWidth: 2, borderColor: beige, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: lightBeige }}
                >
                  {uploading
                    ? <ActivityIndicator color={darkBrown} />
                    : <Ionicons name="add" size={28} color={darkBrown} />
                  }
                </TouchableOpacity>
              )}
            </View>
            <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#aaa' }}>
              JPEG or PNG · up to 5 files
            </Text>
          </View>
        );

      case 8:
        return (
          <View>
            <ScrollView
              style={{ height: 160, borderWidth: 1.5, borderColor: beige, borderRadius: 12, padding: 14, marginBottom: 16 }}
              nestedScrollEnabled
            >
              <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#555', lineHeight: 20 }}>
                By joining Cosmix as a service provider, you agree to:{'\n\n'}
                1. Provide accurate information about yourself and your services.{'\n\n'}
                2. Honor all bookings made through the Cosmix platform.{'\n\n'}
                3. Maintain professional standards of service quality.{'\n\n'}
                4. Comply with all applicable Finnish laws and regulations.{'\n\n'}
                5. Allow Cosmix to collect a platform fee of 10% on each completed booking.{'\n\n'}
                Cosmix reserves the right to suspend providers who violate these terms.
              </Text>
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => { setTermsAccepted(t => !t); setError(''); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}
            >
              <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: termsAccepted ? darkBrown : beige, backgroundColor: termsAccepted ? darkBrown : white, justifyContent: 'center', alignItems: 'center' }}>
                {termsAccepted && <Ionicons name="checkmark" size={14} color={white} />}
              </View>
              <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: darkBrown, flex: 1 }}>
                I agree to the Cosmix terms and conditions
              </Text>
            </TouchableOpacity>

            <View style={{ borderWidth: 2, borderColor: stripeStatus === 'active' ? green : beige, borderRadius: 14, padding: 16 }}>
              <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 15, color: darkBrown, marginBottom: 4 }}>Payout setup</Text>
              <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#888', marginBottom: 14 }}>
                Connect your bank account to receive payments.
              </Text>
              {stripeStatus === 'loading' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color={darkBrown} />
                  <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#888' }}>Checking…</Text>
                </View>
              )}
              {stripeStatus === 'active' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="checkmark-circle" size={20} color={green} />
                  <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 14, color: green }}>Payouts connected ✓</Text>
                </View>
              )}
              {(stripeStatus === 'not_connected' || stripeStatus === 'incomplete') && (
                <>
                  {stripeStatus === 'incomplete' && (
                    <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#b07d00', marginBottom: 10 }}>
                      Setup incomplete — please finish connecting.
                    </Text>
                  )}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleStripeSetup}
                    disabled={stripeSetupLoading}
                    style={{ backgroundColor: darkBrown, borderRadius: 10, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                  >
                    {stripeSetupLoading
                      ? <ActivityIndicator color={white} size="small" />
                      : <><Ionicons name="card-outline" size={16} color={white} /><Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 14, color: white }}>Set up payouts</Text></>
                    }
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Progress bar */}
        <View style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={goBack}
              style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center', opacity: step === 0 ? 0 : 1 }}
              disabled={step === 0}
            >
              <Ionicons name="arrow-back" size={22} color={darkBrown} />
            </TouchableOpacity>
            <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <View key={i} style={{ flex: 1, height: 3.5, borderRadius: 2, backgroundColor: i <= step ? darkBrown : beige }} />
              ))}
            </View>
            <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 13, color: darkBrown, width: 36, textAlign: 'right' }}>
              {step + 1}/{TOTAL_STEPS}
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 48, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 28, color: darkBrown, lineHeight: 36, marginBottom: q.hint ? 8 : 28 }}>
            {q.question}
          </Text>
          {q.hint ? (
            <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#999', marginBottom: 24, lineHeight: 20 }}>
              {q.hint}
            </Text>
          ) : null}
          {renderStep()}
          {error ? (
            <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: red, marginTop: 12 }}>
              {error}
            </Text>
          ) : null}
        </ScrollView>

        {/* Continue button */}
        <View style={{ paddingHorizontal: 28, paddingBottom: insets.bottom + 16, paddingTop: 8 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goNext}
            disabled={submitting}
            style={{ backgroundColor: darkBrown, borderRadius: 14, paddingVertical: 17, alignItems: 'center' }}
          >
            {submitting
              ? <ActivityIndicator color={white} />
              : <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: white }}>
                  {step === TOTAL_STEPS - 1 ? 'Submit application' : 'Continue'}
                </Text>
            }
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* Nationality picker */}
      {showNationalityPicker && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowNationalityPicker(false)} />
          <View style={{ backgroundColor: white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insets.bottom + 8 }}>
            <View style={{ width: 40, height: 4, backgroundColor: beige, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14 }}>
              <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 18, color: darkBrown }}>Nationality</Text>
              <TouchableOpacity onPress={() => setShowNationalityPicker(false)}>
                <Ionicons name="close" size={22} color={darkBrown} />
              </TouchableOpacity>
            </View>
            {NATIONALITIES.map(n => (
              <TouchableOpacity
                key={n}
                activeOpacity={0.8}
                onPress={() => { setNationality(n); setShowNationalityPicker(false); setError(''); }}
                style={{ paddingHorizontal: 24, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: lightBeige, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 16, color: darkBrown }}>{n}</Text>
                {nationality === n && <Ionicons name="checkmark" size={18} color={darkBrown} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Business type picker */}
      {showBusinessTypePicker && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowBusinessTypePicker(false)} />
          <View style={{ backgroundColor: white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insets.bottom + 8 }}>
            <View style={{ width: 40, height: 4, backgroundColor: beige, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14 }}>
              <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 18, color: darkBrown }}>Business type</Text>
              <TouchableOpacity onPress={() => setShowBusinessTypePicker(false)}>
                <Ionicons name="close" size={22} color={darkBrown} />
              </TouchableOpacity>
            </View>
            {BUSINESS_TYPES.map(t => (
              <TouchableOpacity
                key={t}
                activeOpacity={0.8}
                onPress={() => { setBusinessType(t); setShowBusinessTypePicker(false); setError(''); }}
                style={{ paddingHorizontal: 24, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: lightBeige, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 16, color: darkBrown }}>{t}</Text>
                {businessType === t && <Ionicons name="checkmark" size={18} color={darkBrown} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
