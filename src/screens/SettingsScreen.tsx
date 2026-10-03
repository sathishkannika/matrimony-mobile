import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { changePassword } from '../lib/api/auth';
import { activateProfile, deactivateProfile } from '../lib/api/profiles';
import { ApiError } from '../lib/api/client';
import { useAuth } from '../lib/auth/AuthContext';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { useToast } from '../components/ui/toast';
import type { TabScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { LanguageToggle } from '../components/layout/LanguageToggle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { spacing, type as typeScale } from '../theme/tokens';

export default function SettingsScreen({ navigation }: TabScreenProps<'Settings'>) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const { myProfile, reload } = useAppSession();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const profileActive = myProfile?.isActive !== false;

  const links: { title: string; onPress: () => void }[] = [
    { title: t('myProfile'), onPress: () => myProfile && navigation.navigate('ProfileDetail', { profileId: myProfile.id }) },
    { title: t('editProfile'), onPress: () => navigation.navigate('EditProfile') },
    { title: t('photos') ?? 'Photos', onPress: () => navigation.navigate('Photos') },
    { title: t('preferences'), onPress: () => navigation.navigate('Preferences') },
    { title: t('plans'), onPress: () => navigation.navigate('Membership') },
    { title: t('shortlists'), onPress: () => navigation.navigate('Shortlists') },
    { title: t('profileViews'), onPress: () => navigation.navigate('ProfileViews') },
    { title: t('blocks'), onPress: () => navigation.navigate('Blocks') },
    { title: t('verifyAccountTitle') ?? 'Verify', onPress: () => navigation.navigate('Verify') },
  ];

  return (
    <Screen scroll>
      <View style={styles.head}>
        <PageHeader title={t('settings')} description={user?.username} />
        <LanguageToggle />
      </View>
      {links.map((link) => (
        <Button key={link.title} title={link.title} variant="outline" onPress={link.onPress} style={styles.link} />
      ))}
      <Text style={[typeScale.h3, styles.section]}>Password</Text>
      <Input label="Current password" value={oldPassword} onChangeText={setOldPassword} secureTextEntry />
      <Input label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <Button
        title="Change password"
        loading={saving}
        onPress={async () => {
          setSaving(true);
          try {
            await changePassword(oldPassword, newPassword);
            toast('Password changed', 'success');
            setOldPassword('');
            setNewPassword('');
          } catch (err) {
            toast(err instanceof ApiError ? err.message : 'Could not change password', 'error');
          } finally {
            setSaving(false);
          }
        }}
      />
      <Button
        title={profileActive ? t('profileDeactivated') ?? 'Hide profile' : t('profileReactivated') ?? 'Show profile'}
        variant="outline"
        style={styles.link}
        onPress={async () => {
          try {
            if (profileActive) await deactivateProfile();
            else await activateProfile();
            await reload();
          } catch (err) {
            toast(err instanceof ApiError ? err.message : 'Request failed', 'error');
          }
        }}
      />
      <Button
        title={t('signOut')}
        variant="destructive"
        style={styles.link}
        onPress={() =>
          Alert.alert(t('signOut'), undefined, [
            { text: 'Cancel', style: 'cancel' },
            { text: t('signOut'), style: 'destructive', onPress: () => void logout() },
          ])
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  link: { marginBottom: spacing.sm },
  section: { marginTop: spacing.lg, marginBottom: spacing.sm },
});
