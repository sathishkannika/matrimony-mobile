import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getDashboardCounts } from '../api/interests';
import { getMyProfile } from '../api/profiles';
import { getCurrentSubscription } from '../api/subscriptions';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { InterestDashboardCounts, ProfileResponse, SubscriptionResponse } from '../../types/api';

interface AppSessionValue {
  myProfile: ProfileResponse | null;
  subscription: SubscriptionResponse | null;
  counts: InterestDashboardCounts | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  reloadCounts: () => Promise<void>;
  unreadCount: number;
}

const AppSessionContext = createContext<AppSessionValue | null>(null);

let inFlightSessionLoad: Promise<void> | null = null;

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading, setProfileId } = useAuth();
  const [myProfile, setMyProfile] = useState<ProfileResponse | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [counts, setCounts] = useState<InterestDashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedForAuth = useRef(false);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setMyProfile(null);
      setSubscription(null);
      setCounts(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (inFlightSessionLoad) {
      await inFlightSessionLoad;
      return;
    }

    setLoading(true);
    setError(null);
    inFlightSessionLoad = (async () => {
      try {
        const [profile, sub] = await Promise.all([getMyProfile(), getCurrentSubscription()]);
        setMyProfile(profile);
        setSubscription(sub);
        setProfileId(profile?.id ?? null);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load session data');
      } finally {
        setLoading(false);
        inFlightSessionLoad = null;
      }
    })();
    await inFlightSessionLoad;
  }, [isAuthenticated, setProfileId]);

  const reloadCounts = useCallback(async () => {
    if (!myProfile) {
      setCounts(null);
      return;
    }
    try {
      setCounts(await getDashboardCounts());
    } catch {
      setCounts(null);
    }
  }, [myProfile]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      loadedForAuth.current = false;
      setMyProfile(null);
      setSubscription(null);
      setCounts(null);
      setLoading(false);
      setError(null);
      return;
    }
    if (loadedForAuth.current) return;
    loadedForAuth.current = true;
    void reload();
  }, [authLoading, isAuthenticated, reload]);

  const value = useMemo(
    () => ({
      myProfile,
      subscription,
      counts,
      loading: authLoading || loading,
      error,
      reload,
      reloadCounts,
      unreadCount: counts?.unreadNotifications ?? 0,
    }),
    [myProfile, subscription, counts, authLoading, loading, error, reload, reloadCounts],
  );

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession(): AppSessionValue {
  const ctx = useContext(AppSessionContext);
  if (!ctx) throw new Error('useAppSession must be used within AppSessionProvider');
  return ctx;
}
