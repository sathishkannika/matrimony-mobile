import { apiRequest } from './client';
import type { BlockResponse } from '../../types/api';

export function blockProfile(profileId: number): Promise<BlockResponse> {
  return apiRequest<BlockResponse>(`/api/blocks/${profileId}`, { method: 'POST' });
}

export function unblockProfile(profileId: number): Promise<void> {
  return apiRequest<void>(`/api/blocks/${profileId}`, { method: 'DELETE' });
}

export function listBlocks(): Promise<BlockResponse[]> {
  return apiRequest<BlockResponse[]>('/api/blocks');
}
