import { apiRequest } from './client';
import type { PhotoResponse } from '../../types/api';

export interface PresignedUpload {
  uploadUrl: string;
  objectKey: string;
  contentType: string;
  expiresInSeconds: number;
}

export function listPhotos(): Promise<PhotoResponse[]> {
  return apiRequest<PhotoResponse[]>('/api/photos');
}

export function listPhotosForProfile(profileId: number): Promise<PhotoResponse[]> {
  return apiRequest<PhotoResponse[]>(`/api/photos/profile/${profileId}`);
}

export function uploadPhoto(imageUrl: string, isPrimary = false): Promise<PhotoResponse> {
  return apiRequest<PhotoResponse>('/api/photos', {
    method: 'POST',
    body: JSON.stringify({ imageUrl, isPrimary }),
  });
}

export function presignPhotoUpload(contentType: string): Promise<PresignedUpload> {
  return apiRequest<PresignedUpload>('/api/photos/presign', {
    method: 'POST',
    body: JSON.stringify({ contentType }),
  });
}

export async function uploadPhotoFromUri(
  uri: string,
  contentType = 'image/jpeg',
  isPrimary = false,
): Promise<PhotoResponse> {
  const presign = await presignPhotoUpload(contentType);
  const put = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': presign.contentType },
    body: { uri, type: contentType, name: 'photo.jpg' } as never,
  });
  if (!put.ok) {
    throw new Error(`S3 upload failed (${put.status})`);
  }
  return uploadPhoto(presign.objectKey, isPrimary);
}

export function deletePhoto(id: number): Promise<void> {
  return apiRequest<void>(`/api/photos/${id}`, { method: 'DELETE' });
}

export function setPrimaryPhoto(id: number): Promise<PhotoResponse> {
  return apiRequest<PhotoResponse>(`/api/photos/${id}/primary`, { method: 'PUT' });
}
