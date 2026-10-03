import React, { useState } from 'react';
import { Text } from 'react-native';
import { confirmMobileVerify, sendMobileVerifyOtp } from '../lib/api/auth';
import { ApiError } from '../lib/api/client';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { useToast } from '../components/ui/toast';
import type { AppScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { type as typeScale } from '../theme/tokens';

export default function VerifyScreen({ navigation }: AppScreenProps<'Verify'>) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <Screen scroll>
      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      <PageHeader title={t('verifyAccountTitle') ?? 'Verify account'} />
      <Text style={typeScale.caption}>We'll send a one-time code to the mobile on your account.</Text>
      <Button
        title="Send code"
        loading={busy && !sent}
        onPress={async () => {
          setBusy(true);
          try {
            await sendMobileVerifyOtp();
            setSent(true);
            toast('Code sent', 'success');
          } catch (err) {
            toast(err instanceof ApiError ? err.message : 'Could not send code', 'error');
          } finally {
            setBusy(false);
          }
        }}
      />
      {sent ? (
        <>
          <Input label="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
          <Button
            title="Confirm"
            loading={busy}
            onPress={async () => {
              setBusy(true);
              try {
                await confirmMobileVerify(otp);
                toast('Mobile verified', 'success');
                navigation.goBack();
              } catch (err) {
                toast(err instanceof ApiError ? err.message : 'Verification failed', 'error');
              } finally {
                setBusy(false);
              }
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}
