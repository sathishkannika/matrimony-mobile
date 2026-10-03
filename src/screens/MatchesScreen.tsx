import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { getMatchesSummary } from '../lib/api/matches';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useOptimisticActions } from '../lib/hooks/useOptimisticActions';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { filterProfilesForViewer } from '../lib/profile-utils';
import { getPhotoViewAccess } from '../lib/subscription-utils';
import type { MatchResponse, ProfileResponse } from '../types/api';
import type { TabScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageEmpty, PageError, PageLoading } from '../components/layout/PageState';
import { ProfileCard } from '../components/profile/ProfileCard';
import { Button } from '../components/ui/Button';
import { spacing } from '../theme/tokens';

export default function MatchesScreen({ navigation }: TabScreenProps<'Matches'>) {
  const { t } = useTranslation();
  const { myProfile, subscription, loading: sessionLoading, error, reload } = useAppSession();
  const [prefMatches, setPrefMatches] = useState<ProfileResponse[]>([]);
  const [mutual, setMutual] = useState<MatchResponse[]>([]);
  const [tab, setTab] = useState<'pref' | 'mutual'>('pref');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const actions = useOptimisticActions();
  const photosRestricted = !getPhotoViewAccess(subscription ?? undefined).allowed;

  const load = useCallback(async () => {
    if (!myProfile) return;
    setLoading(true);
    setLoadError(null);
    try {
      const summary = await getMatchesSummary(0, 24);
      const pref = filterProfilesForViewer(summary.preferenceMatches.content, myProfile.gender, myProfile.id);
      setPrefMatches(pref);
      setMutual(summary.mutualMatches.filter((m) => m.otherProfile.gender !== myProfile.gender));
      void actions.hydrateLocksForProfiles([...pref.map((p) => p.id), ...summary.mutualMatches.map((m) => m.otherProfile.id)]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [myProfile, actions]);

  useEffect(() => {
    if (sessionLoading || !myProfile) return;
    void load();
  }, [sessionLoading, myProfile, load]);

  if (sessionLoading || loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={reload} />;
  if (loadError) return <PageError message={loadError} onRetry={load} />;

  const profiles = tab === 'pref' ? prefMatches : mutual.map((m) => m.otherProfile);

  return (
    <Screen>
      <PageHeader title={t('matches')} description={t('matchesDesc')} />
      <Button
        title={tab === 'pref' ? t('preferenceMatches') : t('mutualMatches')}
        variant="outline"
        size="sm"
        onPress={() => setTab(tab === 'pref' ? 'mutual' : 'pref')}
      />
      <FlatList
        data={profiles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<PageEmpty message={tab === 'pref' ? t('noPreferenceMatches') : t('noMutualMatches')} />}
        renderItem={({ item }) => (
          <ProfileCard
            profile={item}
            photosRestricted={photosRestricted}
            interestSent={actions.sentInterest.has(item.id)}
            interestAccepted={actions.acceptedInterest.has(item.id)}
            interestPending={actions.pendingInterest.has(item.id)}
            interestReceived={actions.receivedInterest.has(item.id)}
            isShortlisted={actions.shortlisted.has(item.id)}
            shortlistPending={actions.pendingShortlist.has(item.id)}
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
  list: { gap: spacing.md, paddingBottom: spacing.xl, paddingTop: spacing.md },
});
