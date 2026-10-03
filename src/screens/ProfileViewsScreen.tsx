import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { listMyVisits, listWhoViewedMe } from '../lib/api/profile-views';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useOptimisticActions } from '../lib/hooks/useOptimisticActions';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { getPhotoViewAccess } from '../lib/subscription-utils';
import type { ProfileViewResponse } from '../types/api';
import type { AppScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageEmpty, PageError, PageLoading } from '../components/layout/PageState';
import { ProfileCard } from '../components/profile/ProfileCard';
import { Button } from '../components/ui/Button';
import { spacing } from '../theme/tokens';

export default function ProfileViewsScreen({ navigation }: AppScreenProps<'ProfileViews'>) {
  const { t } = useTranslation();
  const { subscription } = useAppSession();
  const [tab, setTab] = useState<'received' | 'visited'>('received');
  const [received, setReceived] = useState<ProfileViewResponse[]>([]);
  const [visited, setVisited] = useState<ProfileViewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const actions = useOptimisticActions();
  const photosRestricted = !getPhotoViewAccess(subscription ?? undefined).allowed;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, v] = await Promise.all([listWhoViewedMe(), listMyVisits()]);
      setReceived(r);
      setVisited(v);
      void actions.hydrateLocksForProfiles([...r, ...v].map((x) => x.otherProfile.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile views');
    } finally {
      setLoading(false);
    }
  }, [actions]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={load} />;

  const data = tab === 'received' ? received : visited;

  return (
    <Screen>
      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      <PageHeader title={t('profileViews')} description={t('profileViewsDesc')} />
      <Button
        title={tab === 'received' ? t('whoViewedMe') : t('profilesIVisited')}
        variant="outline"
        size="sm"
        onPress={() => setTab(tab === 'received' ? 'visited' : 'received')}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <PageEmpty message={tab === 'received' ? t('noProfileViewsReceived') : t('noProfileViewsVisited')} />
        }
        renderItem={({ item }) => (
          <ProfileCard
            profile={item.otherProfile}
            photosRestricted={photosRestricted}
            interestSent={actions.sentInterest.has(item.otherProfile.id)}
            interestAccepted={actions.acceptedInterest.has(item.otherProfile.id)}
            interestPending={actions.pendingInterest.has(item.otherProfile.id)}
            interestReceived={actions.receivedInterest.has(item.otherProfile.id)}
            isShortlisted={actions.shortlisted.has(item.otherProfile.id)}
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
  list: { gap: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xl },
});
