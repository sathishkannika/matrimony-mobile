import { apiRequest } from './client';
import type { InterestDashboardCounts, InterestResponse } from '../../types/api';

export function sendInterest(receiverProfileId: number): Promise<InterestResponse> {
  return apiRequest<InterestResponse>(`/api/interests/${receiverProfileId}`, { method: 'POST' });
}

export function acceptInterest(id: number): Promise<InterestResponse> {
  return apiRequest<InterestResponse>(`/api/interests/${id}/accept`, { method: 'PUT' });
}

export function rejectInterest(id: number): Promise<InterestResponse> {
  return apiRequest<InterestResponse>(`/api/interests/${id}/reject`, { method: 'PUT' });
}

export function cancelInterest(id: number): Promise<InterestResponse> {
  return apiRequest<InterestResponse>(`/api/interests/${id}/cancel`, { method: 'PUT' });
}

export function getSentInterests(): Promise<InterestResponse[]> {
  return apiRequest<InterestResponse[]>('/api/interests/sent');
}

export function getReceivedInterests(): Promise<InterestResponse[]> {
  return apiRequest<InterestResponse[]>('/api/interests/received');
}

export function getDashboardCounts(): Promise<InterestDashboardCounts> {
  return apiRequest<InterestDashboardCounts>('/api/interests/dashboard');
}
