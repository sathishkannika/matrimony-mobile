import React, { useCallback, useEffect, useState } from 'react';
import { AppState, FlatList, StyleSheet, Text, View } from 'react-native';
import { Check, Crown } from 'lucide-react-native';
import { listMembershipPlans } from '../lib/api/membership';
import { createUpiIntent, getCurrentSubscription, getPaymentHistory, getPaymentStatus, upgradeSubscription } from '../lib/api/subscriptions';
import { ApiError } from '../lib/api/client';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { openUpiCheckout, type UpiApp } from '../lib/payments/upi';
import { useToast } from '../components/ui/toast';
import type { MembershipPlanResponse, PaymentResponse, SubscriptionResponse } from '../types/api';
import type { AppScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageError, PageLoading } from '../components/layout/PageState';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { colors, spacing, type as typeScale } from '../theme/tokens';
import { useResponsive } from '../theme/responsive';

const OPEN = new Set(['INITIATED', 'PENDING']);

function planFeatures(plan: MembershipPlanResponse): string[] {
  return [
    plan.maxProfileViews && plan.maxProfileViews > 0 ? `View up to ${plan.maxProfileViews} profiles` : 'See all profiles',
    plan.maxInterestPerDay ? `${plan.maxInterestPerDay} interests/day` : '',
    plan.maxPhotoUpload ? `${plan.maxPhotoUpload} photos you can upload` : '',
    plan.canViewPhotos ? 'View profile photos' : '',
    plan.canViewMobile ? 'View phone numbers' : '',
    plan.canViewEmail ? 'View email addresses' : '',
    plan.canDownloadHoroscope ? 'Download horoscopes' : '',
    plan.canChat ? 'In-app chat' : '',
    plan.profileHighlight ? 'Profile highlight badge' : '',
  ].filter(Boolean);
}

function money(currency: string, price: number): string {
  const amount = Number(price).toLocaleString('en-IN');
  return currency === 'INR' ? `₹${amount}` : `${currency} ${amount}`;
}

function upiContact(countryCode?: string, mobile?: string): string {
  return `${(countryCode ?? '91').replace(/\D/g, '')}${(mobile ?? '').replace(/\D/g, '')}`;
}

