import React, { useEffect, useState } from 'react';
import { getPreference, savePreference, updatePreference } from '../lib/api/preferences';
import { ApiError } from '../lib/api/client';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { useToast } from '../components/ui/toast';
import type { AppScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageLoading } from '../components/layout/PageState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function PreferencesScreen({ navigation }: AppScreenProps<'Preferences'>) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [existingId, setExistingId] = useState<number | null>(null);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [religion, setReligion] = useState('');
  const [caste, setCaste] = useState('');
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');
  const [additional, setAdditional] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getPreference()
      .then((pref) => {
        if (!pref) return;
        setExistingId(pref.id);
        setMinAge(pref.minAge != null ? String(pref.minAge) : '');
        setMaxAge(pref.maxAge != null ? String(pref.maxAge) : '');
        setReligion(pref.religion ?? '');
        setCaste(pref.caste ?? '');
        setEducation(pref.education ?? '');
        setProfession(pref.profession ?? '');
        setAdditional(pref.additionalExpectation ?? '');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;

  const body = {
    minAge: minAge ? Number(minAge) : null,
    maxAge: maxAge ? Number(maxAge) : null,
    religion: religion || null,
    caste: caste || null,
    education: education || null,
    profession: profession || null,
    additionalExpectation: additional || null,
  };

  return (
    <Screen scroll>
      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      <PageHeader title={t('preferences')} />
      <Input label="Min age" value={minAge} onChangeText={setMinAge} keyboardType="number-pad" />
      <Input label="Max age" value={maxAge} onChangeText={setMaxAge} keyboardType="number-pad" />
      <Input label="Religion" value={religion} onChangeText={setReligion} />
      <Input label="Caste" value={caste} onChangeText={setCaste} />
      <Input label="Education" value={education} onChangeText={setEducation} />
      <Input label="Profession" value={profession} onChangeText={setProfession} />
      <Input label="Additional expectation" value={additional} onChangeText={setAdditional} multiline />
      <Button
        title="Save preferences"
        loading={saving}
        onPress={async () => {
          setSaving(true);
          try {
            if (existingId) await updatePreference(body);
            else {
              const saved = await savePreference(body);
              setExistingId(saved.id);
            }
            toast('Preferences saved', 'success');
          } catch (err) {
            toast(err instanceof ApiError ? err.message : 'Save failed', 'error');
          } finally {
            setSaving(false);
          }
        }}
      />
    </Screen>
  );
}
