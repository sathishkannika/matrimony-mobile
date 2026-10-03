import type { ProfileResponse } from '../types/api';

const COMPLETION_CHECKS: Array<(p: ProfileResponse) => unknown> = [
  (p) => p.email,
  (p) => p.mobile,
  (p) => p.firstName,
  (p) => p.lastName,
  (p) => p.dob,
  (p) => p.gender,
  (p) => p.maritalStatus,
  (p) => p.heightCm,
  (p) => p.weightKg,
  (p) => p.bloodGroup,
  (p) => p.religion,
  (p) => p.caste,
  (p) => p.subCasteId ?? p.subCasteName,
  (p) => p.motherTongue,
  (p) => p.star,
  (p) => p.rasi,
  (p) => p.highestDegree,
  (p) => p.course,
  (p) => p.profession,
  (p) => p.companyName,
  (p) => p.annualIncome,
  (p) => p.diet,
  (p) => p.houseType,
  (p) => p.physicalStatus,
  (p) => p.fatherName,
  (p) => p.fatherOccupation,
  (p) => p.motherName,
  (p) => p.motherOccupation,
  (p) => p.siblings,
  (p) => p.aboutMe,
  (p) => p.partnerExpectation,
  (p) => p.hobbies,
  (p) => p.city || p.address?.city,
  (p) => p.state || p.address?.state,
  (p) => p.address?.country || p.address?.pincode,
  (p) => p.primaryPhotoUrl || p.primaryPhotoThumbnailUrl,
  (p) => p.hasHoroscope,
  (p) => p.referencePersonName,
  (p) => p.referencePersonContact,
];

function filled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) && value !== 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return Boolean(value);
}

export interface ProfileCompletion {
  percent: number;
  filled: number;
  total: number;
}

export function getProfileCompletion(profile: ProfileResponse): ProfileCompletion {
  const total = COMPLETION_CHECKS.length;
  let filledCount = 0;
  for (const check of COMPLETION_CHECKS) {
    if (filled(check(profile))) filledCount += 1;
  }
  const percent = total === 0 ? 0 : Math.round((filledCount / total) * 100);
  return { percent, filled: filledCount, total };
}

export function getProfileCompletionPercent(profile: ProfileResponse): number {
  return getProfileCompletion(profile).percent;
}
