import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { listNotifications, markNotificationRead } from '../lib/api/notifications';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useTranslation } from '../lib/i18n/LanguageContext';
import type { NotificationResponse } from '../types/api';
import type { TabScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageEmpty, PageError, PageLoading } from '../components/layout/PageState';
import { Card } from '../components/ui/Card';
import { colors, spacing, type as typeScale } from '../theme/tokens';

export default function NotificationsScreen(_props: TabScreenProps<'Notifications'>) {
  const { t } = useTranslation();
  const { reloadCounts } = useAppSession();
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listNotifications());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
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
      <PageHeader title={t('notifications')} description={t('notificationsDesc')} />
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<PageEmpty message="No notifications yet" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={async () => {
              if (!item.isRead) {
                await markNotificationRead(item.id);
                setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
                void reloadCounts();
              }
            }}
          >
            <Card style={[styles.card, item.isRead ? null : styles.unread]}>
              <Text style={typeScale.h3}>{item.title}</Text>
              <Text style={typeScale.body}>{item.message}</Text>
              <Text style={typeScale.caption}>{new Date(item.createdAt).toLocaleString()}</Text>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  card: { padding: spacing.md, gap: 6 },
  unread: { borderColor: colors.primary },
});
