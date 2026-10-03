import { apiRequest } from './client';
import type { ProfileViewResponse } from '../../types/api';

export function listWhoViewedMe(): Promise<ProfileViewResponse[]> {
  return apiRequest<ProfileViewResponse[]>('/api/profile-views/received');
}

export function listMyVisits(): Promise<ProfileViewResponse[]> {
  return apiRequest<ProfileViewResponse[]>('/api/profile-views/visited');
}
