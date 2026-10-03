import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { resetPasswordWithOtp, sendForgotPasswordOtp } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const requestOtp = async () => {
    setBusy(true);
    setError(null);
    try {
      await sendForgotPasswordOtp(email.trim());
      // Backend always responds OK here to avoid email enumeration — treat as success either way.
      setMessage('If that email is registered, an OTP has been sent.');
      setStep('reset');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async () => {
    setBusy(true);
    setError(null);
    try {
      await resetPasswordWithOtp(email.trim(), otp.trim(), newPassword);
      setMessage('Password reset. Please log in with your new password.');
      navigation.navigate('Login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reset failed. Check the OTP and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={step === 'request'}
      />

      {step === 'reset' ? (
        <>
          <Text style={styles.label}>OTP</Text>
          <TextInput style={styles.input} keyboardType="number-pad" value={otp} onChangeText={setOtp} />
          <Text style={styles.label}>New password</Text>
          <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        </>
      ) : null}

      {message ? <Text style={styles.message}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={step === 'request' ? requestOtp : submitReset}
        disabled={busy || !email.trim()}
      >
        {busy ? <ActivityIndicator color={colors.primaryForeground} /> : (
          <Text style={styles.submitButtonText}>{step === 'request' ? 'Send OTP' : 'Reset Password'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Back to login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', padding: spacing.lg, justifyContent: 'center', backgroundColor: colors.background },
  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.primary, marginBottom: spacing.lg, textAlign: 'center' },
  label: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.input, borderRadius: radius.md, padding: 12, fontSize: 16, marginBottom: 12, backgroundColor: colors.card, color: colors.foreground, minHeight: 44 },
  message: { color: colors.primary, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  error: { color: colors.destructive, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  submitButton: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 14, alignItems: 'center', marginTop: 4, minHeight: 44 },
  submitButtonText: { color: colors.primaryForeground, fontFamily: fonts.bodySemibold, fontSize: 16 },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.md, fontFamily: fonts.bodyMedium },
});
