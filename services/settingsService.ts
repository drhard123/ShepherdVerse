import * as FileSystem from 'expo-file-system/legacy';

export type AppSettings = {
  translation: string;
  fontSize: number;
  darkMode: boolean;
  notifications: boolean;
  notificationTime: string;
  verseOfDay: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  translation: 'kjv',
  fontSize: 16,
  darkMode: false,
  notifications: true,
  notificationTime: '08:00',
  verseOfDay: true,
};

const SETTINGS_FILE = FileSystem.documentDirectory + 'settings.json';

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const info = await FileSystem.getInfoAsync(SETTINGS_FILE);
    if (info.exists) {
      const content = await FileSystem.readAsStringAsync(SETTINGS_FILE);
      return { ...DEFAULT_SETTINGS, ...JSON.parse(content) };
    }
    return DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await FileSystem.writeAsStringAsync(SETTINGS_FILE, JSON.stringify(settings));
  } catch (e) {
    console.error('saveSettings error:', e);
  }
};