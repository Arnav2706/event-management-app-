import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '../constants/theme';
import GradientButton from '../components/GradientButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password.trim());
    } catch (err) {
      Alert.alert('Access Denied', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for presentation/testing
  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>E</Text>
          </View>
          <Text style={styles.subtitle}>PRIVATE CONCIERGE</Text>
          <Text style={styles.title}>The Atelier</Text>
          <Text style={styles.tagline}>Curated experiences for the discerning few</Text>
        </View>

        {/* Auth Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>MEMBERSHIP SIGN IN</Text>

          {/* Email Input */}
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={COLORS.champagne} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Private Email Address"
              placeholderTextColor={COLORS.outline}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.champagne} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Atelier Keycode"
              placeholderTextColor={COLORS.outline}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeBtn}>
              <Ionicons
                name={secureText ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={COLORS.outline}
              />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <GradientButton
            title="REQUEST ACCESS"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          {/* Switch to Register */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Seeking admission? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.switchLink}>Request Membership</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Fast-Switchers for presentation ease */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>QUICK CREDENTIALS</Text>
          <View style={styles.demoRow}>
            <TouchableOpacity
              style={styles.demoPill}
              onPress={() => fillCredentials('participant@example.com', 'password123')}
            >
              <Ionicons name="person-outline" size={13} color={COLORS.champagne} />
              <Text style={styles.demoPillText}>Participant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoPill}
              onPress={() => fillCredentials('organizer@example.com', 'password123')}
            >
              <Ionicons name="diamond-outline" size={13} color={COLORS.champagne} />
              <Text style={styles.demoPillText}>Organizer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.margin,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  monogram: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.surfaceContainer,
  },
  monogramText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.champagne,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.outline,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  formTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.champagne,
    letterSpacing: 1.5,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: FONT_SIZES.base,
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    color: COLORS.outline,
    fontSize: FONT_SIZES.sm,
  },
  switchLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 28,
    alignItems: 'center',
  },
  demoTitle: {
    color: COLORS.muted,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  demoPillText: {
    color: COLORS.onSurfaceVariant,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});
