import React, { useState } from 'react';
import { Text } from 'react-native';
import { confirmMobileVerify, sendMobileVerifyOtp } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { useToast } from '../../components/ui/toast';
import type { AuthScreenProps } from '../../navigation/types';
import { Screen } from '../../components/layout/Screen';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { type as typeScale } from '../../theme/tokens';

/** Auth-stack OTP screen — same mobile-verify APIs as VerifyScreen once a session exists. */
export default function VerifyOtpScreen({ navigation }: AuthScreenProps<'VerifyOtp'>) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <Screen scroll>
      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      <PageHeader title={t('verifyAccountTitle') ?? 'Verify'} />
      <Text style={typeScale.caption}>Enter the code sent to your mobile.</Text>
      <Button
        title="Send code"
        onPress={async () => {
          try {
            await sendMobileVerifyOtp();
            toast('Code sent', 'success');
          } catch (err) {
            toast(err instanceof ApiError ? err.message : 'Could not send code', 'error');
          }
        }}
      />
      <Input label="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
      <Button
        title="Confirm"
        loading={busy}
        onPress={async () => {
          setBusy(true);
          try {
            await confirmMobileVerify(otp);
            toast('Verified', 'success');
            navigation.navigate('Login');
          } catch (err) {
            toast(err instanceof ApiError ? err.message : 'Verification failed', 'error');
          } finally {
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}
