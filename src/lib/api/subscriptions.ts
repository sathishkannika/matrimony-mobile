import { apiRequest, apiRequestOptional } from './client';
import type {
  PaymentResponse,
  SubscriptionResponse,
  UpgradeSubscriptionResponse,
} from '../../types/api';

export function getCurrentSubscription(): Promise<SubscriptionResponse | null> {
  return apiRequestOptional<SubscriptionResponse>('/api/subscriptions/current');
}

export function upgradeSubscription(planCode: string): Promise<UpgradeSubscriptionResponse> {
  return apiRequest<UpgradeSubscriptionResponse>('/api/subscriptions/upgrade', {
    method: 'POST',
    body: JSON.stringify({ planCode }),
  });
}

export function getPaymentHistory(): Promise<PaymentResponse[]> {
  return apiRequest<PaymentResponse[]>('/api/payments/history');
}

export function getPaymentStatus(paymentReference: string): Promise<PaymentResponse> {
  return apiRequest<PaymentResponse>(`/api/payments/${encodeURIComponent(paymentReference)}/status`);
}

export function createUpiIntent(body: {
  paymentReference: string;
  email: string;
  contact: string;
}): Promise<{ link: string; razorpayPaymentId?: string }> {
  return apiRequest('/api/payments/razorpay/upi-intent', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
