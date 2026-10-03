import { apiRequest, apiRequestOptional } from './client';
import { SEARCH_PAGE_SIZE } from '../search-pagination';
import type {
  DeleteProfileRequest,
  PagedResponse,
  ProfileCreateRequest,
  ProfileRelationsBatchResponse,
  ProfileResponse,
  ProfileSearchRequest,
  ProfileUpdateRequest,
  ProfileViewerRelationResponse,
} from '../../types/api';

export function createProfile(request: ProfileCreateRequest): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/api/profiles', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function getMyProfile(): Promise<ProfileResponse | null> {
  return apiRequestOptional<ProfileResponse>('/api/profiles/me');
}

export function getProfile(id: number, options?: { trackView?: boolean }): Promise<ProfileResponse> {
  const trackView = options?.trackView !== false;
  const qs = trackView ? '' : '?trackView=false';
  return apiRequest<ProfileResponse>(`/api/profiles/${id}${qs}`);
}

export function getProfileRelation(id: number): Promise<ProfileViewerRelationResponse> {
  return apiRequest<ProfileViewerRelationResponse>(`/api/profiles/${id}/relation`);
}

export function getProfileRelationsBatch(
  profileIds: number[],
): Promise<ProfileRelationsBatchResponse> {
  return apiRequest<ProfileRelationsBatchResponse>('/api/profiles/viewer-relations', {
    method: 'POST',
    body: JSON.stringify({ profileIds }),
  });
}

export function updateProfile(request: ProfileUpdateRequest): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/api/profiles', {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

export function deleteProfile(request: DeleteProfileRequest): Promise<void> {
  return apiRequest<void>('/api/profiles', {
    method: 'DELETE',
    body: JSON.stringify(request),
  });
}

export function deactivateProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/api/profiles/deactivate', { method: 'PUT' });
}

export function activateProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/api/profiles/activate', { method: 'PUT' });
}

function appendParam(params: URLSearchParams, key: string, value: unknown) {
  if (value === null || value === undefined || value === '') return;
  params.set(key, String(value));
}

export function searchProfiles(
  request: ProfileSearchRequest,
): Promise<PagedResponse<ProfileResponse>> {
  const params = new URLSearchParams();
  appendParam(params, 'page', request.page ?? 0);
  appendParam(params, 'size', request.size ?? SEARCH_PAGE_SIZE);
  appendParam(params, 'profileId', request.profileId);
  appendParam(params, 'gender', request.gender);
  appendParam(params, 'minAge', request.minAge);
  appendParam(params, 'maxAge', request.maxAge);
  appendParam(params, 'dobFrom', request.dobFrom);
  appendParam(params, 'dobTo', request.dobTo);
  appendParam(params, 'minHeightCm', request.minHeightCm);
  appendParam(params, 'maxHeightCm', request.maxHeightCm);
  appendParam(params, 'maritalStatus', request.maritalStatus);
  appendParam(params, 'religion', request.religion);
  appendParam(params, 'caste', request.caste);
  appendParam(params, 'subCasteId', request.subCasteId);
  appendParam(params, 'motherTongue', request.motherTongue);
  appendParam(params, 'education', request.education);
  appendParam(params, 'profession', request.profession);
  appendParam(params, 'annualIncome', request.annualIncome);
  appendParam(params, 'houseType', request.houseType);
  appendParam(params, 'star', request.star);
  appendParam(params, 'rasi', request.rasi);
  appendParam(params, 'city', request.city);
  appendParam(params, 'state', request.state);
  appendParam(params, 'country', request.country);
  if (request.locations?.length) {
    const payload = request.locations.map(({ country, state, city }) => ({
      country,
      state: state || undefined,
      city: city || undefined,
    }));
    params.set('locations', JSON.stringify(payload));
  }
  appendParam(params, 'sortBy', request.sortBy ?? 'NEWEST');

  const qs = params.toString();
  return apiRequest<PagedResponse<ProfileResponse>>(`/api/profiles/search${qs ? `?${qs}` : ''}`, {
    method: 'GET',
  });
}
