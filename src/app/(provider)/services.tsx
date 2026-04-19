import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../../config/constants';

// ─── Colors ──────────────────────────────────────────────────────────────────
const darkBrown = '#423120';
const beige = '#D7C3A7';
const lightBeige = '#F4EDE5';
const white = '#FFFFFF';
const DURATIONS = [15, 30, 45, 60, 90, 120];

// ─── Types ────────────────────────────────────────────────────────────────────
type GlobalService = {
  id: string;
  name: string;
  description?: string;
};

type GlobalCategory = {
  id: string;
  name: string;
  services: GlobalService[];
};

type SaloonService = {
  serviceId: string;
  saloonId: string;
  price: number;
  durationMinutes: number;
  isAvailable: boolean;
  service: { id: string; name: string; description?: string; category?: { name: string } };
};

type FormState = {
  serviceId: string;
  price: string;
  durationMinutes: number;
  isAvailable: boolean;
};

const EMPTY_FORM: FormState = {
  serviceId: '',
  price: '',
  durationMinutes: 30,
  isAvailable: true,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProviderServicesScreen() {
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();

  const [saloonId, setSaloonId] = useState<string | null>(null);
  const [services, setServices] = useState<SaloonService[]>([]);
  const [categories, setCategories] = useState<GlobalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // ── Auth headers ─────────────────────────────────────────────────────────
  const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getToken();
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
    };
    if (token) h['X-User-Token'] = token;
    return h;
  }, [getToken]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const headers = await authHeaders();

      // 1. Get provider's first saloon
      const saloonRes = await fetch(`${API_BASE_URL}/saloons`, { headers });
      if (!saloonRes.ok) throw new Error('Could not load salon');
      const saloons = await saloonRes.json();
      if (!Array.isArray(saloons) || saloons.length === 0) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const id = saloons[0].id;
      setSaloonId(id);

      // 2. Get services for this saloon
      const [svcRes, catRes] = await Promise.all([
        fetch(`${API_BASE_URL}/saloons/${id}/services`, { headers }),
        fetch(`${API_BASE_URL}/public/categories`),
      ]);

      if (svcRes.ok) {
        const data = await svcRes.json();
        setServices(Array.isArray(data) ? data : []);
      }
      if (catRes.ok) {
        const cats = await catRes.json();
        setCategories(Array.isArray(cats) ? cats.filter((c: GlobalCategory) => c.services?.length > 0) : []);
      }
    } catch (e: any) {
      setError('Failed to load services.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Open add modal ────────────────────────────────────────────────────────
  const openAdd = () => {
    setIsEditing(false);
    setForm(EMPTY_FORM);
    setActiveCategoryId(categories[0]?.id ?? null);
    setModalVisible(true);
  };

  // ── Open edit modal ───────────────────────────────────────────────────────
  const openEdit = (svc: SaloonService) => {
    setIsEditing(true);
    setForm({
      serviceId: svc.serviceId,
      price: String(svc.price),
      durationMinutes: svc.durationMinutes,
      isAvailable: svc.isAvailable,
    });
    setModalVisible(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!saloonId) return;
    const price = parseFloat(form.price);
    if (!form.serviceId) return Alert.alert('Required', 'Please select a service.');
    if (isNaN(price) || price <= 0) return Alert.alert('Required', 'Enter a valid price.');

    setSaving(true);
    try {
      const headers = await authHeaders();
      if (isEditing) {
        const res = await fetch(`${API_BASE_URL}/saloons/${saloonId}/services/${form.serviceId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ price, durationMinutes: form.durationMinutes, isAvailable: form.isAvailable }),
        });
        if (!res.ok) throw new Error();
        setServices((prev) =>
          prev.map((s) =>
            s.serviceId === form.serviceId
              ? { ...s, price, durationMinutes: form.durationMinutes, isAvailable: form.isAvailable }
              : s
          )
        );
      } else {
        const res = await fetch(`${API_BASE_URL}/saloons/${saloonId}/services`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            serviceId: form.serviceId,
            price,
            durationMinutes: form.durationMinutes,
            isAvailable: form.isAvailable,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        // Re-fetch to get the full service record with name/category
        const svcRes = await fetch(`${API_BASE_URL}/saloons/${saloonId}/services`, { headers });
        if (svcRes.ok) setServices(await svcRes.json());
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save service. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (svc: SaloonService) => {
    Alert.alert('Delete Service', `Remove "${svc.service?.name}" from your salon?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!saloonId) return;
          // Optimistic remove
          setServices((prev) => prev.filter((s) => s.serviceId !== svc.serviceId));
          try {
            const headers = await authHeaders();
            const res = await fetch(`${API_BASE_URL}/saloons/${saloonId}/services/${svc.serviceId}`, {
              method: 'DELETE',
              headers,
            });
            if (!res.ok) throw new Error();
          } catch {
            // Restore on error
            setServices((prev) => [...prev, svc]);
            Alert.alert('Error', 'Failed to delete service. Please try again.');
          }
        },
      },
    ]);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addedServiceIds = new Set(services.map((s) => s.serviceId));
  const activeCategoryServices =
    categories.find((c) => c.id === activeCategoryId)?.services.filter((s) => !addedServiceIds.has(s.id)) ?? [];

  // ── Render service card ───────────────────────────────────────────────────
  const renderService = ({ item, index }: { item: SaloonService; index: number }) => (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: index < services.length - 1 ? 1 : 0,
        borderBottomColor: beige,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 15, color: darkBrown }}>
          {item.service?.name ?? 'Service'}
        </Text>
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#888', marginTop: 2 }}>
          {item.durationMinutes} min · {item.isAvailable ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 15, color: darkBrown, marginRight: 12 }}>
        €{Number(item.price).toFixed(2)}
      </Text>
      <TouchableOpacity onPress={() => openEdit(item)} style={{ padding: 6, marginRight: 4 }}>
        <Ionicons name="pencil-outline" size={18} color={darkBrown} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: 6 }}>
        <Ionicons name="trash-outline" size={18} color="#c00" />
      </TouchableOpacity>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={darkBrown} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      {/* ── Header ── */}
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
        }}
      >
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 22, color: darkBrown }}>My Services</Text>
        <TouchableOpacity
          onPress={openAdd}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: darkBrown,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            gap: 6,
          }}
        >
          <Ionicons name="add" size={18} color={white} />
          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 13, color: white }}>Add Service</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <Text style={{ color: '#c00', fontFamily: 'Philosopher-Regular', fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {/* ── Service List ── */}
      {services.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <Ionicons name="cut-outline" size={48} color={beige} style={{ marginBottom: 12 }} />
          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: darkBrown, textAlign: 'center' }}>
            No services yet
          </Text>
          <Text
            style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#888', textAlign: 'center', marginTop: 6 }}
          >
            Tap "Add Service" to start building your menu.
          </Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.serviceId}
          renderItem={renderService}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          style={{ flex: 1 }}
          ItemSeparatorComponent={() => null}
          ListHeaderComponent={
            <View style={{ borderWidth: 2, borderColor: beige, borderRadius: 12, marginHorizontal: 20, marginTop: 16, overflow: 'hidden' }} />
          }
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          SERVICE FORM MODAL
      ═══════════════════════════════════════════════════════════ */}
      <Modal visible={modalVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
            <View
              style={{
                backgroundColor: white,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: insets.bottom + 16,
                maxHeight: '90%',
              }}
            >
              {/* Handle */}
              <View style={{ width: 40, height: 4, backgroundColor: beige, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

              {/* Title + close */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 20, color: darkBrown }}>
                  {isEditing ? 'Edit Service' : 'Add Service'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={24} color={darkBrown} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* ── Service picker (add only) ── */}
                {!isEditing && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={labelStyle}>Service *</Text>

                    {/* Category tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => { setActiveCategoryId(cat.id); setForm((f) => ({ ...f, serviceId: '' })); }}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            marginRight: 8,
                            borderRadius: 16,
                            backgroundColor: activeCategoryId === cat.id ? darkBrown : lightBeige,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: 'Philosopher-Bold',
                              fontSize: 12,
                              color: activeCategoryId === cat.id ? white : darkBrown,
                            }}
                          >
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Service list for selected category */}
                    {activeCategoryServices.length === 0 ? (
                      <Text style={{ fontFamily: 'Philosopher-Regular', color: '#888', fontSize: 13, paddingVertical: 8 }}>
                        All services from this category are already added.
                      </Text>
                    ) : (
                      <View style={{ borderWidth: 1.5, borderColor: beige, borderRadius: 10, overflow: 'hidden' }}>
                        {activeCategoryServices.map((svc, i) => (
                          <TouchableOpacity
                            key={svc.id}
                            onPress={() => setForm((f) => ({ ...f, serviceId: svc.id }))}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 14,
                              paddingVertical: 10,
                              backgroundColor: form.serviceId === svc.id ? lightBeige : white,
                              borderBottomWidth: i < activeCategoryServices.length - 1 ? 1 : 0,
                              borderBottomColor: beige,
                            }}
                          >
                            <Ionicons
                              name={form.serviceId === svc.id ? 'radio-button-on' : 'radio-button-off'}
                              size={18}
                              color={darkBrown}
                              style={{ marginRight: 10 }}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 14, color: darkBrown }}>{svc.name}</Text>
                              {svc.description && (
                                <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#888', marginTop: 1 }}>
                                  {svc.description}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* ── Service name (edit — read only) ── */}
                {isEditing && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={labelStyle}>Service</Text>
                    <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 15, color: darkBrown, paddingVertical: 8 }}>
                      {services.find((s) => s.serviceId === form.serviceId)?.service?.name ?? '—'}
                    </Text>
                  </View>
                )}

                {/* ── Price ── */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={labelStyle}>Price (€) *</Text>
                  <TextInput
                    style={inputStyle}
                    value={form.price}
                    onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#bbb"
                  />
                </View>

                {/* ── Duration ── */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={labelStyle}>Duration (minutes) *</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {DURATIONS.map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setForm((f) => ({ ...f, durationMinutes: d }))}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor: form.durationMinutes === d ? darkBrown : lightBeige,
                          borderWidth: 1.5,
                          borderColor: form.durationMinutes === d ? darkBrown : beige,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: 'Philosopher-Bold',
                            fontSize: 13,
                            color: form.durationMinutes === d ? white : darkBrown,
                          }}
                        >
                          {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* ── Active toggle ── */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <Text style={labelStyle}>Active</Text>
                  <Switch
                    value={form.isAvailable}
                    onValueChange={(v) => setForm((f) => ({ ...f, isAvailable: v }))}
                    trackColor={{ false: beige, true: darkBrown }}
                    thumbColor={white}
                  />
                </View>

                {/* ── Save button ── */}
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={saving}
                  style={{
                    backgroundColor: darkBrown,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator color={white} />
                  ) : (
                    <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: white }}>
                      {isEditing ? 'Save Changes' : 'Add Service'}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const darkBrownColor = '#423120';
const beigeColor = '#D7C3A7';

const labelStyle = {
  fontFamily: 'Philosopher-Bold' as const,
  fontSize: 13,
  color: '#888',
  textTransform: 'uppercase' as const,
  letterSpacing: 0.5,
  marginBottom: 6,
};

const inputStyle = {
  borderWidth: 1.5,
  borderColor: beigeColor,
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 10,
  fontFamily: 'Philosopher-Regular' as const,
  fontSize: 15,
  color: darkBrownColor,
};
