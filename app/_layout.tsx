import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/theme';
import {
  registerForPushNotifications,
  scheduleDailyVerseNotification,
} from '../services/notificationService';
import { hasCompletedOnboarding } from '../services/onboardingService';

export default function RootLayout() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);

  useEffect(() => {
    setupNotifications();
  }, []);

  useEffect(() => {
    if (!navigationState?.key || checkedOnboarding) return;
    checkOnboarding();
  }, [navigationState?.key]);

  const checkOnboarding = async () => {
    const completed = await hasCompletedOnboarding();
    setCheckedOnboarding(true);
    if (!completed) {
      router.replace('/onboarding');
    }
  };

  const setupNotifications = async () => {
    const granted = await registerForPushNotifications();
    if (granted) {
      await scheduleDailyVerseNotification();
    }
  };

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.textLight,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="reader" options={{ headerShown: false }} />
        <Stack.Screen name="bookmarks" options={{ headerShown: false }} />
        <Stack.Screen name="sharecard" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
}