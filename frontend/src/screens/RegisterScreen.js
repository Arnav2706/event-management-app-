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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('participant'); // 'participant' | 'organizer'
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please fill in your full name, email, and keycode.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Security Note', 'Your keycode must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password.trim(), role);
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.subtitle}>EXCLUSIVE INVITATION</Text>
          <Text style={styles.title}>Apply For Entry</Text>
          <Text style={styles.tagline}>Select your membership tier and establish credentials</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Role Switcher */}
          <Text style={styles.inputLabel}>SELECT YOUR ROLE</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleOption, role === 'participant' && styles.roleOptionActive]}
              onPress={() => setRole('participant')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={role === 'participant' ? COLORS.primary : COLORS.outline}
              />
              <Text style={[styles.roleText, role === 'participant' && styles.roleTextActive]}>
                Participant
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleOption, role === 'organizer' && styles.roleOptionActive]}
              onPress={() => setRole('organizer')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="diamond-outline"
                size={18}
                color={role === 'organizer' ? COLORS.primary : COLORS.outline}
              />
              <Text style={[styles.roleText, role === 'organizer' && styles.roleTextActive]}>
                Organizer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name */}
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={COLORS.champagne} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Legal Name"
              placeholderTextColor={COLORS.outline}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={COLORS.champagne} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Official Email Address"
              placeholderTextColor={COLORS.outline}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.champagne} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Set Keycode (min 6 characters)"
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

          {/* Submit */}
          <GradientButton
            title="CREATE MEMBERSHIP"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />

          {/* Switch to Login */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already hold credentials? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchLink}>Sign In</Text>
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
    marginBottom: 28,
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
  inputLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.champagne,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainer,
  },
  roleOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '18',
  },
  roleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.outline,
    fontWeight: '600',
  },
  roleTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
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
});
