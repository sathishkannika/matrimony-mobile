import { apiRequest } from './client';
import type { MatchesSummaryResponse } from '../../types/api';

export function getMatchesSummary(page = 0, size = 24): Promise<MatchesSummaryResponse> {
  return apiRequest<MatchesSummaryResponse>(`/api/matches/summary?page=${page}&size=${size}`);
}
