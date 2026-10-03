import { Platform } from 'react-native';
import type { ApiResponse, AuthResponse } from '../../types/api';
import { API_BASE_URL } from '../config/env';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpiringSoon,
  saveSession,
} from '../auth/secureStorage';

/**
 * Mobile port of matrimony-ui/src/lib/api/client.ts. Same single-flight refresh + retry-once
 * design; the only functional difference from the web client is:
 *  - token reads/writes go through the async Keychain-backed secureStorage instead of sync
 *    localStorage/sessionStorage, and
 *  - every request carries `X-Client-Type: ANDROID|IOS` so the backend's refresh-token registry
 *    can scope reuse-detection/revocation per device family (see AuthService.consumeRefreshTokenOrDetectReuse).
 *    This header is NOT the same as putting clientType in the refresh request body — the backend
 *    reads it from the header on every auth endpoint, including /refresh.
 */

export class ApiError extends Error {
  status: number;
  /** Field-level messages from the API (e.g. "dob: Date of birth is required"). */
  errors: string[];

  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const CLIENT_TYPE = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

let refreshInFlight: Promise<boolean> | null = null;

function isAuthPath(path: string): boolean {
  return (
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/register') ||
    path.startsWith('/api/auth/refresh') ||
    path.startsWith('/api/auth/captcha') ||
    path.startsWith('/api/auth/forgot-password')
  );
}

function hasJsonBody(options: RequestInit): boolean {
  return options.body != null && options.body !== '';
}

/** Single-flight refresh using raw fetch (avoids apiRequest recursion). */
async function refreshAccessTokenOnce(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client-Type': CLIENT_TYPE },
        body: JSON.stringify({ refreshToken }),
      });
      const body = (await response.json()) as ApiResponse<AuthResponse>;
      if (!response.ok || !body.success || !body.data?.accessToken || !body.data?.refreshToken) {
        return false;
      }
      await saveSession(body.data);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

/**
 * If a refresh token exists and access is missing/near expiry, renew both tokens.
 * Returns false when refresh was needed but failed (session should be cleared by caller).
 */
export async function ensureFreshAccessToken(): Promise<boolean> {
  if (!(await getRefreshToken())) {
    return (await getAccessToken()) != null;
  }
  if (!(await isAccessTokenExpiringSoon())) {
    return true;
  }
  return refreshAccessTokenOnce();
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<T> {
  if (!isAuthPath(path) && !retried) {
    const ok = await ensureFreshAccessToken();
    if (!ok && (await getRefreshToken())) {
      await clearSession();
      throw new ApiError('Session expired', 401);
    }
  }

  const token = await getAccessToken();
  const headers = new Headers(options.headers);
  if (hasJsonBody(options) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-Client-Type', CLIENT_TYPE);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  let body: ApiResponse<T> & { status?: number; errors?: string[] };
  try {
    body = (await response.json()) as ApiResponse<T> & { status?: number; errors?: string[] };
  } catch {
    throw new ApiError(response.statusText || 'Request failed', response.status);
  }

  if (response.status === 401 && !isAuthPath(path) && !retried) {
    if (await getRefreshToken()) {
      const refreshed = await refreshAccessTokenOnce();
      if (refreshed) {
        return apiRequest<T>(path, options, true);
      }
      await clearSession();
    } else if (token) {
      await clearSession();
    }
  }

  if (!response.ok || body.success === false) {
    const errors = Array.isArray(body.errors) ? body.errors.filter(Boolean) : [];
    throw new ApiError(
      body.message || response.statusText || 'Request failed',
      response.status,
      errors
    );
  }

  return body.data;
}

/** Like apiRequest but returns null on 404 instead of throwing. */
export async function apiRequestOptional<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  try {
    return await apiRequest<T>(path, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
