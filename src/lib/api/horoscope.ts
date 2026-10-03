import { apiRequest } from './client';
import type { PresignedUpload } from './photos';

export interface PresignedDownload {
  downloadUrl: string;
  expiresInSeconds: number;
}

export function presignHoroscopeUpload(contentType: string): Promise<PresignedUpload> {
  return apiRequest<PresignedUpload>('/api/profiles/horoscope/presign', {
    method: 'POST',
    body: JSON.stringify({ contentType }),
  });
}

export function confirmHoroscopeUpload(objectKey: string): Promise<void> {
  return apiRequest<void>('/api/profiles/horoscope', {
    method: 'PUT',
    body: JSON.stringify({ objectKey }),
  });
}

export function deleteHoroscope(): Promise<void> {
  return apiRequest<void>('/api/profiles/horoscope', { method: 'DELETE' });
}

export function getHoroscopeDownload(profileId: number): Promise<PresignedDownload> {
  return apiRequest<PresignedDownload>(`/api/profiles/${profileId}/horoscope`);
}
