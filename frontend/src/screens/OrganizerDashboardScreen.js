import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventAPI, registrationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import CreateEventModal from './CreateEventModal';

export default function OrganizerDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Attendees Modal state
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const fetchMyEvents = useCallback(async () => {
    try {
      const res = await eventAPI.getMyOrganizedEvents();
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (error) {
      console.error('Error fetching organizer events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyEvents();
  };

  const handleOpenAttendees = async (event) => {
    setSelectedEvent(event);
    setAttendeesModalVisible(true);
    setLoadingAttendees(true);
    try {
      const res = await registrationAPI.getEventParticipants(event._id);
      if (res.data.success) {
        setAttendees(res.data.participants || []);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not load guest list.');
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleDeleteEvent = (eventId, title) => {
    const doDelete = async () => {
      try {
        const res = await eventAPI.deleteEvent(eventId);
        if (res.data.success) {
          if (Platform.OS === 'web') {
            window.alert('Salon has been removed.');
          } else {
            Alert.alert('Withdrawn', 'Salon has been removed.');
          }
          fetchMyEvents();
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Could not delete salon.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Error', msg);
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you certain you wish to delete "${title}"? This cannot be undone.`)) {
        doDelete();
      }
      return;
    }

    Alert.alert(
      'Withdraw Curation',
      `Are you certain you wish to delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: doDelete,
        },
      ]
    );
  };

  // Metrics
  const totalRSVPs = events.reduce((acc, curr) => acc + (curr.currentParticipantsCount || 0), 0);
  const totalCapacity = events.reduce((acc, curr) => acc + (curr.maxParticipants || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Curator Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>CURATOR ATELIER</Text>
            <Text style={styles.headerTitle}>{user?.name || 'Curator'}</Text>
            <Text style={styles.headerEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.outline} />
          </TouchableOpacity>
        </View>

        {/* Curator Metrics Bar */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{events.length}</Text>
            <Text style={styles.statLabel}>SALONS HOSTED</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalRSVPs}</Text>
            <Text style={styles.statLabel}>GUESTS ADMITTED</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCapacity}</Text>
            <Text style={styles.statLabel}>TOTAL CAPACITY</Text>
          </View>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.background} />
          <Text style={styles.createBtnText}>CURATE NEW SALON</Text>
        </TouchableOpacity>

        {/* Events List Header */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>MY MANAGED GATHERINGS</Text>
          <Text style={styles.sectionCount}>{events.length} Salons</Text>
        </View>

        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading curator dashboard...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="sparkles-outline" size={48} color={COLORS.outlineVariant} />
            <Text style={styles.emptyTitle}>No Curations Yet</Text>
            <Text style={styles.emptySub}>
              Tap the button above to host and publish your first exclusive experience.
            </Text>
          </View>
        ) : (
          events.map((evt) => {
            const fillRate = Math.round((evt.currentParticipantsCount / evt.maxParticipants) * 100);
            return (
              <View key={evt._id} style={styles.eventCard}>
                <View style={styles.cardTop}>
                  <View style={styles.cardHeaderCol}>
                    <Text style={styles.cardCategory}>
                      {evt.categoryId?.name || 'Private Salon'}
                    </Text>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {evt.title}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{evt.status?.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.champagne} />
                    <Text style={styles.metaText}>
                      {new Date(evt.eventDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={13} color={COLORS.champagne} />
                    <Text style={styles.metaText}>{evt.startTime} — {evt.endTime}</Text>
                  </View>
                </View>

                {/* Capacity Meter */}
                <View style={styles.capacitySection}>
                  <View style={styles.capacityHeader}>
                    <Text style={styles.capacityLabel}>
                      Reservations: {evt.currentParticipantsCount} / {evt.maxParticipants}
                    </Text>
                    <Text style={styles.capacityPercent}>{fillRate}% Filled</Text>
                  </View>
                  <View style={styles.capacityTrack}>
                    <View
                      style={[
                        styles.capacityBar,
                        { width: `${Math.min(fillRate, 100)}%` },
                      ]}
                    />
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.attendeesBtn}
                    onPress={() => handleOpenAttendees(evt)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="people-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.attendeesBtnText}>Guest Registry</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteEvent(evt._id, evt.title)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Create Event Modal */}
      <CreateEventModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={fetchMyEvents}
      />

      {/* Guest List / Attendees Modal */}
      <Modal visible={attendeesModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.attendeesSheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetSub}>GUEST REGISTRY</Text>
                <Text style={styles.sheetTitle} numberOfLines={1}>
                  {selectedEvent?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAttendeesModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            {loadingAttendees ? (
              <View style={styles.centerWrap}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : attendees.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="people-outline" size={44} color={COLORS.outlineVariant} />
                <Text style={styles.emptyTitle}>No Reservations Yet</Text>
                <Text style={styles.emptySub}>
                  No patrons have claimed tickets for this gathering.
                </Text>
              </View>
            ) : (
              <FlatList
                data={attendees}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item, index }) => (
                  <View style={styles.attendeeItem}>
                    <View style={styles.attendeeAvatar}>
                      <Text style={styles.attendeeInitial}>
                        {item.userId?.name?.charAt(0) || 'P'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.attendeeName}>{item.userId?.name || 'Patron'}</Text>
                      <Text style={styles.attendeeEmail}>{item.userId?.email}</Text>
                    </View>
                    <View style={styles.passBadge}>
                      <Text style={styles.passBadgeText}>#{index + 1}</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.margin,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
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
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
  },
  headerEmail: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.outline,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: 28,
  },
  createBtnText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 2,
  },
  sectionCount: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  centerWrap: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.sm,
  },
  emptyWrap: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  emptySub: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    maxWidth: 240,
  },
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 16,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderCol: {
    flex: 1,
    marginRight: 10,
  },
  cardCategory: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardTitle: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  statusText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
  },
  capacitySection: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.sm,
    padding: 10,
    marginBottom: 14,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  capacityLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  capacityPercent: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  capacityTrack: {
    height: 4,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  attendeesBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  attendeesBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  attendeesSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    maxHeight: '75%',
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  sheetSub: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 2,
  },
  sheetTitle: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    maxWidth: 260,
  },
  closeBtn: {
    padding: 6,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    gap: 12,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeInitial: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },
  attendeeName: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },
  attendeeEmail: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
  },
  passBadge: {
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  passBadgeText: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
});
