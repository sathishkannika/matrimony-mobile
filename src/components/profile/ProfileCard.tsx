import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Briefcase, Check, GraduationCap, Heart, Lock, MapPin, ShieldCheck, Star, UserPlus } from 'lucide-react-native';
import type { ProfileResponse } from '../../types/api';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { colors, fonts, radius, spacing, type as typeScale } from '../../theme/tokens';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ProfileCardProps {
  profile: ProfileResponse;
  photosRestricted?: boolean;
  onSendInterest?: (profileId: number) => void;
  onShortlist?: (profileId: number) => void;
  onView?: (profileId: number) => void;
  interestSent?: boolean;
  interestAccepted?: boolean;
  interestPending?: boolean;
  interestReceived?: boolean;
  isShortlisted?: boolean;
  shortlistPending?: boolean;
  compact?: boolean;
}

export function ProfileCard({
  profile,
  photosRestricted = false,
  onSendInterest,
  onShortlist,
  onView,
  interestSent = false,
  interestAccepted = false,
  interestPending = false,
  interestReceived = false,
  isShortlisted = false,
  shortlistPending = false,
  compact = false,
}: ProfileCardProps) {
  const { t } = useTranslation();
  const location = [profile.city || profile.address?.city, profile.state || profile.address?.state, profile.address?.country]
    .filter(Boolean)
    .join(', ');
  // Privacy: never load full-res (or any) photo URL when restricted.
  const photoSrc = photosRestricted ? undefined : profile.primaryPhotoThumbnailUrl || profile.primaryPhotoUrl;

  const interestLabel = interestAccepted
    ? t('interestAccepted')
    : interestSent
      ? t('interestSent')
      : t('sendInterest');

  return (
    <Pressable accessibilityRole="button" onPress={() => onView?.(profile.id)}>
      <Card>
        <View style={[styles.header, compact ? styles.headerCompact : null]}>
          {profile.isVerified ? (
            <View style={[styles.pill, styles.verified]}>
              <ShieldCheck size={12} color={colors.accentForeground} />
              <Text style={styles.pillGold}>Verified</Text>
            </View>
          ) : null}
          {isShortlisted ? (
            <View style={[styles.pill, styles.shortlisted]}>
              <Star size={12} color={colors.accent} fill={colors.accent} />
              <Text style={styles.pillAccent}>{t('shortlisted')}</Text>
            </View>
          ) : null}
          <Avatar uri={photoSrc} size={compact ? 96 : 128} restricted={photosRestricted} />
          {photosRestricted ? (
            <View style={styles.lock}>
              <Lock size={12} color={colors.accentForeground} />
              <Text style={styles.lockText}>{t('photoLocked')}</Text>
            </View>
          ) : null}
          <Text style={styles.name}>{profile.displayName}</Text>
          {profile.profileCode ? (
            <Text style={styles.code}>
              {t('profileIdLabel')}: {profile.profileCode}
            </Text>
          ) : null}
          <Text style={typeScale.caption}>
            {profile.age} yrs · {profile.gender === 'MALE' ? t('groom') : t('bride')}
          </Text>
        </View>

        <View style={styles.body}>
          {profile.subCasteName ? <Badge label={profile.subCasteName} /> : null}
          {location ? (
            <View style={styles.row}>
              <MapPin size={14} color={colors.accent} />
              <Text style={styles.meta}>{location}</Text>
            </View>
          ) : null}
          {profile.profession ? (
            <View style={styles.row}>
              <Briefcase size={14} color={colors.accent} />
              <Text style={styles.meta}>{profile.profession}</Text>
            </View>
          ) : null}
          {(profile.highestDegree || profile.course) && !compact ? (
            <View style={styles.row}>
              <GraduationCap size={14} color={colors.accent} />
              <Text style={styles.meta}>{[profile.highestDegree, profile.course].filter(Boolean).join(' · ')}</Text>
            </View>
          ) : null}
          {profile.aboutMe && !compact ? (
            <Text style={styles.about} numberOfLines={2}>
              {profile.aboutMe}
            </Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          {onSendInterest && interestReceived && !interestAccepted ? (
            <Button title={t('respondToInterest')} variant="outline" size="sm" style={styles.flex} onPress={() => onView?.(profile.id)} />
          ) : onSendInterest ? (
            <Button
              title={interestLabel}
              size="sm"
              style={styles.flex}
              disabled={interestPending || interestSent || interestAccepted}
              left={
                interestSent || interestAccepted ? (
                  <Check size={14} color={colors.primaryForeground} />
                ) : (
                  <Heart size={14} color={colors.primaryForeground} />
                )
              }
              onPress={() => onSendInterest(profile.id)}
            />
          ) : null}
          {onShortlist ? (
            <Button
              title=""
              variant="outline"
              size="sm"
              accessibilityLabel={isShortlisted ? t('shortlisted') : t('shortlist')}
              disabled={shortlistPending}
              left={<Star size={14} color={isShortlisted ? colors.accent : colors.primary} fill={isShortlisted ? colors.accent : 'none'} />}
              onPress={() => onShortlist(profile.id)}
              style={styles.iconBtn}
            />
          ) : null}
          {onView ? (
            <Button
              title=""
              variant="ghost"
              size="sm"
              accessibilityLabel={t('viewProfile')}
              left={<UserPlus size={14} color={colors.primary} />}
              onPress={() => onView(profile.id)}
              style={styles.iconBtn}
            />
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.secondary,
  },
  headerCompact: { paddingBottom: 4 },
  name: { ...typeScale.h3, marginTop: spacing.sm, textAlign: 'center' },
  code: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.primary, marginTop: 2 },
  body: { padding: spacing.md, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta: { ...typeScale.caption, flex: 1 },
  about: { ...typeScale.body, color: colors.foreground },
  footer: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    borderTopColor: colors.border,
    backgroundColor: colors.muted,
    padding: 12,
  },
  flex: { flex: 1 },
  iconBtn: { paddingHorizontal: 10, minWidth: 44 },
  pill: {
    position: 'absolute',
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 1,
  },
  verified: { left: 12, backgroundColor: colors.accent },
  shortlisted: { right: 12, backgroundColor: colors.card },
  pillGold: { color: colors.accentForeground, fontFamily: fonts.bodyBold, fontSize: 10 },
  pillAccent: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 10 },
  lock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: colors.maroonDeep,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lockText: { color: colors.accentForeground, fontFamily: fonts.bodySemibold, fontSize: 10 },
});
