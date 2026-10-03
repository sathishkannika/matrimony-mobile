import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type as typeScale, spacing } from '../../theme/tokens';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={typeScale.h1}>{title}</Text>
        {description ? <Text style={typeScale.caption}>{description}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.md, gap: spacing.sm },
  copy: { flex: 1 },
});
