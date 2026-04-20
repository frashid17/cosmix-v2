import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../../config/constants';

// ─── Colors ──────────────────────────────────────────────────────────────────
const darkBrown = '#423120';
const beige = '#D7C3A7';
const lightBeige = '#F4EDE5';
const white = '#FFFFFF';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Types ────────────────────────────────────────────────────────────────────
type SalonForm = {
  name: string;
  description: string;
  shortIntro: string;
  address: string;
};

type DaySlot = {
  dayOfWeek: number; // 0 = Sun
  startTime: string; // "HH:MM"
  endTime: string;
  isOpen: boolean;
};

const DEFAULT_HOURS: DaySlot[] = DAYS.map((_, i) => ({
  dayOfWeek: i,
  startTime: '09:00',
  endTime: '18:00',
  isOpen: i >= 1 && i <= 5, // Mon–Fri open by default
}));

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProviderSalonScreen() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [saloonId, setSaloonId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<SalonForm>({ name: '', description: '', shortIntro: '', address: '' });
  const [savedForm, setSavedForm] = useState<SalonForm>({ name: '', description: '', shortIntro: '', address: '' });
  const [hours, setHours] = useState<DaySlot[]>(DEFAULT_HOURS);
  const [savedHours, setSavedHours] = useState<DaySlot[]>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Dirty detection ───────────────────────────────────────────────────────
  const hasFormChanges = JSON.stringify(form) !== JSON.stringify(savedForm);
  const hasHourChanges = JSON.stringify(hours) !== JSON.stringify(savedHours);
  const hasImageChanges = JSON.stringify(images) !== JSON.stringify(savedImages);
  const hasChanges = hasFormChanges || hasHourChanges || hasImageChanges;

  // ── Auth headers ─────────────────────────────────────────────────────────
  const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getTokenRef.current();
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
    };
    if (token) h['X-User-Token'] = token;
    return h;
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const headers = await authHeaders();

      // 1. Get first owned saloon
      const saloonsRes = await fetch(`${API_BASE_URL}/saloons?owned=1`, { headers });
      if (!saloonsRes.ok) throw new Error('Could not load salon');
      const saloons = await saloonsRes.json();
      if (!Array.isArray(saloons) || saloons.length === 0) {
        setLoading(false);
        return;
      }
      const id = saloons[0].id;
      setSaloonId(id);

      // 2. Get full salon details + time slots in parallel
      const [detailRes, slotsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/saloons/${id}`, { headers }),
        fetch(`${API_BASE_URL}/saloons/${id}/time-slots`, { headers }),
      ]);

      if (detailRes.ok) {
        const salon = await detailRes.json();
        const f: SalonForm = {
          name: salon.name ?? '',
          description: salon.description ?? '',
          shortIntro: salon.shortIntro ?? '',
          address: salon.address ?? '',
        };
        setForm(f);
        setSavedForm(f);
        if (Array.isArray(salon.images)) {
          const urls = salon.images.map((img: { url: string }) => img.url);
          setImages(urls);
          setSavedImages(urls);
        }
      }

      if (slotsRes.ok) {
        const slots: DaySlot[] = await slotsRes.json();
        if (Array.isArray(slots) && slots.length > 0) {
          // Merge fetched slots with defaults (in case some days are missing)
          const merged = DEFAULT_HOURS.map((def) => {
            const found = slots.find((s) => s.dayOfWeek === def.dayOfWeek);
            return found
              ? { dayOfWeek: found.dayOfWeek, startTime: found.startTime, endTime: found.endTime, isOpen: found.isOpen }
              : def;
          });
          setHours(merged);
          setSavedHours(merged);
        }
      }
    } catch {
      setError('Failed to load salon info.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Unsaved changes guard ─────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!hasChanges) return;
      e.preventDefault();
      Alert.alert('Unsaved Changes', 'You have unsaved changes. Discard them?', [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
    return unsubscribe;
  }, [navigation, hasChanges]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!saloonId) return;
    if (!form.name.trim()) return Alert.alert('Required', 'Salon name is required.');

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const headers = await authHeaders();

      // Save basic info + images together (PATCH replaces images array)
      if (hasFormChanges || hasImageChanges) {
        const res = await fetch(`${API_BASE_URL}/saloons/${saloonId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim() || null,
            shortIntro: form.shortIntro.trim() || null,
            address: form.address.trim() || null,
            ...(hasImageChanges && { images: images.map(url => ({ url })) }),
          }),
        });
        if (!res.ok) throw new Error('Failed to save salon info');
        setSavedForm({ ...form });
        if (hasImageChanges) setSavedImages([...images]);
      }

      // Save opening hours (POST replaces all)
      if (hasHourChanges) {
        const res = await fetch(`${API_BASE_URL}/saloons/${saloonId}/time-slots`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ timeSlots: hours }),
        });
        if (!res.ok) throw new Error('Failed to save opening hours');
        setSavedHours([...hours]);
      }

      setSuccessMsg('Salon updated!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setError(e?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Photo upload ──────────────────────────────────────────────────────────
  const pickAndUpload = async () => {
    if (images.length >= 6) {
      Alert.alert('Limit reached', 'Maximum 6 photos allowed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];

    setUploading(true);
    try {
      const token = await getTokenRef.current();
      const photoForm = new FormData();
      photoForm.append('file', { uri: asset.uri, type: asset.mimeType ?? 'image/jpeg', name: asset.fileName ?? 'photo.jpg' } as any);
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}`, 'X-User-Token': token ?? '' },
        body: photoForm,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const { url } = await res.json();
      setImages(prev => [...prev, url]);
    } catch {
      Alert.alert('Upload failed', 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert('Remove photo?', 'This will be removed when you save.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setImages(prev => prev.filter((_, i) => i !== index)) },
    ]);
  };

  // ── Hour field helpers ────────────────────────────────────────────────────
  const updateHour = (dayOfWeek: number, field: keyof DaySlot, value: string | boolean) => {
    setHours((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d)));
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={darkBrown} />
      </SafeAreaView>
    );
  }

  if (!saloonId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <Ionicons name="storefront-outline" size={48} color={beige} style={{ marginBottom: 12 }} />
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: darkBrown, textAlign: 'center' }}>
          No salon found
        </Text>
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#888', textAlign: 'center', marginTop: 6 }}>
          Set up your salon profile in the web dashboard first.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      {/* ── Sticky header ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: beige,
          backgroundColor: white,
        }}
      >
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 22, color: darkBrown }}>Salon Profile</Text>
        {hasChanges && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#b87a00' }} />
            <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#b87a00' }}>Unsaved</Text>
          </View>
        )}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Feedback banners ── */}
          {successMsg && (
            <View style={{ backgroundColor: '#e6f4e6', borderRadius: 10, padding: 12, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark-circle" size={18} color="#2d7a2d" />
              <Text style={{ fontFamily: 'Philosopher-Bold', color: '#2d7a2d', fontSize: 14 }}>{successMsg}</Text>
            </View>
          )}
          {error && (
            <View style={{ backgroundColor: '#fee', borderRadius: 10, padding: 12, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="alert-circle-outline" size={18} color="#c00" />
              <Text style={{ fontFamily: 'Philosopher-Regular', color: '#c00', fontSize: 14, flex: 1 }}>{error}</Text>
            </View>
          )}

          {/* ════════════════════════════════
              SECTION: Basic Info
          ════════════════════════════════ */}
          <SectionHeader title="Basic Info" />

          <FormField label="Salon Name *">
            <TextInput
              style={inputStyle}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="e.g. Beauty Studio Cosmix"
              placeholderTextColor="#bbb"
            />
          </FormField>

          <FormField label="Short Intro">
            <TextInput
              style={[inputStyle, { height: 60 }]}
              value={form.shortIntro}
              onChangeText={(v) => setForm((f) => ({ ...f, shortIntro: v }))}
              placeholder="One-line tagline shown on the map"
              placeholderTextColor="#bbb"
              multiline
            />
          </FormField>

          <FormField label="Description">
            <TextInput
              style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Tell customers about your salon…"
              placeholderTextColor="#bbb"
              multiline
            />
          </FormField>

          <FormField label="Address">
            <TextInput
              style={inputStyle}
              value={form.address}
              onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
              placeholder="Street address"
              placeholderTextColor="#bbb"
            />
          </FormField>

          {/* ════════════════════════════════
              SECTION: Opening Hours
          ════════════════════════════════ */}
          <SectionHeader title="Opening Hours" />

          {hours.map((day) => (
            <View
              key={day.dayOfWeek}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: lightBeige,
              }}
            >
              {/* Day label */}
              <Text
                style={{
                  fontFamily: 'Philosopher-Bold',
                  fontSize: 13,
                  color: day.isOpen ? darkBrown : '#bbb',
                  width: 80,
                }}
              >
                {DAYS[day.dayOfWeek].slice(0, 3)}
              </Text>

              {/* Closed toggle */}
              <Switch
                value={day.isOpen}
                onValueChange={(v) => updateHour(day.dayOfWeek, 'isOpen', v)}
                trackColor={{ false: beige, true: darkBrown }}
                thumbColor={white}
                style={{ marginRight: 12 }}
              />

              {/* Time inputs */}
              {day.isOpen ? (
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TextInput
                    style={[timeInputStyle, { opacity: day.isOpen ? 1 : 0.4 }]}
                    value={day.startTime}
                    onChangeText={(v) => updateHour(day.dayOfWeek, 'startTime', v)}
                    placeholder="09:00"
                    placeholderTextColor="#bbb"
                    keyboardType="numbers-and-punctuation"
                    editable={day.isOpen}
                    maxLength={5}
                  />
                  <Text style={{ fontFamily: 'Philosopher-Regular', color: '#888', fontSize: 12 }}>–</Text>
                  <TextInput
                    style={[timeInputStyle, { opacity: day.isOpen ? 1 : 0.4 }]}
                    value={day.endTime}
                    onChangeText={(v) => updateHour(day.dayOfWeek, 'endTime', v)}
                    placeholder="18:00"
                    placeholderTextColor="#bbb"
                    keyboardType="numbers-and-punctuation"
                    editable={day.isOpen}
                    maxLength={5}
                  />
                </View>
              ) : (
                <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#bbb' }}>Closed</Text>
              )}
            </View>
          ))}

          {/* ════════════════════════════════
              SECTION: Photos
          ════════════════════════════════ */}
          <SectionHeader title="Photos" />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {images.map((url, i) => (
              <View key={i} style={{ marginRight: 10, position: 'relative' }}>
                <Image
                  source={{ uri: url }}
                  style={{ width: 100, height: 100, borderRadius: 10, backgroundColor: lightBeige }}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => removeImage(i)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 12, padding: 3,
                  }}
                >
                  <Ionicons name="close" size={14} color={white} />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 6 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={pickAndUpload}
                disabled={uploading}
                style={{
                  width: 100, height: 100, borderRadius: 10,
                  borderWidth: 2, borderColor: beige, borderStyle: 'dashed',
                  justifyContent: 'center', alignItems: 'center',
                  backgroundColor: lightBeige,
                }}
              >
                {uploading
                  ? <ActivityIndicator color={darkBrown} />
                  : <>
                      <Ionicons name="add" size={26} color={darkBrown} />
                      <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 11, color: darkBrown, marginTop: 2 }}>Add photo</Text>
                    </>
                }
              </TouchableOpacity>
            )}
          </ScrollView>
          <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 11, color: '#aaa', marginBottom: 24 }}>
            {images.length}/6 photos · Changes are saved with the Save button
          </Text>

          {/* ── Save button ── */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !hasChanges}
            style={{
              backgroundColor: hasChanges ? darkBrown : beige,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saving ? (
              <ActivityIndicator color={white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={hasChanges ? white : '#888'} />
                <Text
                  style={{
                    fontFamily: 'Philosopher-Bold',
                    fontSize: 16,
                    color: hasChanges ? white : '#888',
                  }}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontFamily: 'Philosopher-Bold',
        fontSize: 12,
        color: '#423120',
        marginTop: 28,
        marginBottom: 12,
        paddingBottom: 6,
        borderBottomWidth: 1.5,
        borderBottomColor: '#D7C3A7',
        textTransform: 'uppercase',
        letterSpacing: 1,
      } as any}
    >
      {title}
    </Text>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontFamily: 'Philosopher-Bold',
          fontSize: 13,
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const inputStyle = {
  borderWidth: 1.5,
  borderColor: '#D7C3A7',
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 10,
  fontFamily: 'Philosopher-Regular' as const,
  fontSize: 15,
  color: '#423120',
};

const timeInputStyle = {
  borderWidth: 1.5,
  borderColor: '#D7C3A7',
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 6,
  fontFamily: 'Philosopher-Regular' as const,
  fontSize: 14,
  color: '#423120',
  width: 70,
  textAlign: 'center' as const,
};
