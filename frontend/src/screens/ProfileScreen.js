import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import GradientButton from '../components/GradientButton';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      logout();
      return;
    }
    Alert.alert('Sign Out', 'Are you sure you want to end your Atelier session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSub}>CONCIERGE PROFILE</Text>
          <Text style={styles.headerTitle}>Membership Dossier</Text>
        </View>

        {/* Member Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'M'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Atelier Patron'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.tierBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.primary} />
            <Text style={styles.tierText}>
              {user?.role === 'organizer' ? 'CURATOR PRIVILEGE' : 'PATRON TIER'}
            </Text>
          </View>
        </View>

        {/* Dossier Specs */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member ID</Text>
            <Text style={styles.infoVal}>{user?.id || user?._id || 'ATELIER-889'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Access Tier</Text>
            <Text style={styles.infoVal}>{user?.role?.toUpperCase() || 'STANDARD'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoVal, { color: COLORS.success }]}>VERIFIED & ACTIVE</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.logoutWrap}>
          <GradientButton
            title="SURRENDER SESSION • SIGN OUT"
            onPress={handleLogout}
            variant="danger"
          />
        </View>
      </View>
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
    padding: SPACING.margin,
  },
  header: {
    marginTop: 8,
    marginBottom: 28,
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
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  userName: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    marginBottom: 4,
  },
  userEmail: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.sm,
    marginBottom: 16,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary + '18',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  tierText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 18,
    marginBottom: 28,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  infoLabel: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.sm,
  },
  infoVal: {
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  logoutWrap: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});
