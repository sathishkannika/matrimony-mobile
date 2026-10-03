import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../lib/auth/AuthContext';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { Button } from '../components/ui/Button';
import { colors, fonts, spacing, type as typeScale } from '../theme/tokens';
import type { AuthStackParamList, AppStackParamList } from './types';
import { MainTabs } from './MainTabs';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PhotosScreen from '../screens/PhotosScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import MembershipScreen from '../screens/MembershipScreen';
import ShortlistsScreen from '../screens/ShortlistsScreen';
import ProfileViewsScreen from '../screens/ProfileViewsScreen';
import BlocksScreen from '../screens/BlocksScreen';
import VerifyScreen from '../screens/VerifyScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading, isLocked, unlockApp, hasProfile } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated && isLocked) {
    return (
      <View style={styles.center}>
        <Text style={styles.lockTitle}>{t('appName')} Locked</Text>
        <Button title="Unlock with Biometrics" onPress={unlockApp} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        hasProfile ? (
          <AppStack.Navigator screenOptions={{ headerShown: false }}>
            <AppStack.Screen name="MainTabs" component={MainTabs} />
            <AppStack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
            <AppStack.Screen name="EditProfile" component={EditProfileScreen} />
            <AppStack.Screen name="Photos" component={PhotosScreen} />
            <AppStack.Screen name="Preferences" component={PreferencesScreen} />
            <AppStack.Screen name="Membership" component={MembershipScreen} />
            <AppStack.Screen name="Shortlists" component={ShortlistsScreen} />
            <AppStack.Screen name="ProfileViews" component={ProfileViewsScreen} />
            <AppStack.Screen name="Blocks" component={BlocksScreen} />
            <AppStack.Screen name="Verify" component={VerifyScreen} />
          </AppStack.Navigator>
        ) : (
          <AppStack.Navigator screenOptions={{ headerShown: false }}>
            <AppStack.Screen name="CreateProfile" component={CreateProfileScreen} />
          </AppStack.Navigator>
        )
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
          <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.lg },
  lockTitle: { ...typeScale.h2, fontFamily: fonts.heading, marginBottom: spacing.md },
});
