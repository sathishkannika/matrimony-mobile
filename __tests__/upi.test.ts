import { toUpiUrl } from '../src/lib/payments/upi';

const LINK = 'upi://pay?pa=merchant@razorpay&am=499.00&cu=INR';

describe('UPI app links', () => {
  it('keeps the Razorpay query when switching apps', () => {
    expect(toUpiUrl(LINK, 'upi')).toBe(LINK);
    expect(toUpiUrl(LINK, 'gpay')).toBe('tez://upi/pay?pa=merchant@razorpay&am=499.00&cu=INR');
    expect(toUpiUrl(LINK, 'phonepe')).toBe('phonepe://pay?pa=merchant@razorpay&am=499.00&cu=INR');
    expect(toUpiUrl(LINK, 'bhim')).toBe('bhim://upi/pay?pa=merchant@razorpay&am=499.00&cu=INR');
  });
});
