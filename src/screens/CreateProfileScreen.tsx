import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { createProfile } from '../lib/api/profiles';
import { ApiError } from '../lib/api/client';
import { useAuth } from '../lib/auth/AuthContext';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { useToast } from '../components/ui/toast';
import type { Gender, MaritalStatus } from '../types/api';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { LanguageToggle } from '../components/layout/LanguageToggle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { spacing } from '../theme/tokens';

export default function CreateProfileScreen() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { setProfileId, logout } = useAuth();
  const { reload } = useAppSession();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('NEVER_MARRIED');
  const [city, setCity] = useState('');
  const [profession, setProfession] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [saving, setSaving] = useState(false);

  return (
    <Screen scroll>
      <LanguageToggle />
      <PageHeader title={t('createProfile')} description={t('createProfileDesc')} />
      <Input label="First name" value={firstName} onChangeText={setFirstName} />
      <Input label="Last name" value={lastName} onChangeText={setLastName} />
      <Input label="Date of birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} />
      <Button
        title={`Gender: ${gender}`}
        variant="outline"
        onPress={() => setGender(gender === 'MALE' ? 'FEMALE' : 'MALE')}
        style={styles.gap}
      />
      <Button
        title={`Marital: ${maritalStatus}`}
        variant="outline"
        onPress={() => setMaritalStatus(maritalStatus === 'NEVER_MARRIED' ? 'DIVORCED' : 'NEVER_MARRIED')}
        style={styles.gap}
      />
      <Input label="City" value={city} onChangeText={setCity} />
      <Input label="Profession" value={profession} onChangeText={setProfession} />
      <Input label="About me" value={aboutMe} onChangeText={setAboutMe} multiline />
      <Button
        title={t('createProfile')}
        loading={saving}
        onPress={async () => {
          setSaving(true);
          try {
            const created = await createProfile({
              firstName,
              lastName,
              gender,
              dob,
              maritalStatus,
              city,
              profession,
              aboutMe,
            });
            setProfileId(created.id);
            await reload();
            toast('Profile created', 'success');
          } catch (err) {
            toast(err instanceof ApiError ? err.message : t('createProfileFailed'), 'error');
          } finally {
            setSaving(false);
          }
        }}
      />
      <Button title={t('signOut')} variant="ghost" onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: spacing.md },
});
