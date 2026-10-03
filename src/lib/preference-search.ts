import type {
  MaritalStatus,
  PartnerPreferenceResponse,
  ProfileResponse,
  ProfileSearchFilters,
} from '../types/api';
import { getOppositeGender } from './profile-utils';

export function searchFiltersFromPreference(
  pref: PartnerPreferenceResponse,
  viewerGender: ProfileResponse['gender'],
): ProfileSearchFilters {
  return {
    gender: getOppositeGender(viewerGender),
    sortBy: 'NEWEST',
    minAge: pref.minAge ?? undefined,
    maxAge: pref.maxAge ?? undefined,
    minHeightCm: pref.minHeightCm ?? undefined,
    maxHeightCm: pref.maxHeightCm ?? undefined,
    maritalStatus: (pref.maritalStatus as MaritalStatus | undefined) ?? undefined,
    religion: pref.religion ?? undefined,
    caste: pref.caste ?? undefined,
    subCasteId: pref.subCasteId ?? undefined,
    motherTongue: pref.motherTongue ?? undefined,
    education: pref.education ?? undefined,
    profession: pref.profession ?? undefined,
    annualIncome: pref.minIncome ?? undefined,
    locations: pref.locations?.length ? pref.locations : undefined,
  };
}
