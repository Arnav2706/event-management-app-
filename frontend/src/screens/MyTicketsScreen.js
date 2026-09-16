import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registrationAPI } from '../services/api';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import TicketCard from '../components/TicketCard';

export default function MyTicketsScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await registrationAPI.getMyTickets();
      if (res.data.success) {
        setTickets(res.data.registrations || []);
      }
    } catch (error) {
      console.error('Error fetching passes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const handleCancelTicket = (ticketId) => {
    const doCancel = async () => {
      try {
        const res = await registrationAPI.cancelRegistration(ticketId);
        if (res.data.success) {
          if (Platform.OS === 'web') {
            window.alert('Your reservation has been surrendered.');
          } else {
            Alert.alert('Released', 'Your reservation has been surrendered.');
          }
          fetchTickets();
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Could not cancel pass.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Cancellation Failed', msg);
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you certain you wish to release your reservation? This will return the ticket to the public registry.')) {
        doCancel();
      }
      return;
    }

    Alert.alert(
      'Surrender Invitation',
      'Are you certain you wish to release your reservation? This will return the ticket to the public registry.',
      [
        { text: 'Keep Pass', style: 'cancel' },
        {
          text: 'Release Ticket',
          style: 'destructive',
          onPress: doCancel,
        },
      ]
    );
  };

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
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={styles.headerSub}>CREDENTIAL REGISTRY</Text>
          <Text style={styles.headerTitle}>Private Passes</Text>
          <Text style={styles.headerCount}>{tickets.length} Active Invitations</Text>
        </View>

        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Retrieving passes...</Text>
          </View>
        ) : tickets.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="ticket-outline" size={48} color={COLORS.outlineVariant} />
            </View>
            <Text style={styles.emptyTitle}>No Active Invitations</Text>
            <Text style={styles.emptySub}>
              You have not reserved any curated gatherings yet. Explore our discovery salon to gain admission.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('HomeTab')}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>EXPLORE GATHERINGS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onCancel={handleCancelTicket}
            />
          ))
        )}
      </ScrollView>
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
    marginBottom: 24,
    marginTop: 8,
  },
  headerSub: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  headerCount: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  centerWrap: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.sm,
  },
  emptyWrap: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySub: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: BORDER_RADIUS.full,
  },
  exploreBtnText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
