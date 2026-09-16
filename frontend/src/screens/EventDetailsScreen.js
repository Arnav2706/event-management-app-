import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventAPI, registrationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import GradientButton from '../components/GradientButton';

export default function EventDetailsScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const res = await eventAPI.getEventById(eventId);
      if (res.data.success) {
        setEvent(res.data.event);
      }

      // Check if user is already registered
      try {
        const ticketRes = await registrationAPI.getMyTickets();
        if (ticketRes.data.success) {
          const registered = ticketRes.data.registrations.some(
            (r) => r.eventId?._id === eventId && r.status === 'confirmed'
          );
          setIsRegistered(registered);
        }
      } catch (err) {
        // Silent ticket check failure
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load event details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      const res = await registrationAPI.registerForEvent(eventId);
      if (res.data.success) {
        setIsRegistered(true);
        if (Platform.OS === 'web') {
          if (window.confirm('Pass Confirmed! Your exclusive invitation has been reserved. Would you like to view your pass now?')) {
            navigation.navigate('TicketsTab');
          }
        } else {
          Alert.alert(
            'Pass Confirmed',
            'Your exclusive invitation has been reserved. You can find your pass under "My Passes".',
            [
              { text: 'Later', style: 'cancel' },
              {
                text: 'View Pass',
                onPress: () => navigation.navigate('TicketsTab'),
              },
            ]
          );
        }
        // Refresh event to update capacity count
        fetchEventDetails();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Could not complete registration.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Reservation Failed', message);
      }
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!event) return null;

  const spotsLeft = event.maxParticipants - event.currentParticipantsCount;
  const isFull = spotsLeft <= 0;
  const isPastDeadline = new Date() > new Date(event.registrationDeadline);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Banner Hero */}
        <View style={styles.heroWrap}>
          <Image
            source={{
              uri:
                event.bannerImage ||
                'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroGradient} />

          {/* Floating Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Category Pill */}
          {event.categoryId?.name && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.categoryId.name}</Text>
            </View>
          )}
        </View>

        {/* Details Content */}
        <View style={styles.body}>
          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Key Metric Tags */}
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.champagne} />
              <Text style={styles.metaPillText}>{formatDate(event.eventDate)}</Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="time-outline" size={14} color={COLORS.champagne} />
              <Text style={styles.metaPillText}>
                {event.startTime} — {event.endTime}
              </Text>
            </View>
          </View>

          {/* Location Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>PRIVATE VENUE</Text>
            </View>
            <Text style={styles.venueName}>{event.venue?.name || 'Curated Location'}</Text>
            <Text style={styles.venueAddress}>{event.venue?.address || 'Disclosed to attendees'}</Text>
          </View>

          {/* Capacity Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="people-outline" size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>ATTENDANCE CAPACITY</Text>
            </View>
            <View style={styles.capacityRow}>
              <Text style={styles.capacityLarge}>{event.currentParticipantsCount}</Text>
              <Text style={styles.capacityTotal}>/ {event.maxParticipants} RESERVED</Text>
            </View>
            <View style={styles.capacityBar}>
              <View
                style={[
                  styles.capacityFill,
                  {
                    width: `${Math.min(
                      (event.currentParticipantsCount / event.maxParticipants) * 100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.deadlineNotice}>
              Reservation deadline:{' '}
              {new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Curator / Host Card */}
          {event.organizerId && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="diamond-outline" size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>CURATED BY</Text>
              </View>
              <Text style={styles.curatorName}>{event.organizerId.name || 'Private Curator'}</Text>
              <Text style={styles.curatorEmail}>{event.organizerId.email}</Text>
            </View>
          )}

          {/* Detailed Description */}
          <View style={styles.descWrap}>
            <Text style={styles.descHeading}>ABOUT THIS CURATION</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        {isRegistered ? (
          <GradientButton
            title="PASS RESERVED • VIEW TICKET"
            onPress={() => navigation.navigate('TicketsTab')}
            variant="outline"
          />
        ) : isFull ? (
          <GradientButton title="FULL CAPACITY • CLOSED" disabled />
        ) : isPastDeadline ? (
          <GradientButton title="REGISTRATION DEADLINE PASSED" disabled />
        ) : (
          <GradientButton
            title="RESERVE INVITATION"
            onPress={handleRegister}
            loading={registering}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerWrap: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroWrap: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 14, 18, 0.45)',
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 14, 18, 0.75)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: {
    padding: SPACING.margin,
    marginTop: -10,
  },
  title: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  metaPillText: {
    color: COLORS.onSurfaceVariant,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  venueName: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  venueAddress: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.sm,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 10,
  },
  capacityLarge: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
  },
  capacityTotal: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  capacityBar: {
    height: 4,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  capacityFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  deadlineNotice: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
  },
  curatorName: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },
  curatorEmail: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  descWrap: {
    marginTop: 8,
  },
  descHeading: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  description: {
    color: COLORS.onSurfaceVariant,
    fontSize: FONT_SIZES.base,
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(14, 14, 18, 0.95)',
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    padding: SPACING.margin,
  },
});
