import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/theme';
import {
  registerForPushNotifications,
  scheduleDailyVerseNotification,
} from '../services/notificationService';

export default function RootLayout() {
  useEffect(() => {
    setupNotifications();
  }, []);

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
      </Stack>
      <Toast />
    </>
  );
}