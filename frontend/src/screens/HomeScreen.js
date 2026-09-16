import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventAPI, categoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import CategoryPill from '../components/CategoryPill';
import EventCard from '../components/EventCard';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch events & categories
  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, catsRes] = await Promise.all([
        eventAPI.getEvents({
          categoryId: selectedCategory || undefined,
          search: searchQuery.trim() || undefined,
          status: 'published',
        }),
        categoryAPI.getCategories(),
      ]);

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.events || []);
      }
      if (catsRes.data.success) {
        setCategories(catsRes.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching discovery feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const featuredEvent = events.length > 0 ? events[0] : null;
  const feedEvents = events.length > 1 ? events.slice(1) : events;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>DISTRICT PRIVILEGE</Text>
            <Text style={styles.headerTitle}>
              Welcome, {user?.name?.split(' ')[0] || 'Member'}
            </Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'PATRON'}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search curations, venues, genres..."
            placeholderTextColor={COLORS.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={fetchData}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills Scroller */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <CategoryPill
            name="All Salons"
            isActive={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat._id}
              name={cat.name}
              isActive={selectedCategory === cat._id}
              onPress={() => setSelectedCategory(cat._id === selectedCategory ? null : cat._id)}
            />
          ))}
        </ScrollView>

        {/* Content Loading State */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Curating experiences...</Text>
          </View>
        ) : (
          <>
            {/* Featured Hero Banner */}
            {featuredEvent && (
              <View style={styles.featuredSection}>
                <Text style={styles.sectionHeading}>FEATURED SPOTLIGHT</Text>
                <TouchableOpacity
                  style={styles.heroCard}
                  onPress={() => navigation.navigate('EventDetails', { eventId: featuredEvent._id })}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{
                      uri:
                        featuredEvent.bannerImage ||
                        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
                    }}
                    style={styles.heroImage}
                  />
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>ATELIER SELECTION</Text>
                  </View>
                  <View style={styles.heroContent}>
                    <Text style={styles.heroCategory}>
                      {featuredEvent.categoryId?.name || 'Private Salon'}
                    </Text>
                    <Text style={styles.heroTitle} numberOfLines={2}>
                      {featuredEvent.title}
                    </Text>
                    <View style={styles.heroDetails}>
                      <View style={styles.heroDetailItem}>
                        <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
                        <Text style={styles.heroDetailText}>
                          {new Date(featuredEvent.eventDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                      <View style={styles.heroDetailItem}>
                        <Ionicons name="location-outline" size={13} color={COLORS.primary} />
                        <Text style={styles.heroDetailText} numberOfLines={1}>
                          {featuredEvent.venue?.name || 'Private Venue'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Event Discovery Feed */}
            <View style={styles.feedSection}>
              <View style={styles.feedHeader}>
                <Text style={styles.sectionHeading}>UPCOMING CURATIONS</Text>
                <Text style={styles.eventCount}>{events.length} experiences</Text>
              </View>

              {events.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Ionicons name="sparkles-outline" size={48} color={COLORS.outlineVariant} />
                  <Text style={styles.emptyTitle}>No Gatherings Found</Text>
                  <Text style={styles.emptySub}>
                    Try exploring a different category or search term.
                  </Text>
                </View>
              ) : (
                feedEvents.map((evt) => (
                  <EventCard
                    key={evt._id}
                    event={evt}
                    onPress={() => navigation.navigate('EventDetails', { eventId: evt._id })}
                  />
                ))
              )}
            </View>
          </>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.margin,
    paddingTop: 16,
    paddingBottom: 12,
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
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  roleBadge: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  roleText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 16,
    height: 48,
    marginHorizontal: SPACING.margin,
    marginVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.base,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.margin,
    paddingVertical: 8,
  },
  loadingWrap: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.sm,
    letterSpacing: 0.5,
  },
  featuredSection: {
    paddingHorizontal: SPACING.margin,
    marginTop: 18,
  },
  sectionHeading: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  heroCard: {
    height: 240,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 14, 18, 0.55)',
  },
  heroBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  heroBadgeText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroContent: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  heroCategory: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  heroDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroDetailText: {
    color: COLORS.onSurfaceVariant,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  feedSection: {
    paddingHorizontal: SPACING.margin,
    marginTop: 24,
    paddingBottom: 40,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  eventCount: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
});
