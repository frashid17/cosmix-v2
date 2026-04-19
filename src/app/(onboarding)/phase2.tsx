import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator, Alert, Image,
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

const NATIONALITIES = ['Finnish', 'Swedish', 'Estonian', 'Russian', 'Other'];
const BUSINESS_TYPES = ['Sole trader', 'Ltd (Oy)', 'Partnership', 'Other'];

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

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 13, color: darkBrown, marginBottom: 6 }}>{label}</Text>
      {children}
      {error ? <Text style={{ color: red, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

function PickerButton({ value, placeholder, options, onSelect }: {
  value: string; placeholder: string; options: string[]; onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[inputStyle, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
      >
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 15, color: value ? darkBrown : '#bbb' }}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#aaa" />
      </TouchableOpacity>
      {open && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 100 }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <View style={{ backgroundColor: white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: insets.bottom + 16, borderTopWidth: 1, borderTopColor: beige }}>
            {options.map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => { onSelect(opt); setOpen(false); }}
                style={{ paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: lightBeige, flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 16, color: darkBrown }}>{opt}</Text>
                {value === opt && <Ionicons name="checkmark" size={18} color={darkBrown} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

export default function Phase2Screen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [step, setStep] = useState(1);

  // Step 1 — personal
  const [legalName, setLegalName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [finnishId, setFinnishId] = useState('');
  const [nationality, setNationality] = useState('Finnish');

  // Step 2 — business
  const [businessName, setBusinessName] = useState('');
  const [yTunnus, setYTunnus] = useState('');
  const [businessType, setBusinessType] = useState('');

  // Step 3 — documents
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Step 4 — terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const buildHeaders = async () => {
    const token = await getTokenRef.current();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
      'X-User-Token': token ?? '',
    };
  };

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!legalName.trim()) e.legalName = 'Required';
      if (!dateOfBirth.trim()) e.dateOfBirth = 'Required';
      if (!finnishId.trim()) e.finnishId = 'Required';
      if (!nationality) e.nationality = 'Required';
    }
    if (step === 2) {
      if (!businessName.trim()) e.businessName = 'Required';
      if (!businessType) e.businessType = 'Required';
    }
    if (step === 3) {
      if (!documentUrls.length) e.documents = 'Upload at least one document';
    }
    if (step === 4) {
      if (!termsAccepted) e.terms = 'You must accept the terms';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pickAndUpload = async () => {
    if (documentUrls.length >= 5) {
      Alert.alert('Limit reached', 'Maximum 5 documents allowed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];

    setUploading(true);
    try {
      const token = await getTokenRef.current();
      const form = new FormData();
      form.append('file', { uri: asset.uri, type: asset.mimeType ?? 'image/jpeg', name: asset.fileName ?? 'doc.jpg' } as any);
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}`, 'X-User-Token': token ?? '' },
        body: form,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const { url } = await res.json();
      setDocumentUrls(prev => [...prev, url]);
    } catch {
      Alert.alert('Upload failed', 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
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

  const stepLabels = ['Personal details', 'Business details', 'Documents', 'Terms & Stripe'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: beige }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          {step > 1 && (
            <TouchableOpacity onPress={() => setStep(s => s - 1)} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={20} color={darkBrown} />
            </TouchableOpacity>
          )}
          <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#888' }}>Step 2 of 3 — {stepLabels[step - 1]}</Text>
        </View>
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 22, color: darkBrown }}>Contract & verification</Text>
        {/* Phase progress */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
          {[0, 1, 2].map(i => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= 1 ? darkBrown : beige }} />
          ))}
        </View>
        {/* Step progress */}
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= step ? darkBrown : beige }} />
          ))}
        </View>
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 11, color: '#aaa', marginTop: 4 }}>
          Step {step} of 4
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 100 }}>
        {/* ── Step 1: Personal ── */}
        {step === 1 && (
          <>
            <Field label="Full legal name *" error={errors.legalName}>
              <TextInput value={legalName} onChangeText={setLegalName} placeholder="As on ID document" placeholderTextColor="#bbb"
                style={[inputStyle, errors.legalName ? { borderColor: red } : {}]} />
            </Field>
            <Field label="Date of birth * (DD/MM/YYYY)" error={errors.dateOfBirth}>
              <TextInput value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="01/01/1990" placeholderTextColor="#bbb"
                keyboardType="numbers-and-punctuation"
                style={[inputStyle, errors.dateOfBirth ? { borderColor: red } : {}]} />
            </Field>
            <Field label="Finnish ID (Henkilötunnus) *" error={errors.finnishId}>
              <TextInput value={finnishId} onChangeText={setFinnishId} placeholder="XXXXXX-XXXX" placeholderTextColor="#bbb"
                autoCapitalize="characters"
                style={[inputStyle, errors.finnishId ? { borderColor: red } : {}]} />
            </Field>
            <Field label="Nationality *" error={errors.nationality}>
              <PickerButton value={nationality} placeholder="Select nationality" options={NATIONALITIES} onSelect={setNationality} />
            </Field>
          </>
        )}

        {/* ── Step 2: Business ── */}
        {step === 2 && (
          <>
            <Field label="Business / trading name *" error={errors.businessName}>
              <TextInput value={businessName} onChangeText={setBusinessName} placeholder="Your business name" placeholderTextColor="#bbb"
                style={[inputStyle, errors.businessName ? { borderColor: red } : {}]} />
            </Field>
            <Field label="Y-tunnus (optional)">
              <TextInput value={yTunnus} onChangeText={setYTunnus} placeholder="0000000-0" placeholderTextColor="#bbb"
                style={inputStyle} />
            </Field>
            <Field label="Business type *" error={errors.businessType}>
              <PickerButton value={businessType} placeholder="Select type" options={BUSINESS_TYPES} onSelect={setBusinessType} />
            </Field>
          </>
        )}

        {/* ── Step 3: Documents ── */}
        {step === 3 && (
          <>
            <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 20 }}>
              Upload a photo of your ID and any business certificates. At least one document is required.
            </Text>
            {errors.documents ? <Text style={{ color: red, fontSize: 12, marginBottom: 12 }}>{errors.documents}</Text> : null}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {documentUrls.map((url, i) => (
                <View key={i} style={{ width: 90, height: 90, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
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
            <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 11, color: '#aaa' }}>
              JPEG or PNG, max 10MB each, up to 5 files
            </Text>
          </>
        )}

        {/* ── Step 4: Terms + Stripe ── */}
        {step === 4 && (
          <>
            <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 14, color: darkBrown, marginBottom: 10 }}>
              Terms & Conditions
            </Text>
            <ScrollView
              style={{ height: 180, borderWidth: 1.5, borderColor: beige, borderRadius: 10, padding: 14, marginBottom: 16 }}
              nestedScrollEnabled
            >
              <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#555', lineHeight: 20 }}>
                By joining Cosmix as a service provider, you agree to:{'\n\n'}
                1. Provide accurate information about yourself and your services.{'\n\n'}
                2. Honor bookings made through the Cosmix platform.{'\n\n'}
                3. Maintain professional standards of service quality.{'\n\n'}
                4. Comply with all applicable Finnish laws and regulations.{'\n\n'}
                5. Allow Cosmix to collect a platform fee of 10% on each completed booking.{'\n\n'}
                6. Keep your availability and pricing up to date.{'\n\n'}
                Cosmix reserves the right to suspend or remove providers who violate these terms.
              </Text>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setTermsAccepted(t => !t)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 }}
            >
              <View style={{
                width: 22, height: 22, borderRadius: 6, borderWidth: 2,
                borderColor: termsAccepted ? darkBrown : beige,
                backgroundColor: termsAccepted ? darkBrown : white,
                justifyContent: 'center', alignItems: 'center',
              }}>
                {termsAccepted && <Ionicons name="checkmark" size={14} color={white} />}
              </View>
              <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: darkBrown, flex: 1 }}>
                I agree to the Cosmix terms and conditions
              </Text>
            </TouchableOpacity>
            {errors.terms ? <Text style={{ color: red, fontSize: 12, marginBottom: 12 }}>{errors.terms}</Text> : null}

            <View style={{ marginTop: 20, borderWidth: 2, borderColor: beige, borderRadius: 14, padding: 18 }}>
              <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 15, color: darkBrown, marginBottom: 6 }}>
                Payout setup
              </Text>
              <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#666', marginBottom: 14, lineHeight: 18 }}>
                Set up your bank account to receive payments from bookings.
                You can complete this step now or after approval.
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="information-circle-outline" size={16} color="#888" />
                <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#888', flex: 1 }}>
                  Stripe Connect setup is available in Settings → Payouts after your application is approved.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer buttons */}
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: beige, backgroundColor: white }}>
        {step < 4
          ? (
            <TouchableOpacity onPress={handleNext} style={{ backgroundColor: darkBrown, borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: white }}>Continue</Text>
            </TouchableOpacity>
          )
          : (
            <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={{ backgroundColor: darkBrown, borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}>
              {submitting
                ? <ActivityIndicator color={white} />
                : <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: white }}>Submit application</Text>
              }
            </TouchableOpacity>
          )
        }
      </View>
    </SafeAreaView>
  );
}
