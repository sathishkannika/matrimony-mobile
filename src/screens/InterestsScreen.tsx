import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { getReceivedInterests, getSentInterests } from '../lib/api/interests';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useOptimisticActions } from '../lib/hooks/useOptimisticActions';
import { useTranslation } from '../lib/i18n/LanguageContext';
import type { InterestResponse } from '../types/api';
import type { TabScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageEmpty, PageError, PageLoading } from '../components/layout/PageState';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { spacing, type as typeScale } from '../theme/tokens';

function partitionInterests(receivedRaw: InterestResponse[], sentRaw: InterestResponse[], myProfileId?: number) {
  if (myProfileId == null) return { received: receivedRaw, sent: sentRaw };
  return {
    received: receivedRaw.filter((i) => i.receiverProfileId === myProfileId),
    sent: sentRaw.filter((i) => i.senderProfileId === myProfileId),
  };
}

export default function InterestsScreen({ navigation }: TabScreenProps<'Interests'>) {
  const { t } = useTranslation();
  const { myProfile, loading: sessionLoading, error: sessionError, reload } = useAppSession();
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [receivedRaw, setReceivedRaw] = useState<InterestResponse[]>([]);
  const [sentRaw, setSentRaw] = useState<InterestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([getReceivedInterests(), getSentInterests()]);
      setReceivedRaw(r);
      setSentRaw(s);
    } finally {
      setLoading(false);
    }
  }, []);

  const actions = useOptimisticActions(load);

  useEffect(() => {
    if (sessionLoading) return;
    void load();
  }, [sessionLoading, load]);

  const { received, sent } = useMemo(
    () => partitionInterests(receivedRaw, sentRaw, myProfile?.id),
    [receivedRaw, sentRaw, myProfile?.id],
  );
  const data = tab === 'received' ? received : sent;

  if (sessionLoading || loading) return <PageLoading />;
  if (sessionError) return <PageError message={sessionError} onRetry={reload} />;

  return (
    <Screen>
      <PageHeader title={t('interests')} description={t('interestsDesc')} />
      <View style={styles.tabs}>
        <Button title={`${t('received') ?? 'Received'} (${received.length})`} variant={tab === 'received' ? 'default' : 'outline'} size="sm" style={styles.flex} onPress={() => setTab('received')} />
        <Button title={`${t('sent') ?? 'Sent'} (${sent.length})`} variant={tab === 'sent' ? 'default' : 'outline'} size="sm" style={styles.flex} onPress={() => setTab('sent')} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<PageEmpty message={tab === 'received' ? 'No received interests' : 'No sent interests'} />}
        renderItem={({ item }) => {
          const otherId = tab === 'received' ? item.senderProfileId : item.receiverProfileId;
          const name = tab === 'received' ? item.senderDisplayName : item.receiverDisplayName;
          return (
            <Card style={styles.card}>
              <Text style={typeScale.h3}>{name}</Text>
              <Text style={typeScale.caption}>{item.status}</Text>
              <View style={styles.row}>
                <Button title={t('viewProfile')} size="sm" variant="outline" onPress={() => navigation.navigate('ProfileDetail', { profileId: otherId })} />
                {tab === 'received' && item.status === 'PENDING' ? (
                  <>
                    <Button title="Accept" size="sm" onPress={() => void actions.handleAcceptInterest(item.id, () => undefined, otherId)} />
                    <Button title="Decline" size="sm" variant="outline" onPress={() => void actions.handleRejectInterest(item.id, () => undefined)} />
                  </>
                ) : null}
                {tab === 'sent' && item.status === 'PENDING' ? (
                  <Button title="Cancel" size="sm" variant="ghost" onPress={() => void actions.handleCancelInterest(item.id, () => undefined, otherId)} />
                ) : null}
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  flex: { flex: 1 },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  card: { padding: spacing.md, gap: 8 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
