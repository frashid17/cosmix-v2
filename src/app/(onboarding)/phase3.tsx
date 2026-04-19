import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, Modal, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, Switch, SafeAreaView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../../config/constants';

const darkBrown = '#423120';
const beige = '#D7C3A7';
const lightBeige = '#F4EDE5';
const white = '#FFFFFF';
const DURATIONS = [15, 30, 45, 60, 90, 120];

type GlobalService = { id: string; name: string; description?: string };
type GlobalCategory = { id: string; name: string; services: GlobalService[] };
type SaloonService = {
  serviceId: string; saloonId: string; price: number;
  durationMinutes: number; isAvailable: boolean;
  service: { id: string; name: string; description?: string; category?: { name: string } };
};
type FormState = { serviceId: string; price: string; durationMinutes: number; isAvailable: boolean };
const EMPTY_FORM: FormState = { serviceId: '', price: '', durationMinutes: 30, isAvailable: true };

const labelStyle = {
  fontFamily: 'Philosopher-Bold' as const, fontSize: 13, color: '#888',
  textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 6,
};
const inputStyle = {
  borderWidth: 1.5, borderColor: beige, borderRadius: 10,
  paddingHorizontal: 14, paddingVertical: 10,
  fontFamily: 'Philosopher-Regular' as const, fontSize: 15, color: darkBrown,
};

