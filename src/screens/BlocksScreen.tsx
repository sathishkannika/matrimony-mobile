import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { listBlocks, unblockProfile } from '../lib/api/blocks';
import { ApiError } from '../lib/api/client';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { useToast } from '../components/ui/toast';
import type { BlockResponse } from '../types/api';
import type { AppScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageEmpty, PageError, PageLoading } from '../components/layout/PageState';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { spacing, type as typeScale } from '../theme/tokens';

export default function BlocksScreen({ navigation }: AppScreenProps<'Blocks'>) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [items, setItems] = useState<BlockResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listBlocks());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blocks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={load} />;

  return (
    <Screen>
      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      <PageHeader title={t('blocks')} description={t('blocksDesc')} />
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<PageEmpty message="No blocked profiles" />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={typeScale.h3}>{item.blockedProfile.displayName}</Text>
            <Button
              title={t('unblockProfile')}
              variant="outline"
              size="sm"
              onPress={async () => {
                try {
                  await unblockProfile(item.blockedProfileId);
                  await load();
                } catch (err) {
                  toast(err instanceof ApiError ? err.message : 'Unblock failed', 'error');
                }
              }}
            />
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  card: { padding: spacing.md, gap: 8 },
});
