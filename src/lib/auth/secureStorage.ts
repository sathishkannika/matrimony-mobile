import * as Keychain from 'react-native-keychain';
import type { AuthResponse } from '../../types/api';

/**
 * Mobile equivalent of matrimony-ui/src/lib/auth/session.ts, backed by iOS Keychain / Android
 * Keystore (react-native-keychain) instead of localStorage/sessionStorage — there is no "remember
 * me" toggle on mobile: like Instagram/WhatsApp, staying signed in across app restarts IS the
 * expected behavior, and the OS-level lock screen is the access gate (see biometricLock.ts for the
 * optional additional app-level re-lock on foreground).
 *
 * Deliberately NOT using ACCESS_CONTROL.BIOMETRY_* / STORAGE_TYPE.AES_GCM on these entries: that
 * would force a native Face ID/fingerprint prompt on every single token read, including the silent
 * background refresh in client.ts — breaking the "just works" session model this is supposed to
 * replicate. Biometric gating is layered on top via biometricLock.ts instead, not baked into
 * storage access.
 */

const SERVICE_ACCESS_TOKEN = 'com.matrimony.mobile.accessToken';
const SERVICE_REFRESH_TOKEN = 'com.matrimony.mobile.refreshToken';
const SERVICE_SESSION_META = 'com.matrimony.mobile.sessionMeta';

/** Keychain requires a non-empty "username" field; the secret itself lives in "password". */
const KEYCHAIN_USERNAME = 'matrimony';

const keychainOptions: Keychain.SetOptions = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
};

export interface StoredAuthUser {
  userId: number;
  username: string;
  profileId: number | null;
  role: string;
}

interface SessionMeta {
  accessTokenExpiresAt: number;
  user: StoredAuthUser;
}

async function setSecret(service: string, value: string): Promise<void> {
  await Keychain.setGenericPassword(KEYCHAIN_USERNAME, value, { ...keychainOptions, service });
}

async function getSecret(service: string): Promise<string | null> {
  const result = await Keychain.getGenericPassword({ service });
  return result ? result.password : null;
}

/** Decode a JWT's `exp` claim (seconds since epoch) without verifying the signature — display-only. */
function readJwtExpiryMs(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    const json = JSON.parse(base64Decode(base64)) as { exp?: number };
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Minimal base64 -> utf8 decoder — RN/Hermes has no global atob/Buffer without a polyfill. */
function base64Decode(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  let buffer = 0;
  let bits = 0;
  for (const char of input) {
    if (char === '=') break;
    const index = chars.indexOf(char);
    if (index === -1) continue;
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return decodeURIComponent(
    output
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );
}

/** Refresh access token this many ms before server-side expiry — mirrors the web app's skew. */
export const ACCESS_TOKEN_REFRESH_SKEW_MS = 60_000;

export async function saveSession(response: AuthResponse): Promise<StoredAuthUser> {
  const user: StoredAuthUser = {
    userId: response.userId,
    username: response.username,
    profileId: response.profileId ?? null,
    role: response.role ?? 'USER',
  };
  const meta: SessionMeta = {
    accessTokenExpiresAt: Date.now() + (Number(response.expiresIn) || 0) * 1000,
    user,
  };
  await Promise.all([
    setSecret(SERVICE_ACCESS_TOKEN, response.accessToken),
    setSecret(SERVICE_REFRESH_TOKEN, response.refreshToken),
    setSecret(SERVICE_SESSION_META, JSON.stringify(meta)),
  ]);
  return user;
}

export async function getAccessToken(): Promise<string | null> {
  return getSecret(SERVICE_ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return getSecret(SERVICE_REFRESH_TOKEN);
}

async function getSessionMeta(): Promise<SessionMeta | null> {
  const raw = await getSecret(SERVICE_SESSION_META);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionMeta;
  } catch {
    return null;
  }
}

export async function getStoredAuthUser(): Promise<StoredAuthUser | null> {
  const meta = await getSessionMeta();
  return meta?.user ?? null;
}

export async function updateStoredProfileId(profileId: number | null): Promise<StoredAuthUser | null> {
  const meta = await getSessionMeta();
  if (!meta) return null;
  const updated: SessionMeta = { ...meta, user: { ...meta.user, profileId } };
  await setSecret(SERVICE_SESSION_META, JSON.stringify(updated));
  return updated.user;
}

/** True when access is missing or within the refresh skew window. */
export async function isAccessTokenExpiringSoon(skewMs = ACCESS_TOKEN_REFRESH_SKEW_MS): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return true;
  const meta = await getSessionMeta();
  const expiresAt = meta?.accessTokenExpiresAt ?? readJwtExpiryMs(token);
  if (expiresAt == null) return false;
  return Date.now() >= expiresAt - skewMs;
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    Keychain.resetGenericPassword({ service: SERVICE_ACCESS_TOKEN }),
    Keychain.resetGenericPassword({ service: SERVICE_REFRESH_TOKEN }),
    Keychain.resetGenericPassword({ service: SERVICE_SESSION_META }),
  ]);
}

const SERVICE_LANGUAGE = 'com.matrimony.mobile.language';

export async function getStoredLanguage(): Promise<'en' | 'ta' | null> {
  const raw = await getSecret(SERVICE_LANGUAGE);
  return raw === 'en' || raw === 'ta' ? raw : null;
}

export async function setStoredLanguage(lang: 'en' | 'ta'): Promise<void> {
  await setSecret(SERVICE_LANGUAGE, lang);
}

export async function hasStoredSession(): Promise<boolean> {
  return (await getRefreshToken()) != null;
}
