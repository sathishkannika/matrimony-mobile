import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing } from '../../theme/tokens';

type Variant = 'default' | 'gold' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  left?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = 'default',
  size = 'md',
  loading,
  disabled,
  left,
  style,
  ...rest
}: ButtonProps) {
  const pal = palette[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: pal.bg, borderColor: pal.border, opacity: disabled || loading ? 0.55 : pressed ? 0.88 : 1 },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={pal.fg} size="small" />
      ) : (
        <>
          {left}
          <Text style={[styles.label, { color: pal.fg }]} numberOfLines={1}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  default: { bg: colors.primary, fg: colors.primaryForeground, border: colors.primary },
  gold: { bg: colors.accent, fg: colors.accentForeground, border: colors.accent },
  outline: { bg: colors.card, fg: colors.primary, border: colors.primary },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  destructive: { bg: colors.destructive, fg: colors.accentForeground, border: colors.destructive },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    minWidth: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sm: { minHeight: 40, paddingHorizontal: spacing.sm },
  md: { minHeight: 44 },
  label: { fontFamily: fonts.bodySemibold, fontSize: 14 },
});
