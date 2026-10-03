/**
 * Matrimony mobile — Phase 2 screens + matrimony-ui visual parity.
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/lib/auth/AuthContext';
import { LanguageProvider } from './src/lib/i18n/LanguageContext';
import { AppSessionProvider } from './src/lib/hooks/AppSessionContext';
import { ToastProvider } from './src/components/ui/toast';
import { RootNavigator } from './src/navigation/RootNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <AppSessionProvider>
              <RootNavigator />
            </AppSessionProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

export default App;
