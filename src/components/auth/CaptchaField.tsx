import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { fetchCaptchaChallenge } from '../../lib/api/auth';

/** Mobile port of matrimony-ui/src/components/auth/CaptchaField.tsx — same imperative validate()/refresh() contract. */

export interface CaptchaPayload {
  captchaId: string;
  captchaAnswer: string;
  notRobot: true;
}

export interface CaptchaHandle {
  /** Client-side presence checks only. Returns payload for the API, or an error string. Real verification is always server-side. */
  validate: () => CaptchaPayload | string;
  refresh: () => void;
}

export const CaptchaField = forwardRef<CaptchaHandle>(function CaptchaField(_props, ref) {
  const [captchaId, setCaptchaId] = useState<string | null>(null);
  const [imageSvg, setImageSvg] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [notRobot, setNotRobot] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const hasImage = Boolean(imageSvg || imageDataUri);

  const refresh = useCallback(() => {
    setAnswer('');
    setNotRobot(false);
    setLoadError(null);
    setLoading(true);
    setCaptchaId(null);
    setImageSvg(null);
    setImageDataUri(null);
    void fetchCaptchaChallenge()
      .then((challenge) => {
        if (!challenge?.captchaId) throw new Error('Invalid captcha response');
        const svg = challenge.imageSvg?.trim() || null;
        const dataUri = challenge.imageDataUri?.trim() || null;
        if (!svg && !dataUri) throw new Error('Invalid captcha response');
        setCaptchaId(challenge.captchaId);
        setImageSvg(svg);
        setImageDataUri(dataUri);
      })
      .catch(() => setLoadError('Could not load captcha. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useImperativeHandle(
    ref,
    () => ({
      refresh,
      validate: () => {
        if (loading) return 'Captcha is still loading. Please wait.';
        if (loadError || !captchaId || !hasImage) {
          refresh();
          return loadError ?? 'Captcha unavailable. Please refresh and try again.';
        }
        if (!notRobot) return 'Please confirm you are not a robot.';
        const captchaAnswer = answer.trim();
        if (!captchaAnswer) return 'Enter the captcha numbers.';
        return { captchaId, captchaAnswer, notRobot: true as const };
      },
    }),
    [answer, captchaId, hasImage, loadError, loading, notRobot, refresh]
  );

  return (
    <View>
      <Text style={styles.label}>Security check</Text>
      <View style={styles.row}>
        <View style={styles.captchaBox}>
          {loading && <Text style={styles.placeholder}>Loading…</Text>}
          {!loading && imageSvg && <SvgXml xml={imageSvg} width="100%" height="50" />}
          {!loading && !imageSvg && imageDataUri && (
            <Image source={{ uri: imageDataUri }} style={styles.image} resizeMode="contain" />
          )}
          {!loading && !hasImage && (
            <Text style={styles.placeholder}>{loadError ? 'Failed to load' : 'No captcha'}</Text>
          )}
        </View>
        <TouchableOpacity onPress={refresh} disabled={loading} style={styles.refreshButton} accessibilityLabel="Refresh captcha">
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}

      <Text style={styles.label}>Enter the numbers shown</Text>
      <TextInput
        value={answer}
        onChangeText={(text) => setAnswer(text.replace(/\D/g, '').slice(0, 8))}
        placeholder="Type the captcha numbers"
        keyboardType="number-pad"
        editable={!loading && Boolean(captchaId)}
        style={styles.input}
      />

      <View style={styles.robotRow}>
        <Switch value={notRobot} onValueChange={setNotRobot} disabled={loading || !captchaId} />
        <Text style={styles.robotLabel}>I am not a robot</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  captchaBox: { flex: 1, height: 56, backgroundColor: '#f0f0f0', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  placeholder: { color: '#888' },
  image: { width: '100%', height: '100%' },
  refreshButton: { marginLeft: 10, padding: 10 },
  refreshText: { color: '#007AFF', fontWeight: '600' },
  error: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16 },
  robotRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  robotLabel: { marginLeft: 8, fontSize: 14, color: '#333' },
});
