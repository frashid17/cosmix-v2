import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { API_BASE_URL } from '@/config/constants';

const darkBrown = '#423120';
const beige = '#D7C3A7';
const lightBeige = '#F4EDE5';
const white = '#FFFFFF';

type Slot = { time: string; datetime: string };

type Props = {
  saloonId: string;
  serviceId: string;
  onConfirm: (datetime: string) => void;
};

export default function TimeSlotPicker({ saloonId, serviceId, onConfirm }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const toAPIDate = (d: Date) => d.toISOString().split('T')[0];

  const toDisplayDate = (d: Date) =>
    d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' });

  useEffect(() => {
    let cancelled = false;

    const fetchSlots = async () => {
      setLoading(true);
      setSelectedSlot(null);
      setIsClosed(false);
      setSlots([]);
      try {
        const url =
          `${API_BASE_URL}/public/saloons/${saloonId}/available-slots` +
          `?serviceId=${serviceId}&date=${toAPIDate(selectedDate)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;
        if (data.isClosed) {
          setIsClosed(true);
        } else {
          setSlots(data.availableSlots ?? []);
        }
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSlots();
    return () => { cancelled = true; };
  }, [selectedDate, saloonId, serviceId]);

  return (
    <View>
      {/* Date pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 4 }}
        style={{ marginBottom: 16 }}
      >
        {dates.map((d, i) => {
          const isSelected = toAPIDate(d) === toAPIDate(selectedDate);
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedDate(d)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: isSelected ? darkBrown : white,
                borderWidth: 1.5,
                borderColor: isSelected ? darkBrown : beige,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Philosopher-Bold',
                  fontSize: 13,
                  color: isSelected ? white : darkBrown,
                }}
              >
                {toDisplayDate(d)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Slot grid */}
      {loading ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: '47%',
                height: 46,
                borderRadius: 10,
                backgroundColor: beige,
                opacity: 0.35,
              }}
            />
          ))}
        </View>
      ) : isClosed ? (
        <View style={{ paddingVertical: 28, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Philosopher-Bold',
              fontSize: 15,
              color: '#c00',
              marginBottom: 4,
            }}
          >
            Closed on this day
          </Text>
          <Text
            style={{
              fontFamily: 'Philosopher-Regular',
              fontSize: 13,
              color: '#888',
            }}
          >
            Please select another date
          </Text>
        </View>
      ) : slots.length === 0 ? (
        <View style={{ paddingVertical: 28, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Philosopher-Regular',
              fontSize: 14,
              color: '#888',
            }}
          >
            No available slots for this date
          </Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {slots.map((slot) => {
            const isSelected = selectedSlot?.datetime === slot.datetime;
            return (
              <TouchableOpacity
                key={slot.datetime}
                onPress={() => setSelectedSlot(slot)}
                style={{
                  width: '47%',
                  paddingVertical: 13,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: isSelected ? darkBrown : white,
                  borderWidth: 1.5,
                  borderColor: isSelected ? darkBrown : beige,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Philosopher-Bold',
                    fontSize: 15,
                    color: isSelected ? white : darkBrown,
                  }}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Confirm button */}
      <TouchableOpacity
        onPress={() => selectedSlot && onConfirm(selectedSlot.datetime)}
        disabled={!selectedSlot}
        style={{
          marginTop: 20,
          backgroundColor: selectedSlot ? darkBrown : lightBeige,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: selectedSlot ? darkBrown : beige,
        }}
      >
        <Text
          style={{
            fontFamily: 'Philosopher-Bold',
            fontSize: 16,
            color: selectedSlot ? white : '#aaa',
          }}
        >
          Confirm booking time
        </Text>
      </TouchableOpacity>
    </View>
  );
}
