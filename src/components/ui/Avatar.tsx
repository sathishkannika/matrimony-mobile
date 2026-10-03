import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { User } from 'lucide-react-native';
import { colors } from '../../theme/tokens';

export function Avatar({ uri, size = 64, restricted }: { uri?: string | null; size?: number; restricted?: boolean }) {
  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2 },
        restricted ? { opacity: 0.55 } : null,
      ]}
    >
      {uri && !restricted ? (
        <Image source={{ uri }} style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }} />
      ) : (
        <View style={[styles.fallback, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]}>
          <User size={size * 0.4} color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary },
});
