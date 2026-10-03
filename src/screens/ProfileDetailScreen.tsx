import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getProfile, getProfileRelation } from '../lib/api/profiles';
import { blockProfile } from '../lib/api/blocks';
import { reportProfile } from '../lib/api/reports';
import { listPhotosForProfile } from '../lib/api/photos';
import { ApiError } from '../lib/api/client';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useOptimisticActions } from '../lib/hooks/useOptimisticActions';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { getContactViewAccess, getPhotoViewAccess } from '../lib/subscription-utils';
import type { PhotoResponse, ProfileResponse, ProfileViewerRelationResponse } from '../types/api';
import type { AppScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageError, PageLoading } from '../components/layout/PageState';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { spacing, type as typeScale } from '../theme/tokens';

export default function ProfileDetailScreen({ navigation, route }: AppScreenProps<'ProfileDetail'>) {
  const { profileId } = route.params;
  const { t } = useTranslation();
  const { myProfile, subscription } = useAppSession();
  const isOwn = myProfile?.id === profileId;
  const photosRestricted = !isOwn && !getPhotoViewAccess(subscription ?? undefined).allowed;
  const contact = getContactViewAccess(subscription);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [relation, setRelation] = useState<ProfileViewerRelationResponse | null>(null);
  const [, setPhotos] = useState<PhotoResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const actions = useOptimisticActions();

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, rel] = await Promise.all([
        getProfile(profileId, { trackView: !isOwn }),
        isOwn ? Promise.resolve(null) : getProfileRelation(profileId),
      ]);
      setProfile(p);
      setRelation(rel);
      if (!photosRestricted) {
        setPhotos(await listPhotosForProfile(profileId));
      } else {
        setPhotos([]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load profile');
    }
  }, [profileId, isOwn, photosRestricted]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <PageError message={error} onRetry={load} />;
  if (!profile) return <PageLoading />;

  const location = [profile.city, profile.state, profile.address?.country].filter(Boolean).join(', ');

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.pad}>
        <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
        <PageHeader title={profile.displayName} description={profile.profileCode} />
        <Avatar
          uri={photosRestricted ? undefined : profile.primaryPhotoThumbnailUrl || profile.primaryPhotoUrl}
          size={128}
          restricted={photosRestricted}
        />
        {profile.isVerified ? <Badge label="Verified" variant="gold" /> : null}
        <Text style={typeScale.body}>
          {profile.age} yrs · {profile.gender === 'MALE' ? t('groom') : t('bride')}
        </Text>
        {location ? <Text style={typeScale.caption}>{location}</Text> : null}
        {profile.profession ? <Text style={typeScale.body}>{profile.profession}</Text> : null}
        {profile.aboutMe ? <Text style={typeScale.body}>{profile.aboutMe}</Text> : null}
        {isOwn || contact.canViewMobile ? (
          <Text style={typeScale.caption}>{[profile.countryCode, profile.mobile].filter(Boolean).join(' ')}</Text>
        ) : null}
        {isOwn || contact.canViewEmail ? <Text style={typeScale.caption}>{profile.email}</Text> : null}
        {photosRestricted ? <Text style={typeScale.caption}>{t('photoLocked')}</Text> : null}
        {!isOwn ? (
          <View style={styles.actions}>
            <Button
              title={t('sendInterest')}
              onPress={() => void actions.handleSendInterest(profile.id)}
              disabled={relation?.interestStatus != null}
            />
            <Button title={t('shortlist')} variant="outline" onPress={() => void actions.handleShortlist(profile.id)} />
            <Button
              title={t('blockProfile')}
              variant="outline"
              onPress={() =>
                Alert.alert(t('blockProfile'), undefined, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: t('blockProfile'),
                    style: 'destructive',
                    onPress: async () => {
                      await blockProfile(profile.id);
                      navigation.goBack();
                    },
                  },
                ])
              }
            />
            <Button
              title={t('reportProfile')}
              variant="ghost"
              onPress={() =>
                Alert.alert(t('reportProfileTitle'), t('reportProfileDesc', { name: profile.displayName }), [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: t('reportReason_SCAM'),
                    onPress: () => void reportProfile(profile.id, { reason: 'SCAM' }),
                  },
                ])
              }
            />
          </View>
        ) : (
          <Button title={t('editProfile')} onPress={() => navigation.navigate('EditProfile')} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { gap: spacing.sm, paddingBottom: spacing.xl },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
