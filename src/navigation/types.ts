import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOtp: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  Interests: undefined;
  Matches: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ProfileDetail: { profileId: number };
  EditProfile: undefined;
  CreateProfile: undefined;
  Photos: undefined;
  Preferences: undefined;
  Membership: undefined;
  Shortlists: undefined;
  ProfileViews: undefined;
  Blocks: undefined;
  Verify: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type AppScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;

export type TabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<AppStackParamList>
>;
