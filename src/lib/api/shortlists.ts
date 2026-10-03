import { apiRequest } from './client';
import type { ShortlistResponse } from '../../types/api';

export function addShortlist(profileId: number): Promise<ShortlistResponse> {
  return apiRequest<ShortlistResponse>(`/api/shortlists/${profileId}`, { method: 'POST' });
}

export function removeShortlist(profileId: number): Promise<void> {
  return apiRequest<void>(`/api/shortlists/${profileId}`, { method: 'DELETE' });
}

export function listShortlists(): Promise<ShortlistResponse[]> {
  return apiRequest<ShortlistResponse[]>('/api/shortlists');
}