export default function MembershipScreen({ navigation }: AppScreenProps<'Membership'>) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { myProfile, reload } = useAppSession();
  const { planColumns } = useResponsive();
  const [plans, setPlans] = useState<MembershipPlanResponse[]>([]);
  const [sub, setSub] = useState<SubscriptionResponse | null>(null);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingCode, setPayingCode] = useState<string | null>(null);
  const [intentLink, setIntentLink] = useState<string | null>(null);
  const [watching, setWatching] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, s, hist] = await Promise.all([listMembershipPlans(), getCurrentSubscription(), getPaymentHistory()]);
      setPlans(p.filter((plan) => plan.active));
      setSub(s);
      setPayments(hist);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!watching) return;
    let stop = false;
    const tick = async () => {
      try {
        const status = await getPaymentStatus(watching);
        if (stop || OPEN.has(status.paymentStatus)) return;
        setWatching(null);
        setIntentLink(null);
        await reload();
        await load();
        toast(status.paymentStatus === 'SUCCESS' ? 'Payment received' : `Payment ${status.paymentStatus.toLowerCase()}`, status.paymentStatus === 'SUCCESS' ? 'success' : 'error');
      } catch {
        // Keep polling; the gateway may still be confirming the UPI debit.
      }
    };
    const subApp = AppState.addEventListener('change', (state) => {
      if (state === 'active') void tick();
    });
    const timer = setInterval(() => void tick(), 4000);
    return () => {
      stop = true;
      subApp.remove();
      clearInterval(timer);
    };
  }, [watching, reload, load, toast]);

  const pay = async (plan: MembershipPlanResponse) => {
    const email = myProfile?.email?.trim();
    const contact = upiContact(myProfile?.countryCode, myProfile?.mobile);
    if (!email || contact.length < 10) {
      toast('Add your email and mobile on your profile before paying', 'error');
      return;
    }
    setPayingCode(plan.planCode);
    try {
      const order = await upgradeSubscription(plan.planCode);
      const ref = order.payment.paymentReference;
      if (!OPEN.has(order.payment.paymentStatus) || order.amountDue <= 0) {
        await reload();
        await load();
        toast('Plan updated', 'success');
        return;
      }
      if (order.gateway !== 'razorpay') {
        toast('UPI app checkout is available when Razorpay is the payment gateway', 'error');
        return;
      }
      const intent = await createUpiIntent({ paymentReference: ref, email, contact });
      setIntentLink(intent.link);
      setWatching(ref);
      await openUpiCheckout(intent.link);
    } catch (err) {
      toast(err instanceof ApiError || err instanceof Error ? err.message : 'Could not open a UPI app', 'error');
    } finally {
      setPayingCode(null);
    }
  };

  const openApp = async (app: UpiApp) => {
    if (!intentLink) return;
    try {
      await openUpiCheckout(intentLink, app);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'That UPI app is not installed', 'error');
    }
  };

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={load} />;

  return (
    <Screen>
      <FlatList
        key={planColumns}
        data={plans}
        keyExtractor={(item) => String(item.id)}
        numColumns={planColumns}
        columnWrapperStyle={planColumns > 1 ? styles.row : undefined}
        style={styles.fill}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
            <PageHeader title={t('plans')} description={t('plansDesc')} />
            {!myProfile?.email?.trim() || upiContact(myProfile?.countryCode, myProfile?.mobile).length < 10 ? (
              <Text style={typeScale.caption}>Add your email and mobile on your profile before you can pay.</Text>
            ) : null}
            {sub ? (
              <Card style={styles.current}>
                <Badge label={sub.planName} variant="gold" />
                <Text style={typeScale.caption}>{sub.subscriptionStatus}</Text>
              </Card>
            ) : null}
            {intentLink ? (
              <Card style={styles.current}>
                <Text style={typeScale.body}>Finish in your UPI app. If it did not open, choose one:</Text>
                <View style={styles.apps}>
                  <Button title="Google Pay" size="sm" onPress={() => void openApp('gpay')} />
                  <Button title="PhonePe" size="sm" variant="outline" onPress={() => void openApp('phonepe')} />
                  <Button title="BHIM" size="sm" variant="outline" onPress={() => void openApp('bhim')} />
                </View>
              </Card>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const current = item.planCode === sub?.planCode;
          const features = planFeatures(item);
          return (
            <Card style={styles.card}>
              {item.planType === 'PLATINUM' ? (
                <View style={styles.popular}>
                  <Crown size={12} color={colors.goldForeground} />
                  <Text style={styles.popularText}>Popular</Text>
                </View>
              ) : null}
              <Text style={typeScale.h3}>{item.planName}</Text>
              <Text style={typeScale.caption}>{item.durationDays} days</Text>
              <Text style={styles.price}>
                {money(item.currency, item.price)}
                <Text style={typeScale.caption}> / plan</Text>
              </Text>
              {features.map((feature) => (
                <View key={feature} style={styles.feature}>
                  <Check size={14} color={colors.accent} />
                  <Text style={[typeScale.body, styles.featureText]}>{feature}</Text>
                </View>
              ))}
              <Button
                title={current ? 'Current Plan' : item.planType === 'TRIAL' ? 'Auto on Register' : 'Upgrade'}
                variant={item.planType === 'PLATINUM' ? 'gold' : 'outline'}
                disabled={current || item.planType === 'TRIAL' || payingCode != null}
                loading={payingCode === item.planCode}
                onPress={() => void pay(item)}
                style={styles.upgrade}
              />
            </Card>
          );
        }}
        ListFooterComponent={
          payments.length ? (
            <View style={styles.history}>
              <Text style={typeScale.h3}>{t('paymentHistory')}</Text>
              {payments.map((payment) => (
                <Text key={payment.paymentReference} style={typeScale.caption}>
                  {payment.paymentReference} · {money(payment.currency, payment.finalAmount)} · {payment.paymentStatus}
                </Text>
              ))}
            </View>
          ) : undefined
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  row: { gap: spacing.md, marginBottom: spacing.md },
  current: { padding: spacing.md, gap: 8, marginBottom: spacing.md },
  card: { flex: 1, padding: spacing.md, gap: 6 },
  popular: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  popularText: { fontSize: 11, color: colors.goldForeground },
  price: { ...typeScale.h2, fontSize: 28, lineHeight: 34 },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureText: { flex: 1 },
  upgrade: { alignSelf: 'stretch', marginTop: spacing.sm },
  apps: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  history: { gap: 6, marginTop: spacing.lg },
});
