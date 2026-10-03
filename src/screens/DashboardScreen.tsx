import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { isCompromisedDevice } from '../lib/security/deviceIntegrity';
import { searchProfiles } from '../lib/api/profiles';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useOptimisticActions } from '../lib/hooks/useOptimisticActions';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { filterProfilesForViewer, getOppositeGender } from '../lib/profile-utils';
import { getProfileCompletion } from '../lib/profile-completion';
import { getPhotoViewAccess } from '../lib/subscription-utils';
import type { ProfileResponse } from '../types/api';
import type { TabScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageError, PageLoading } from '../components/layout/PageState';
import { ProfileCard } from '../components/profile/ProfileCard';
import { Card } from '../components/ui/Card';
import { colors, fonts, spacing, type as typeScale } from '../theme/tokens';

const DASHBOARD_PREVIEW_SIZE = 8;

export default function DashboardScreen({ navigation }: TabScreenProps<'Dashboard'>) {
  const { t } = useTranslation();
  const { myProfile, subscription, counts, loading, error, reload, reloadCounts } = useAppSession();
  const [newProfiles, setNewProfiles] = useState<ProfileResponse[]>([]);
  const [compromised, setCompromised] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const actions = useOptimisticActions();
  const photosRestricted = !getPhotoViewAccess(subscription ?? undefined).allowed;

  useEffect(() => {
    setCompromised(isCompromisedDevice());
  }, []);

  useEffect(() => {
    if (!myProfile) return;
    void reloadCounts();
  }, [myProfile, reloadCounts]);

  const loadProfiles = useCallback(async () => {
    if (!myProfile) return;
    setProfilesLoading(true);
    setProfilesError(null);
    try {
      const opposite = getOppositeGender(myProfile.gender);
      const newest = await searchProfiles({ gender: opposite, page: 0, size: DASHBOARD_PREVIEW_SIZE, sortBy: 'NEWEST' });
      const fresh = filterProfilesForViewer(newest.content, myProfile.gender, myProfile.id);
      setNewProfiles(fresh);
      void actions.hydrateLocksForProfiles(fresh.map((p) => p.id));
    } catch (err) {
      setProfilesError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setProfilesLoading(false);
    }
  }, [myProfile, actions]);

  useEffect(() => {
    if (loading || !myProfile) return;
    void loadProfiles();
  }, [loading, myProfile, loadProfiles]);

  const completion = useMemo(() => (myProfile ? getProfileCompletion(myProfile) : null), [myProfile]);

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={reload} />;

  return (
    <Screen>
      {compromised ? (
        <View style={styles.warn}>
          <Text style={styles.warnText}>
            This device appears to be rooted/jailbroken. Some features may be restricted for your account's security.
          </Text>
        </View>
      ) : null}
      <PageHeader title={t('dashboard')} description={t('dashboardDesc')} />
      {completion ? (
        <Text style={typeScale.caption}>
          Profile {completion.percent}% complete ({completion.filled}/{completion.total})
        </Text>
      ) : null}
      {myProfile && (!myProfile.email?.trim() || !myProfile.mobile?.trim()) ? (
        <Text style={typeScale.caption}>Add your email and mobile on your profile before you can pay.</Text>
      ) : null}
      <View style={styles.stats}>
        <Stat label={t('interests')} value={counts?.received ?? 0} />
        <Stat label={t('matches')} value={counts?.matches ?? 0} />
        <Stat label={t('notifications')} value={counts?.unreadNotifications ?? 0} />
      </View>
      {profilesLoading ? <PageLoading /> : null}
      {profilesError ? <PageError message={profilesError} onRetry={loadProfiles} /> : null}
      <FlatList
        data={newProfiles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProfileCard
            profile={item}
            photosRestricted={photosRestricted}
            compact
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card style={styles.stat} premium={false}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={typeScale.micro}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  warn: { backgroundColor: colors.warningBg, borderRadius: 8, padding: 12, marginBottom: spacing.md },
  warnText: { color: colors.warningText, fontFamily: fonts.body, fontSize: 13, textAlign: 'center' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.md },
  stat: { flexGrow: 1, flexBasis: '30%', minWidth: 96, padding: spacing.sm, alignItems: 'center' },
  statValue: { fontFamily: fonts.heading, fontSize: 22, color: colors.primary },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
});
