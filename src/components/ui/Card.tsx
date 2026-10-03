import React, { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors, radius, shadow } from '../../theme/tokens';

export function Card({
  children,
  style,
  premium = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  premium?: boolean;
}) {
  return (
    <View style={[styles.card, shadow.card, style]}>
      {premium ? (
        <Svg height={3} width="100%" style={styles.bar}>
          <Defs>
            <LinearGradient id="cardBar" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.primary} />
              <Stop offset="0.5" stopColor={colors.accent} />
              <Stop offset="1" stopColor={colors.primary} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="3" fill="url(#cardBar)" />
        </Svg>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  bar: { position: 'absolute', top: 0, left: 0, right: 0 },
});
