import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { listShortlists } from '../lib/api/shortlists';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useOptimisticActions } from '../lib/hooks/useOptimisticActions';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { getPhotoViewAccess } from '../lib/subscription-utils';
import type { ShortlistResponse } from '../types/api';
import type { AppScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageEmpty, PageError, PageLoading } from '../components/layout/PageState';
import { ProfileCard } from '../components/profile/ProfileCard';
import { Button } from '../components/ui/Button';
import { spacing } from '../theme/tokens';

export default function ShortlistsScreen({ navigation }: AppScreenProps<'Shortlists'>) {
  const { t } = useTranslation();
  const { subscription } = useAppSession();
  const [items, setItems] = useState<ShortlistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const actions = useOptimisticActions();
  const photosRestricted = !getPhotoViewAccess(subscription ?? undefined).allowed;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listShortlists();
      setItems(list);
      void actions.hydrateLocksForProfiles(list.map((s) => s.shortlistedProfile.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shortlists');
    } finally {
      setLoading(false);
    }
  }, [actions]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={load} />;

  return (
    <Screen>
      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      <PageHeader title={t('shortlists')} description={t('shortlistsDesc')} />
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<PageEmpty message="No shortlisted profiles" />}
        renderItem={({ item }) => (
          <ProfileCard
            profile={item.shortlistedProfile}
            photosRestricted={photosRestricted}
            isShortlisted
            interestSent={actions.sentInterest.has(item.shortlistedProfile.id)}
            interestAccepted={actions.acceptedInterest.has(item.shortlistedProfile.id)}
            interestPending={actions.pendingInterest.has(item.shortlistedProfile.id)}
            interestReceived={actions.receivedInterest.has(item.shortlistedProfile.id)}
            shortlistPending={actions.pendingShortlist.has(item.shortlistedProfile.id)}
            onSendInterest={actions.handleSendInterest}
            onShortlist={actions.handleShortlist}
            onView={(id) => navigation.navigate('ProfileDetail', { profileId: id })}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md, paddingBottom: spacing.xl },
});
