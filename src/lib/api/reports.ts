import { apiRequest } from './client';
import type { CreateProfileReportRequest, ProfileReportResponse } from '../../types/api';

export function reportProfile(
  profileId: number,
  body: CreateProfileReportRequest,
): Promise<ProfileReportResponse> {
  return apiRequest<ProfileReportResponse>(`/api/reports/${profileId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
