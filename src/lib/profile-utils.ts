import type { Gender, ProfileResponse } from '../types/api';

/** Female users see male profiles; male users see female profiles. */
export function getOppositeGender(gender: Gender): Gender {
  return gender === 'FEMALE' ? 'MALE' : 'FEMALE';
}

export function isOppositeGender(viewerGender: Gender, profileGender: Gender): boolean {
  return profileGender === getOppositeGender(viewerGender);
}

export function filterProfilesForViewer(
  profiles: ProfileResponse[],
  viewerGender: Gender,
  excludeProfileId?: number,
): ProfileResponse[] {
  const targetGender = getOppositeGender(viewerGender);
  return profiles.filter((p) => p.gender === targetGender && p.id !== excludeProfileId);
}

export function getPartnerLabel(gender: Gender): string {
  return gender === 'MALE' ? 'Grooms' : 'Brides';
}
