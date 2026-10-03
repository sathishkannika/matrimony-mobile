import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { hasStoredSession, updateStoredProfileId, type StoredAuthUser } from './secureStorage';
import { logout as apiLogout, refreshAccessToken } from '../api/auth';
import { biometricLock } from './biometricLock';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isLocked: boolean;
  user: StoredAuthUser | null;
  hasProfile: boolean;
  /** Call after a successful login()/register() API call has already saved tokens. */
  onSignedIn: (user: StoredAuthUser) => void;
  setProfileId: (profileId: number | null) => void;
  logout: () => Promise<void>;
  unlockApp: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [user, setUser] = useState<StoredAuthUser | null>(null);
  const biometricEnabledRef = useRef(false);

  const bootstrap = useCallback(async () => {
    const hasSession = await hasStoredSession();
    if (!hasSession) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    try {
      const restoredUser = await refreshAccessToken();
      setUser(restoredUser);
      setIsAuthenticated(true);
      biometricEnabledRef.current = await biometricLock.isSensorAvailable();
      setIsLocked(biometricEnabledRef.current);
    } catch {
      // Refresh token was invalid/expired/revoked (e.g. reuse-detected family revocation) —
      // refreshAccessToken() already clears local storage in that case.
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Re-lock whenever the app returns from background — matches Instagram/WhatsApp's app-lock
  // behavior. Only re-locks if a biometric sensor was available at sign-in time.
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'background' && isAuthenticated && biometricEnabledRef.current) {
        setIsLocked(true);
      }
    };
    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, [isAuthenticated]);

  const onSignedIn = useCallback((signedInUser: StoredAuthUser) => {
    setUser(signedInUser);
    setIsAuthenticated(true);
    setIsLocked(false);
    biometricLock.isSensorAvailable().then((available) => {
      biometricEnabledRef.current = available;
    });
  }, []);

  const setProfileId = useCallback((profileId: number | null) => {
    setUser((prev) => (prev ? { ...prev, profileId } : prev));
    void updateStoredProfileId(profileId);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setIsAuthenticated(false);
    setIsLocked(false);
  }, []);

  const unlockApp = useCallback(async (): Promise<boolean> => {
    const success = await biometricLock.authenticate();
    if (success) setIsLocked(false);
    return success;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isLocked,
        user,
        hasProfile: user?.profileId != null,
        onSignedIn,
        setProfileId,
        logout,
        unlockApp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
