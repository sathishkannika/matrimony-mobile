import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CaptchaField, type CaptchaHandle } from '../../components/auth/CaptchaField';
import { login } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { useAuth } from '../../lib/auth/AuthContext';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme/tokens';

const schema = z.object({
  usernameOrEmail: z.string().min(1, 'Enter your username, email, or mobile number'),
  password: z.string().min(1, 'Enter your password'),
});
type FormValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { onSignedIn } = useAuth();
  const captchaRef = useRef<CaptchaHandle>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { usernameOrEmail: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    const captcha = captchaRef.current?.validate();
    if (typeof captcha === 'string') {
      setSubmitError(captcha);
      return;
    }
    if (!captcha) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const user = await login({ ...values, ...captcha });
      onSignedIn(user);
    } catch (err) {
      captchaRef.current?.refresh();
      setSubmitError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>

      <Text style={styles.label}>Username, email, or mobile</Text>
      <Controller
        control={control}
        name="usernameOrEmail"
        render={({ field }) => (
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoComplete="username"
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      {errors.usernameOrEmail ? <Text style={styles.fieldError}>{errors.usernameOrEmail.message}</Text> : null}

      <Text style={styles.label}>Password</Text>
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextInput
            style={styles.input}
            secureTextEntry
            autoComplete="password"
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      {errors.password ? <Text style={styles.fieldError}>{errors.password.message}</Text> : null}

      <CaptchaField ref={captchaRef} />

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit(onSubmit)()} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={styles.submitButtonText}>Log In</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>New here? Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', padding: spacing.lg, justifyContent: 'center', backgroundColor: colors.background },
  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.primary, marginBottom: spacing.lg, textAlign: 'center' },
  label: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.input, borderRadius: radius.md, padding: 12, fontSize: 16, marginBottom: 4, backgroundColor: colors.card, color: colors.foreground, minHeight: 44 },
  fieldError: { color: colors.destructive, fontSize: 12, marginBottom: 8 },
  submitError: { color: colors.destructive, fontSize: 13, marginTop: 12, textAlign: 'center' },
  submitButton: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 14, alignItems: 'center', marginTop: spacing.md, minHeight: 44 },
  submitButtonText: { color: colors.primaryForeground, fontFamily: fonts.bodySemibold, fontSize: 16 },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.md, fontFamily: fonts.bodyMedium },
});
