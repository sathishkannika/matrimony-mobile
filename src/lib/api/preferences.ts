import { apiRequest, apiRequestOptional } from './client';
import type { PartnerPreferenceRequest, PartnerPreferenceResponse } from '../../types/api';

export function getPreference(): Promise<PartnerPreferenceResponse | null> {
  return apiRequestOptional<PartnerPreferenceResponse>('/api/preferences');
}

export function savePreference(
  request: PartnerPreferenceRequest,
): Promise<PartnerPreferenceResponse> {
  return apiRequest<PartnerPreferenceResponse>('/api/preferences', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function updatePreference(
  request: PartnerPreferenceRequest,
): Promise<PartnerPreferenceResponse> {
  return apiRequest<PartnerPreferenceResponse>('/api/preferences', {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}
