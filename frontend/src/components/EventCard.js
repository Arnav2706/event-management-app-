import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';

export default function EventCard({ event, onPress }) {
  const spotsLeft = event.maxParticipants - event.currentParticipantsCount;
  const capacityPercent = (event.currentParticipantsCount / event.maxParticipants) * 100;
  const isFull = spotsLeft <= 0;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Banner */}
      <View style={styles.bannerWrap}>
        {event.bannerImage ? (
          <Image source={{ uri: event.bannerImage }} style={styles.banner} />
        ) : (
          <View style={[styles.banner, styles.placeholderBanner]}>
            <Ionicons name="calendar-outline" size={40} color={COLORS.outlineVariant} />
          </View>
        )}
        <View style={styles.bannerOverlay} />
        {/* Date Badge */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{formatDate(event.eventDate)}</Text>
        </View>
        {/* Category tag */}
        {event.categoryId?.name && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{event.categoryId.name}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.champagne} />
          <Text style={styles.infoText} numberOfLines={1}>{event.venue?.name || 'Venue TBD'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color={COLORS.champagne} />
          <Text style={styles.infoText}>{event.startTime} — {event.endTime}</Text>
        </View>

        {/* Capacity Bar */}
        <View style={styles.capacityWrap}>
          <View style={styles.capacityBarBg}>
            <View
              style={[
                styles.capacityBarFill,
                { width: `${Math.min(capacityPercent, 100)}%` },
                isFull && styles.capacityBarFull,
              ]}
            />
          </View>
          <Text style={[styles.spotsText, isFull && { color: COLORS.error }]}>
            {isFull ? 'SOLD OUT' : `${spotsLeft} spots left`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  bannerWrap: {
    height: 160,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderBanner: {
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  dateBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  dateBadgeText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  categoryTag: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: 'rgba(14, 14, 18, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  categoryTagText: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  content: {
    padding: 14,
  },
  title: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  capacityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  capacityBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityBarFill: {
    height: '100%',
    backgroundColor: COLORS.champagne,
    borderRadius: 2,
  },
  capacityBarFull: {
    backgroundColor: COLORS.error,
  },
  spotsText: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
