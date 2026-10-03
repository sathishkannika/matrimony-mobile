import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bell, Heart, Home, Search, Settings, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSession } from '../lib/hooks/useAppSession';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { colors, fonts } from '../theme/tokens';
import { useResponsive } from '../theme/responsive';
import type { MainTabParamList } from './types';
import DashboardScreen from '../screens/DashboardScreen';
import SearchScreen from '../screens/SearchScreen';
import InterestsScreen from '../screens/InterestsScreen';
import MatchesScreen from '../screens/MatchesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function DashboardIcon({ color, size }: { color: string; size: number }) {
  return <Home color={color} size={size} />;
}
function SearchIcon({ color, size }: { color: string; size: number }) {
  return <Search color={color} size={size} />;
}
function InterestsIcon({ color, size }: { color: string; size: number }) {
  return <Heart color={color} size={size} />;
}
function MatchesIcon({ color, size }: { color: string; size: number }) {
  return <Users color={color} size={size} />;
}
function NotificationsIcon({ color, size }: { color: string; size: number }) {
  return <Bell color={color} size={size} />;
}
function SettingsIcon({ color, size }: { color: string; size: number }) {
  return <Settings color={color} size={size} />;
}

export function MainTabs() {
  const { t } = useTranslation();
  const { unreadCount } = useAppSession();
  const insets = useSafeAreaInsets();
  const { showTabLabels, compact } = useResponsive();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarAllowFontScaling: false,
        tabBarShowLabel: showTabLabels,
        tabBarLabelStyle: { fontFamily: fonts.bodySemibold, fontSize: compact ? 9 : 10 },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: (showTabLabels ? 56 : 48) + insets.bottom,
          paddingBottom: Math.max(6, insets.bottom),
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: t('dashboard'), tabBarIcon: DashboardIcon }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarLabel: t('search'), tabBarIcon: SearchIcon }}
      />
      <Tab.Screen
        name="Interests"
        component={InterestsScreen}
        options={{ tabBarLabel: t('interests'), tabBarIcon: InterestsIcon }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{ tabBarLabel: t('matches'), tabBarIcon: MatchesIcon }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: t('notifications'),
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarIcon: NotificationsIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: t('settings'), tabBarIcon: SettingsIcon }}
      />
    </Tab.Navigator>
  );
}
