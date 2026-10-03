import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../../theme/tokens';

export function Badge({
  label,
  variant = 'secondary',
}: {
  label: string;
  variant?: 'default' | 'secondary' | 'gold' | 'outline';
}) {
  const pal = {
    default: { bg: colors.primary, fg: colors.primaryForeground },
    secondary: { bg: colors.secondary, fg: colors.secondaryForeground },
    gold: { bg: colors.accent, fg: colors.accentForeground },
    outline: { bg: colors.card, fg: colors.foreground },
  }[variant];
  return (
    <View style={[styles.badge, { backgroundColor: pal.bg }]}>
      <Text style={[styles.text, { color: pal.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  text: { fontFamily: fonts.bodyBold, fontSize: 10, textTransform: 'uppercase' },
});
