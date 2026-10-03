import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing, type as typeScale } from '../../theme/tokens';

export function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
      <Text style={[typeScale.caption, styles.gap]}>{label}</Text>
    </View>
  );
}

export function PageError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.error}>{message}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry}>
          <Text style={styles.retry}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PageEmpty({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={typeScale.caption}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { minHeight: 220, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  gap: { marginTop: spacing.sm },
  error: { color: colors.destructive, fontFamily: fonts.body, textAlign: 'center' },
  retry: { marginTop: spacing.sm, color: colors.primary, fontFamily: fonts.bodySemibold, textDecorationLine: 'underline' },
});
