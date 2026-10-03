import { Platform } from 'react-native';
import { ApiError, apiRequest, ensureFreshAccessToken } from './client';
import { API_BASE_URL } from '../config/env';
import {
  clearSession,
  getRefreshToken,
  getStoredAuthUser,
  saveSession,
  type StoredAuthUser,
} from '../auth/secureStorage';
import type { AuthResponse, CaptchaResponse, LoginRequest, RegisterRequest } from '../../types/api';

/** Mobile port of matrimony-ui/src/lib/api/auth.ts. Same endpoints/contracts as the web client. */

const CLIENT_TYPE = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

export async function register(request: RegisterRequest): Promise<StoredAuthUser> {
  const response = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return saveSession(response);
}

export async function login(request: LoginRequest): Promise<StoredAuthUser> {
  const response = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return saveSession(response);
}

/** GET /api/auth/captcha — public one-time SVG challenge (answer never returned as plaintext). */
export function fetchCaptchaChallenge(): Promise<CaptchaResponse> {
  return apiRequest<CaptchaResponse>('/api/auth/captcha');
}

export async function refreshAccessToken(): Promise<StoredAuthUser> {
  if (!(await getRefreshToken())) {
    throw new ApiError('Session expired', 401);
  }
  const ok = await ensureFreshAccessToken();
  if (!ok) {
    await clearSession();
    throw new ApiError('Session expired', 401);
  }
  const user = await getStoredAuthUser();
  if (!user) {
    throw new ApiError('Session expired', 401);
  }
  return user;
}

/** Clears the local session immediately, then best-effort revokes the refresh token server-side. */
export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  await clearSession();
  if (refreshToken) {
    void fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Client-Type': CLIENT_TYPE },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
}

/** POST /api/auth/verify-email/send — OTP to the account email (auth required). */
export function sendEmailVerifyOtp(): Promise<void> {
  return apiRequest<void>('/api/auth/verify-email/send', { method: 'POST' });
}

/** POST /api/auth/verify-email/confirm */
export function confirmEmailVerify(otp: string): Promise<void> {
  return apiRequest<void>('/api/auth/verify-email/confirm', {
    method: 'POST',
    body: JSON.stringify({ otp }),
  });
}

/** POST /api/auth/verify-mobile/send — OTP to the account mobile (auth required). */
export function sendMobileVerifyOtp(): Promise<void> {
  return apiRequest<void>('/api/auth/verify-mobile/send', { method: 'POST' });
}

/** POST /api/auth/verify-mobile/confirm */
export function confirmMobileVerify(otp: string): Promise<void> {
  return apiRequest<void>('/api/auth/verify-mobile/confirm', {
    method: 'POST',
    body: JSON.stringify({ otp }),
  });
}

/** POST /api/auth/forgot-password/send — public; always responds OK to avoid email enumeration. */
export function sendForgotPasswordOtp(email: string): Promise<void> {
  return apiRequest<void>('/api/auth/forgot-password/send', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/** POST /api/auth/forgot-password/reset */
export function resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<void> {
  return apiRequest<void>('/api/auth/forgot-password/reset', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

/** PUT /api/auth/change-password (auth required). */
export function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  return apiRequest<void>('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}
