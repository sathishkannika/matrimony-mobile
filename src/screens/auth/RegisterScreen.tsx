import React, { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CaptchaField, type CaptchaHandle } from '../../components/auth/CaptchaField';
import { register } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { useAuth } from '../../lib/auth/AuthContext';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme/tokens';

const schema = z.object({
  username: z.string().min(3, 'At least 3 characters'),
  email: z.string().email('Enter a valid email'),
  countryCode: z.string().regex(/^\d{1,3}$/, 'Digits only, e.g. 91'),
  mobile: z.string().regex(/^\d{6,14}$/, 'Digits only'),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { onSignedIn } = useAuth();
  const captchaRef = useRef<CaptchaHandle>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', countryCode: '91', mobile: '', password: '' },
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
      const user = await register({ ...values, ...captcha });
      onSignedIn(user);
    } catch (err) {
      captchaRef.current?.refresh();
      setSubmitError(err instanceof ApiError ? [err.message, ...err.errors].filter(Boolean).join('\n') : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create your account</Text>

      <Field label="Username" name="username" control={control} error={errors.username?.message} autoCapitalize="none" />
      <Field label="Email" name="email" control={control} error={errors.email?.message} autoCapitalize="none" keyboardType="email-address" />
      <View style={styles.mobileRow}>
        <View style={styles.countryCodeField}>
          <Field label="Code" name="countryCode" control={control} error={errors.countryCode?.message} keyboardType="number-pad" />
        </View>
        <View style={styles.mobileField}>
          <Field label="Mobile" name="mobile" control={control} error={errors.mobile?.message} keyboardType="number-pad" />
        </View>
      </View>
      <Field label="Password" name="password" control={control} error={errors.password?.message} secureTextEntry autoCapitalize="none" />

      <CaptchaField ref={captchaRef} />

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit(onSubmit)()} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={styles.submitButtonText}>Create Account</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

interface FieldProps {
  label: string;
  name: keyof FormValues;
  control: ReturnType<typeof useForm<FormValues>>['control'];
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences';
  keyboardType?: 'default' | 'email-address' | 'number-pad';
}

function Field({ label, name, control, error, ...inputProps }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TextInput style={styles.input} value={field.value} onChangeText={field.onChange} {...inputProps} />
        )}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { width: '100%', maxWidth: 480, alignSelf: 'center', padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1 },
  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.primary, marginBottom: spacing.lg, textAlign: 'center' },
  fieldWrap: { marginBottom: 4 },
  label: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.foreground, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.input, borderRadius: radius.md, padding: 12, fontSize: 16, marginBottom: 4, backgroundColor: colors.card, color: colors.foreground, minHeight: 44 },
  fieldError: { color: colors.destructive, fontSize: 12, marginBottom: 8 },
  submitError: { color: colors.destructive, fontSize: 13, marginTop: 12, textAlign: 'center' },
  submitButton: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 14, alignItems: 'center', marginTop: spacing.md, minHeight: 44 },
  submitButtonText: { color: colors.primaryForeground, fontFamily: fonts.bodySemibold, fontSize: 16 },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.md, fontFamily: fonts.bodyMedium },
  mobileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  countryCodeField: { width: 88, minWidth: 72 },
  mobileField: { flex: 1 },
});
