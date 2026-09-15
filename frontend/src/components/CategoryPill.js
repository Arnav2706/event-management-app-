import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

export default function CategoryPill({ name, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.pill, isActive && styles.active]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isActive && styles.activeText]}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginRight: 10,
  },
  active: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.outline,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  activeText: {
    color: COLORS.primary,
  },
});
