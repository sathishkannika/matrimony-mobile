import React, { useEffect, useState } from 'react';
import { updateProfile } from '../lib/api/profiles';
import { ApiError } from '../lib/api/client';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { useToast } from '../components/ui/toast';
import type { AppScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageLoading } from '../components/layout/PageState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function EditProfileScreen({ navigation }: AppScreenProps<'EditProfile'>) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { myProfile, loading, reload } = useAppSession();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profession, setProfession] = useState('');
  const [city, setCity] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [partnerExpectation, setPartnerExpectation] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!myProfile) return;
    setFirstName(myProfile.firstName);
    setLastName(myProfile.lastName);
    setProfession(myProfile.profession ?? '');
    setCity(myProfile.city ?? '');
    setAboutMe(myProfile.aboutMe ?? '');
    setPartnerExpectation(myProfile.partnerExpectation ?? '');
    setHobbies(myProfile.hobbies ?? '');
  }, [myProfile]);

  if (loading || !myProfile) return <PageLoading />;

  return (
    <Screen scroll>
      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      <PageHeader title={t('editProfile')} />
      <Input label="First name" value={firstName} onChangeText={setFirstName} />
      <Input label="Last name" value={lastName} onChangeText={setLastName} />
      <Input label="Profession" value={profession} onChangeText={setProfession} />
      <Input label="City" value={city} onChangeText={setCity} />
      <Input label="About me" value={aboutMe} onChangeText={setAboutMe} multiline />
      <Input label="Partner expectation" value={partnerExpectation} onChangeText={setPartnerExpectation} multiline />
      <Input label="Hobbies" value={hobbies} onChangeText={setHobbies} />
      <Button
        title="Save"
        loading={saving}
        onPress={async () => {
          setSaving(true);
          try {
            await updateProfile({ firstName, lastName, profession, city, aboutMe, partnerExpectation, hobbies });
            await reload();
            toast('Profile updated', 'success');
            navigation.goBack();
          } catch (err) {
            toast(err instanceof ApiError ? err.message : 'Update failed', 'error');
          } finally {
            setSaving(false);
          }
        }}
      />
    </Screen>
  );
}
