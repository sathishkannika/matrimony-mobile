import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { getPreference } from '../lib/api/preferences';
import { searchProfiles } from '../lib/api/profiles';
import { ApiError } from '../lib/api/client';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useOptimisticActions } from '../lib/hooks/useOptimisticActions';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { filterProfilesForViewer, getOppositeGender } from '../lib/profile-utils';
import { SEARCH_PAGE_SIZE } from '../lib/search-pagination';
import { searchFiltersFromPreference } from '../lib/preference-search';
import { getPhotoViewAccess } from '../lib/subscription-utils';
import type { ProfileResponse, ProfileSearchFilters } from '../types/api';
import type { TabScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageEmpty, PageError, PageLoading } from '../components/layout/PageState';
import { ProfileCard } from '../components/profile/ProfileCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { colors, fonts, spacing } from '../theme/tokens';

export default function SearchScreen({ navigation }: TabScreenProps<'Search'>) {
  const { t } = useTranslation();
  const { myProfile, subscription, loading, error, reload } = useAppSession();
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [city, setCity] = useState('');
  const [usePrefs, setUsePrefs] = useState(false);
  const [results, setResults] = useState<ProfileResponse[]>([]);
  const [page, setPage] = useState(0);
  const [lastPage, setLastPage] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const actions = useOptimisticActions();
  const photosRestricted = !getPhotoViewAccess(subscription ?? undefined).allowed;

  const runSearch = useCallback(
    async (pageNo: number, append: boolean, extra?: ProfileSearchFilters) => {
      if (!myProfile) return;
      setSearching(true);
      setSearchError(null);
      try {
        const opposite = getOppositeGender(myProfile.gender);
        const result = await searchProfiles({
          gender: opposite,
          sortBy: 'NEWEST',
          page: pageNo,
          size: SEARCH_PAGE_SIZE,
          minAge: minAge ? Number(minAge) : undefined,
          maxAge: maxAge ? Number(maxAge) : undefined,
          city: city || undefined,
          ...extra,
        });
        const filtered = filterProfilesForViewer(result.content ?? [], myProfile.gender, myProfile.id);
        setResults((prev) => (append ? [...prev, ...filtered] : filtered));
        setPage(result.page);
        setLastPage(result.last || result.page + 1 >= result.totalPages);
        void actions.hydrateLocksForProfiles(filtered.map((p) => p.id));
      } catch (err) {
        setSearchError(err instanceof ApiError ? err.message : 'Search failed');
      } finally {
        setSearching(false);
      }
    },
    [myProfile, minAge, maxAge, city, actions],
  );

  useEffect(() => {
    if (loading || !myProfile) return;
    void runSearch(0, false);
  }, [loading, myProfile, runSearch]);

  const togglePrefs = async (on: boolean) => {
    setUsePrefs(on);
    if (!on || !myProfile) {
      void runSearch(0, false);
      return;
    }
    const pref = await getPreference();
    if (pref) void runSearch(0, false, searchFiltersFromPreference(pref, myProfile.gender));
  };

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={reload} />;

  return (
    <Screen>
      <PageHeader title={t('search')} />
      <View style={styles.row}>
        <View style={styles.flex}>
          <Input label="Min age" value={minAge} onChangeText={setMinAge} keyboardType="number-pad" />
        </View>
        <View style={styles.flex}>
          <Input label="Max age" value={maxAge} onChangeText={setMaxAge} keyboardType="number-pad" />
        </View>
      </View>
      <Input label="City" value={city} onChangeText={setCity} />
      <View style={styles.prefRow}>
        <Text style={styles.prefLabel}>Use my preferences</Text>
        <Switch
          value={usePrefs}
          onValueChange={togglePrefs}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor={colors.card}
        />
      </View>
      <Button title={t('search')} onPress={() => void runSearch(0, false)} loading={searching} />
      {searchError ? <PageError message={searchError} onRetry={() => void runSearch(0, false)} /> : null}
      <FlatList
        style={styles.list}
        data={results}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listPad}
        ListEmptyComponent={!searching ? <PageEmpty message="No profiles match these filters" /> : undefined}
        onEndReached={() => {
          if (!lastPage && !searching) void runSearch(page + 1, true);
        }}
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
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  prefLabel: { flex: 1, fontFamily: fonts.bodyMedium, color: colors.foreground, marginRight: spacing.sm },
  list: { flex: 1, marginTop: spacing.md },
  listPad: { gap: spacing.md, paddingBottom: spacing.xl },
});
