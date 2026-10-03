import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { colors, fonts, radius, spacing } from '../../theme/tokens';

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();
  const next = language === 'en' ? 'ta' : 'en';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Toggle language"
      onPress={() => setLanguage(next)}
      style={styles.btn}
    >
      <Text style={styles.text}>{language === 'en' ? 'தமிழ்' : 'EN'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 44,
    minWidth: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  text: { color: colors.primary, fontFamily: fonts.bodySemibold, fontSize: 13 },
});
