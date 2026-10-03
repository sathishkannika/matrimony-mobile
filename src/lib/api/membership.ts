import { apiRequest } from './client';
import type { MembershipPlanResponse } from '../../types/api';

export function listMembershipPlans(): Promise<MembershipPlanResponse[]> {
  return apiRequest<MembershipPlanResponse[]>('/api/membership-plans');
}
