import { apiRequest } from './client';
import type { NotificationResponse } from '../../types/api';

export function listNotifications(): Promise<NotificationResponse[]> {
  return apiRequest<NotificationResponse[]>('/api/notifications');
}

export function markNotificationRead(id: number): Promise<void> {
  return apiRequest<void>(`/api/notifications/${id}/read`, { method: 'PUT' });
}
