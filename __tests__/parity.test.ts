import { colors } from '../src/theme/tokens';
import { filterProfilesForViewer, getOppositeGender } from '../src/lib/profile-utils';
import { getPhotoViewAccess } from '../src/lib/subscription-utils';
import type { ProfileResponse, SubscriptionResponse } from '../src/types/api';

describe('matrimony-ui token + viewer parity', () => {
  it('keeps brand maroon and gold from index.css', () => {
    expect(colors.primary).toBe('#800000');
    expect(colors.accent).toBe('#D4AF37');
  });

  it('filters opposite-gender profiles and excludes self', () => {
    expect(getOppositeGender('MALE')).toBe('FEMALE');
    const profiles = [
      { id: 1, gender: 'FEMALE' },
      { id: 2, gender: 'MALE' },
      { id: 3, gender: 'FEMALE' },
    ] as ProfileResponse[];
    expect(filterProfilesForViewer(profiles, 'MALE', 3).map((p) => p.id)).toEqual([1]);
  });

  it('never allows partner photos on inactive/trial-like subscriptions', () => {
    const denied = getPhotoViewAccess(undefined);
    expect(denied.allowed).toBe(false);
    const trial = getPhotoViewAccess({
      id: 1,
      subscriptionNumber: 'x',
      subscriptionStatus: 'ACTIVE',
      source: 'TRIAL',
      planName: 'Trial',
      planCode: 'TRIAL',
      price: 0,
      features: { canViewPhotos: false },
    } as SubscriptionResponse);
    expect(trial.allowed).toBe(false);
  });
});