export default function Phase3Screen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();

  const [saloonId, setSaloonId] = useState<string | null>(null);
  const [services, setServices] = useState<SaloonService[]>([]);
  const [categories, setCategories] = useState<GlobalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getTokenRef.current();
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
    };
    if (token) h['X-User-Token'] = token;
    return h;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const headers = await authHeaders();
      const saloonRes = await fetch(`${API_BASE_URL}/saloons`, { headers });
      if (!saloonRes.ok) throw new Error();
      const saloons = await saloonRes.json();
      if (!Array.isArray(saloons) || saloons.length === 0) {
        setLoading(false);
        return;
      }
      const id = saloons[0].id;
      setSaloonId(id);

      const [svcRes, catRes] = await Promise.all([
        fetch(`${API_BASE_URL}/saloons/${id}/services`, { headers }),
        fetch(`${API_BASE_URL}/public/categories`),
      ]);
      if (svcRes.ok) setServices(await svcRes.json());
      if (catRes.ok) {
        const cats = await catRes.json();
        setCategories(Array.isArray(cats) ? cats.filter((c: GlobalCategory) => c.services?.length > 0) : []);
      }
    } catch {
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setIsEditing(false);
    setForm(EMPTY_FORM);
    setActiveCategoryId(categories[0]?.id ?? null);
    setModalVisible(true);
  };

  const openEdit = (svc: SaloonService) => {
    setIsEditing(true);
    setForm({ serviceId: svc.serviceId, price: String(svc.price), durationMinutes: svc.durationMinutes, isAvailable: svc.isAvailable });
    setModalVisible(true);
  };

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
          method: 'PATCH', headers,
          body: JSON.stringify({ price, durationMinutes: form.durationMinutes, isAvailable: form.isAvailable }),
        });
        if (!res.ok) throw new Error();
        setServices(prev => prev.map(s => s.serviceId === form.serviceId
          ? { ...s, price, durationMinutes: form.durationMinutes, isAvailable: form.isAvailable } : s));
      } else {
        const res = await fetch(`${API_BASE_URL}/saloons/${saloonId}/services`, {
          method: 'POST', headers,
          body: JSON.stringify({ serviceId: form.serviceId, price, durationMinutes: form.durationMinutes, isAvailable: form.isAvailable }),
        });
        if (!res.ok) throw new Error(await res.text());
        const svcRes = await fetch(`${API_BASE_URL}/saloons/${saloonId}/services`, { headers });
        if (svcRes.ok) setServices(await svcRes.json());
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (svc: SaloonService) => {
    Alert.alert('Remove service?', `Remove "${svc.service?.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          if (!saloonId) return;
          setServices(prev => prev.filter(s => s.serviceId !== svc.serviceId));
          try {
            const headers = await authHeaders();
            const res = await fetch(`${API_BASE_URL}/saloons/${saloonId}/services/${svc.serviceId}`, { method: 'DELETE', headers });
            if (!res.ok) throw new Error();
          } catch {
            setServices(prev => [...prev, svc]);
            Alert.alert('Error', 'Failed to remove service.');
          }
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    if (services.length === 0) return;
    setSubmitting(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/provider/apply/phase3`, { method: 'POST', headers });
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

  const addedServiceIds = new Set(services.map(s => s.serviceId));
  const activeCategoryServices =
    categories.find(c => c.id === activeCategoryId)?.services.filter(s => !addedServiceIds.has(s.id)) ?? [];

  const renderService = ({ item, index }: { item: SaloonService; index: number }) => (
    <View style={{
      paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center',
      borderBottomWidth: index < services.length - 1 ? 1 : 0, borderBottomColor: beige,
    }}>
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={darkBrown} />
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#888', marginTop: 12 }}>
          Loading your salon…
        </Text>
      </SafeAreaView>
    );
  }

  // Race condition — saloon not yet created by backend
  if (!saloonId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: white, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <ActivityIndicator size="large" color={darkBrown} style={{ marginBottom: 16 }} />
        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 18, color: darkBrown, textAlign: 'center', marginBottom: 8 }}>
          Setting up your salon
        </Text>
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#888', textAlign: 'center' }}>
          This usually takes a moment. Please wait…
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: beige }}>
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#888', marginBottom: 4 }}>Step 3 of 3</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 22, color: darkBrown }}>Add your services</Text>
            <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#666', marginTop: 2 }}>
              Add at least one service to go live
            </Text>
          </View>
          <TouchableOpacity
            onPress={openAdd}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: darkBrown, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 }}
          >
            <Ionicons name="add" size={18} color={white} />
            <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 13, color: white }}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
          {[0, 1, 2].map(i => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: darkBrown }} />
          ))}
        </View>
      </View>

      {/* Note */}
      <View style={{ marginHorizontal: 20, marginTop: 14, backgroundColor: lightBeige, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <Ionicons name="information-circle-outline" size={16} color={darkBrown} style={{ marginTop: 1 }} />
        <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#555', flex: 1, lineHeight: 18 }}>
          Your services will be visible to customers after admin approval.
        </Text>
      </View>

      {/* Service list */}
      {services.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <Ionicons name="cut-outline" size={48} color={beige} style={{ marginBottom: 12 }} />
          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: darkBrown, textAlign: 'center' }}>
            No services yet
          </Text>
          <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 14, color: '#888', textAlign: 'center', marginTop: 6 }}>
            Add at least one service to continue.
          </Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={item => item.serviceId}
          renderItem={renderService}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListHeaderComponent={
            <View style={{ borderWidth: 2, borderColor: beige, borderRadius: 12, marginHorizontal: 20, marginTop: 16, overflow: 'hidden' }} />
          }
        />
      )}

      {/* Submit footer */}
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: beige, backgroundColor: white }}>
        {services.length === 0 && (
          <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 13, color: '#aaa', textAlign: 'center', marginBottom: 10 }}>
            Add at least one service to continue
          </Text>
        )}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={services.length === 0 || submitting}
          style={{
            backgroundColor: services.length === 0 ? beige : darkBrown,
            borderRadius: 12, paddingVertical: 16, alignItems: 'center',
          }}
        >
          {submitting
            ? <ActivityIndicator color={white} />
            : <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: white }}>Submit for review</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Add/Edit service modal */}
      <Modal visible={modalVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
            <View style={{
              backgroundColor: white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
              paddingHorizontal: 20, paddingTop: 16, paddingBottom: insets.bottom + 16, maxHeight: '90%',
            }}>
              <View style={{ width: 40, height: 4, backgroundColor: beige, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 20, color: darkBrown }}>
                  {isEditing ? 'Edit Service' : 'Add Service'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={24} color={darkBrown} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {!isEditing && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={labelStyle}>Service *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                      {categories.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => { setActiveCategoryId(cat.id); setForm(f => ({ ...f, serviceId: '' })); }}
                          style={{ paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, borderRadius: 16, backgroundColor: activeCategoryId === cat.id ? darkBrown : lightBeige }}
                        >
                          <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 12, color: activeCategoryId === cat.id ? white : darkBrown }}>
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    {activeCategoryServices.length === 0
                      ? <Text style={{ fontFamily: 'Philosopher-Regular', color: '#888', fontSize: 13, paddingVertical: 8 }}>
                          All services from this category are already added.
                        </Text>
                      : (
                        <View style={{ borderWidth: 1.5, borderColor: beige, borderRadius: 10, overflow: 'hidden' }}>
                          {activeCategoryServices.map((svc, i) => (
                            <TouchableOpacity
                              key={svc.id}
                              onPress={() => setForm(f => ({ ...f, serviceId: svc.id }))}
                              style={{
                                flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
                                backgroundColor: form.serviceId === svc.id ? lightBeige : white,
                                borderBottomWidth: i < activeCategoryServices.length - 1 ? 1 : 0, borderBottomColor: beige,
                              }}
                            >
                              <Ionicons name={form.serviceId === svc.id ? 'radio-button-on' : 'radio-button-off'} size={18} color={darkBrown} style={{ marginRight: 10 }} />
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 14, color: darkBrown }}>{svc.name}</Text>
                                {svc.description && (
                                  <Text style={{ fontFamily: 'Philosopher-Regular', fontSize: 12, color: '#888', marginTop: 1 }}>{svc.description}</Text>
                                )}
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )
                    }
                  </View>
                )}

                {isEditing && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={labelStyle}>Service</Text>
                    <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 15, color: darkBrown, paddingVertical: 8 }}>
                      {services.find(s => s.serviceId === form.serviceId)?.service?.name ?? '—'}
                    </Text>
                  </View>
                )}

                <View style={{ marginBottom: 20 }}>
                  <Text style={labelStyle}>Price (€) *</Text>
                  <TextInput
                    style={inputStyle} value={form.price}
                    onChangeText={v => setForm(f => ({ ...f, price: v }))}
                    keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#bbb"
                  />
                </View>

                <View style={{ marginBottom: 20 }}>
                  <Text style={labelStyle}>Duration (minutes) *</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {DURATIONS.map(d => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setForm(f => ({ ...f, durationMinutes: d }))}
                        style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: form.durationMinutes === d ? darkBrown : lightBeige, borderWidth: 1.5, borderColor: form.durationMinutes === d ? darkBrown : beige }}
                      >
                        <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 13, color: form.durationMinutes === d ? white : darkBrown }}>{d}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <Text style={labelStyle}>Active</Text>
                  <Switch value={form.isAvailable} onValueChange={v => setForm(f => ({ ...f, isAvailable: v }))} trackColor={{ false: beige, true: darkBrown }} thumbColor={white} />
                </View>

                <TouchableOpacity
                  onPress={handleSave} disabled={saving}
                  style={{ backgroundColor: darkBrown, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 8 }}
                >
                  {saving
                    ? <ActivityIndicator color={white} />
                    : <Text style={{ fontFamily: 'Philosopher-Bold', fontSize: 16, color: white }}>{isEditing ? 'Save Changes' : 'Add Service'}</Text>
                  }
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
