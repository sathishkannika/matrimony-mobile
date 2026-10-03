import type { SubscriptionResponse } from '../types/api';

export type PhotoViewDenyReason = 'trial' | 'expired' | 'inactive' | 'none';

export interface PhotoViewAccess {
  allowed: boolean;
  reason: PhotoViewDenyReason;
  planCode: string;
  planName: string;
  daysRemaining?: number;
  validUntil?: string;
}

export interface ContactViewAccess {
  canViewMobile: boolean;
  canViewEmail: boolean;
  canViewAny: boolean;
}

const PAID_PLANS = new Set(['STANDARD', 'PREMIUM', 'PLATINUM']);

function featureFlag(subscription: SubscriptionResponse | undefined | null, key: string): boolean {
  const features = subscription?.features;
  if (!features || typeof features !== 'object') return false;
  return Boolean((features as Record<string, unknown>)[key]);
}

export function getContactViewAccess(subscription?: SubscriptionResponse | null): ContactViewAccess {
  if (!subscription || subscription.subscriptionStatus !== 'ACTIVE') {
    return { canViewMobile: false, canViewEmail: false, canViewAny: false };
  }
  const canViewMobile = featureFlag(subscription, 'canViewMobile');
  const canViewEmail = featureFlag(subscription, 'canViewEmail');
  return { canViewMobile, canViewEmail, canViewAny: canViewMobile || canViewEmail };
}

export function canDownloadHoroscope(subscription?: SubscriptionResponse | null): boolean {
  if (!subscription || subscription.subscriptionStatus !== 'ACTIVE') return false;
  return featureFlag(subscription, 'canDownloadHoroscope');
}

export function getPhotoViewAccess(subscription?: SubscriptionResponse): PhotoViewAccess {
  if (!subscription || subscription.subscriptionStatus !== 'ACTIVE') {
    return {
      allowed: false,
      reason: 'inactive',
      planCode: subscription?.planCode ?? 'NONE',
      planName: subscription?.planName ?? 'No Plan',
    };
  }

  const now = Date.now();
  const endMs = subscription.endDate ? new Date(subscription.endDate).getTime() : undefined;

  if (endMs !== undefined && endMs <= now) {
    return {
      allowed: false,
      reason: 'expired',
      planCode: subscription.planCode,
      planName: subscription.planName,
      validUntil: subscription.endDate,
    };
  }

  const photosFlagPresent =
    subscription.features != null &&
    typeof subscription.features === 'object' &&
    'canViewPhotos' in subscription.features;

  const photosAllowed = photosFlagPresent
    ? featureFlag(subscription, 'canViewPhotos')
    : PAID_PLANS.has(subscription.planCode) &&
      subscription.planCode !== 'TRIAL' &&
      subscription.source !== 'TRIAL';

  if (!photosAllowed) {
    return {
      allowed: false,
      reason: 'trial',
      planCode: subscription.planCode,
      planName: subscription.planName,
      validUntil: subscription.endDate,
    };
  }

  const daysRemaining =
    endMs !== undefined ? Math.max(0, Math.ceil((endMs - now) / (1000 * 60 * 60 * 24))) : undefined;

  return {
    allowed: true,
    reason: 'none',
    planCode: subscription.planCode,
    planName: subscription.planName,
    daysRemaining,
    validUntil: subscription.endDate,
  };
}

export function ownPhotoViewAccess(subscription?: SubscriptionResponse | null): PhotoViewAccess {
  return {
    allowed: true,
    reason: 'none',
    planCode: subscription?.planCode ?? 'OWN',
    planName: subscription?.planName ?? 'Own profile',
    daysRemaining: undefined,
    validUntil: subscription?.endDate,
  };
}
