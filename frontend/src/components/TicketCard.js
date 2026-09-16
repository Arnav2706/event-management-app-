import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';

export default function TicketCard({ ticket, onCancel }) {
  const event = ticket.eventId;
  if (!event) return null;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.card}>
      {/* Top Section - Event Info */}
      <View style={styles.topSection}>
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>CONFIRMED</Text>
          </View>
          <Text style={styles.ticketCode}>{ticket.qrTicketCode}</Text>
        </View>

        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.champagne} />
            <Text style={styles.detailText}>{formatDate(event.eventDate)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.champagne} />
            <Text style={styles.detailText}>{event.startTime}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color={COLORS.champagne} />
          <Text style={styles.detailText} numberOfLines={1}>{event.venue?.name || 'Venue TBD'}</Text>
        </View>
      </View>

      {/* Perforated Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.notchLeft} />
        <View style={styles.dashedLine} />
        <View style={styles.notchRight} />
      </View>

      {/* Bottom Section - QR & Actions */}
      <View style={styles.bottomSection}>
        <View style={styles.qrPlaceholder}>
          <Ionicons name="qr-code-outline" size={48} color={COLORS.champagne} />
          <Text style={styles.qrLabel}>SCAN AT VENUE</Text>
        </View>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel?.(ticket._id)}>
          <Ionicons name="close-circle-outline" size={16} color={COLORS.error} />
          <Text style={styles.cancelText}>Cancel Ticket</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  topSection: {
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  statusText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ticketCode: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  eventTitle: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailText: {
    color: COLORS.onSurfaceVariant,
    fontSize: FONT_SIZES.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
  },
  notchLeft: {
    width: 16,
    height: 32,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: COLORS.background,
    marginLeft: -1,
  },
  notchRight: {
    width: 16,
    height: 32,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: COLORS.background,
    marginRight: -1,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  bottomSection: {
    padding: 16,
    alignItems: 'center',
  },
  qrPlaceholder: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  qrLabel: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  cancelText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
