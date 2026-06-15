import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDailyVerse } from './bibleApi';
import { loadSettings } from './settingsService';

// How notifications look when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async (): Promise<boolean> => {
  try {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-verse', {
        name: 'Daily Verse',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2C5F2E',
        sound: 'default',
      });
    }

    return true;
  } catch (e) {
    console.error('registerForPushNotifications error:', e);
    return false;
  }
};

export const scheduleDailyVerseNotification = async (): Promise<void> => {
  try {
    // Cancel existing scheduled notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const settings = await loadSettings();

    if (!settings.notifications) return;

    // Parse time from settings e.g. "08:00"
    const [hourStr, minuteStr] = settings.notificationTime.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    // Get a verse for the notification
    const verse = await getDailyVerse(settings.translation);
    const verseText = verse
      ? `"${verse.text.trim().substring(0, 100)}..." — ${verse.reference}`
      : 'Open ShepherdVerse for today\'s verse';

    // Schedule daily repeating notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 ShepherdVerse — Daily Verse',
        body: verseText,
        sound: 'default',
        data: { screen: 'home' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    console.log(`Daily notification scheduled for ${hour}:${minute < 10 ? '0' + minute : minute}`);
  } catch (e) {
    console.error('scheduleDailyVerseNotification error:', e);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const sendTestNotification = async (): Promise<void> => {
  try {
    const settings = await loadSettings();
    const verse = await getDailyVerse(settings.translation);
    const verseText = verse
      ? `"${verse.text.trim().substring(0, 100)}..." — ${verse.reference}`
      : 'God loves you!';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 ShepherdVerse — Daily Verse',
        body: verseText,
        sound: 'default',
        data: { screen: 'home' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
  } catch (e) {
    console.error('sendTestNotification error:', e);
  }
};