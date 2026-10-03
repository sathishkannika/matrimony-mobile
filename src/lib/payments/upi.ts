import { Linking } from 'react-native';

export type UpiApp = 'upi' | 'gpay' | 'phonepe' | 'bhim';

/** Rewrite a Razorpay `upi://pay?...` link onto a specific app scheme. */
export function toUpiUrl(intentLink: string, app: UpiApp): string {
  const q = intentLink.indexOf('?');
  const query = q >= 0 ? intentLink.slice(q) : '';
  switch (app) {
    case 'gpay':
      return `tez://upi/pay${query}`;
    case 'phonepe':
      return `phonepe://pay${query}`;
    case 'bhim':
      return `bhim://upi/pay${query}`;
    default:
      return intentLink.startsWith('upi:') ? intentLink : `upi://pay${query}`;
  }
}

/**
 * Opens the system UPI chooser (BHIM, PhonePe, Google Pay, …).
 * If that scheme is missing, tries each app directly.
 */
export async function openUpiCheckout(intentLink: string, app?: UpiApp): Promise<void> {
  const order: UpiApp[] = app ? [app] : ['upi', 'gpay', 'phonepe', 'bhim'];
  let last: unknown;
  for (const id of order) {
    try {
      await Linking.openURL(toUpiUrl(intentLink, id));
      return;
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error('Install Google Pay, PhonePe, or BHIM to pay with UPI');
}
