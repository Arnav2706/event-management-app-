import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventAPI, categoryAPI } from '../services/api';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import GradientButton from '../components/GradientButton';

export default function CreateEventModal({ visible, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [eventDate, setEventDate] = useState('2026-10-15');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('22:00');
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-10-14');
  const [maxParticipants, setMaxParticipants] = useState('25');
  const [bannerImage, setBannerImage] = useState(
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80'
  );

  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getCategories();
      if (res.data.success && res.data.categories.length > 0) {
        setCategories(res.data.categories);
        if (!categoryId) {
          setCategoryId(res.data.categories[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !venueName.trim() || !venueAddress.trim()) {
      Alert.alert('Incomplete', 'Please provide a title, description, and venue location.');
      return;
    }

    if (!categoryId) {
      Alert.alert('Category Required', 'Please assign a category to this salon.');
      return;
    }

    const capacity = parseInt(maxParticipants, 10);
    if (isNaN(capacity) || capacity < 1) {
      Alert.alert('Invalid Capacity', 'Capacity must be at least 1 guest.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        venue: {
          name: venueName.trim(),
          address: venueAddress.trim(),
        },
        eventDate: new Date(eventDate).toISOString(),
        startTime,
        endTime,
        registrationDeadline: new Date(registrationDeadline).toISOString(),
        maxParticipants: capacity,
        bannerImage: bannerImage.trim(),
        status: 'published',
      };

      const res = await eventAPI.createEvent(payload);
      if (res.data.success) {
        Alert.alert('Salon Published', 'Your gathering is now live in the Atelier directory.');
        onSuccess?.();
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setVenueName('');
        setVenueAddress('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not publish salon.';
      Alert.alert('Publication Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.headerSub}>CURATOR ATELIER</Text>
              <Text style={styles.headerTitle}>Curate New Salon</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={styles.label}>SALON TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Nocturnal Jazz & Amber Spirits"
              placeholderTextColor={COLORS.outline}
              value={title}
              onChangeText={setTitle}
            />

            {/* Category */}
            <Text style={styles.label}>GENRE / CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c._id}
                  style={[styles.catPill, categoryId === c._id && styles.catPillActive]}
                  onPress={() => setCategoryId(c._id)}
                >
                  <Text
                    style={[styles.catPillText, categoryId === c._id && styles.catPillTextActive]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Description */}
            <Text style={styles.label}>NARRATIVE / DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the aesthetic, dress code, and sensory journey..."
              placeholderTextColor={COLORS.outline}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            {/* Venue Specs */}
            <Text style={styles.label}>VENUE NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. The Glasshouse Observatory"
              placeholderTextColor={COLORS.outline}
              value={venueName}
              onChangeText={setVenueName}
            />

            <Text style={styles.label}>VENUE ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 420 Highridge Terrace, Pavilion 3"
              placeholderTextColor={COLORS.outline}
              value={venueAddress}
              onChangeText={setVenueAddress}
            />

            {/* Date & Capacity */}
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.label}>DATE (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-10-15"
                  placeholderTextColor={COLORS.outline}
                  value={eventDate}
                  onChangeText={setEventDate}
                />
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.label}>GUEST CAPACITY</Text>
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  placeholderTextColor={COLORS.outline}
                  value={maxParticipants}
                  onChangeText={setMaxParticipants}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Times */}
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.label}>START TIME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="19:00"
                  placeholderTextColor={COLORS.outline}
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.label}>END TIME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="22:00"
                  placeholderTextColor={COLORS.outline}
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>
            </View>

            {/* Registration Deadline */}
            <Text style={styles.label}>RSVP DEADLINE (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-10-14"
              placeholderTextColor={COLORS.outline}
              value={registrationDeadline}
              onChangeText={setRegistrationDeadline}
            />

            {/* Banner Image URL */}
            <Text style={styles.label}>BANNER IMAGE URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor={COLORS.outline}
              value={bannerImage}
              onChangeText={setBannerImage}
            />

            {/* Publish Button */}
            <GradientButton
              title="PUBLISH SALON INVITATION"
              onPress={handleCreate}
              loading={submitting}
              style={styles.submitBtn}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    maxHeight: '90%',
    paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  headerSub: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerTitle: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 14,
    height: 48,
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.base,
  },
  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  catRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginRight: 8,
  },
  catPillActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  catPillText: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCol: {
    flex: 1,
  },
  submitBtn: {
    marginTop: 24,
    marginBottom: 40,
  },
});
